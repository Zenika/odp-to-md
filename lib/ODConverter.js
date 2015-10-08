var odpMdWriter = require('./ODPMDWriter');
var odtMdWriter = require('./ODTMDWriter');
var Promise = require('bluebird');
var path = require('path');
var sax = require('sax');
var AdmZip = require('adm-zip');
var fs = Promise.promisifyAll(require('fs'));
var _ = require('lodash');

var imageOutputSubFolder = 'ressources/images';

module.exports.convert = function (sourceFilePath, outputFolder, splitFiles) {
  return Promise.try(function () {

    var extension = path.extname(sourceFilePath);

    if (extension !== '.odp' && extension !== '.odt') {
      throw new Error('fichier non supporté ' + extension);
    }

    var mdWriter = createWriter(extension);

    var outputFileName = toFileName(path.basename(sourceFilePath, extension));
    var contentName = path.join(outputFolder, outputFileName + '-content.xml');

    extractOd(sourceFilePath, outputFileName, contentName, outputFolder);

    return convertToMd(contentName, outputFileName, mdWriter, outputFolder, splitFiles);
  });
};

function createWriter(extension) {
  var mdWriter;
  if (extension === '.odp') {
    mdWriter = new odpMdWriter();
  } else if (extension === '.odt') {
    mdWriter = new odtMdWriter();
  } else {
    throw new Error('fichier non supporté ' + extension);
  }
  return mdWriter;
}

function toFileName(name) {
  return name.toLowerCase().replace(/[\s-]+/g, '_').replace(/_{2,}/g, "_");
}

function extractOd(sourceFilePath, outputFileName, contentName, outputFolder) {
  console.log('extract : ' + sourceFilePath);

  var zip = new AdmZip(sourceFilePath);
  var zipEntries = zip.getEntries();
  zipEntries.forEach(function (entry) {

    // console.log(entry.entryName);

    // extract text content
    if (entry.entryName.indexOf('content.xml') >= 0) {
      extractContent(zip, entry, outputFolder, contentName);
    }
    // extract pictures
    else if (entry.entryName.indexOf('Pictures') >= 0) {
      extractPictures(zip, entry, outputFolder, outputFileName);
    }
    // extract object
    else if (entry.entryName.indexOf('ObjectReplacements') >= 0) {
      extractObjectReplacements(zip, entry, outputFolder, outputFileName);
    }

  });
}

function extractContent(zip, entry, outputFolder, contentName) {
  zip.extractEntryTo(entry, outputFolder, true, true);
  fs.renameSync(path.join(outputFolder, entry.entryName), contentName);
}

function extractPictures(zip, entry, outputFolder, outputFileName) {
  zip.extractEntryTo(entry, path.join(outputFolder, imageOutputSubFolder), false, true);
  var baseName = path.basename(entry.entryName);
  fs.renameSync(path.join(outputFolder, imageOutputSubFolder, baseName), path.join(outputFolder, imageOutputSubFolder, outputFileName + '-' + baseName));
}

function extractObjectReplacements(zip, entry, outputFolder, outputFileName) {
  zip.extractEntryTo(entry, path.join(outputFolder, imageOutputSubFolder), false, true);
  var baseName = path.basename(entry.entryName);
  fs.renameSync(path.join(outputFolder, imageOutputSubFolder, baseName), path.join(outputFolder, imageOutputSubFolder, outputFileName + '-' + toFileName(baseName) + '.svm'));
}

function buildObjectReplacementsFilename(nameReference) {
  return toFileName(nameReference.replace('./ObjectReplacements/', '')) + '.svm';
}

function convertToMd(contentName, outputFileName, mdWriter, outDir, splitFiles) {
  return new Promise(function (resolve, reject) {

    var saxStream = sax.createStream(true, {
      trim: false,
      normalize: true,
      xmlns: false,
      lowercase: true
    });

    saxStream.on('opentag', function (node) {

      if (node.name === 'draw:page') {
        mdWriter.addPage();
      } else if (node.name === 'draw:image') {
        var nameReference = node.attributes['xlink:href'];

        if (nameReference.indexOf('ObjectReplacements') >= 0) {
          nameReference = buildObjectReplacementsFilename(nameReference);
        }

        mdWriter.addImage(outputFileName + '-' + nameReference);
      } else if (node.name === 'text:list') {
        mdWriter.startList();
      } else if (node.name === 'text:list-item') {
        mdWriter.addBullet();
      } else if (node.name === 'draw:custom-shape' || node.name === 'draw:rect') {
        mdWriter.startCodeBlock();
      } else if (node.name === 'text:p') {
        mdWriter.addParagraph();
      } else if (node.name === 'text:h') {
        mdWriter.startTitle(parseInt(node.attributes['text:outline-level']));
      } else if (node.name === 'presentation:notes') {
        mdWriter.startNotes();
      } else if (node.name === 'table:table') {
        mdWriter.startTable();
      } else if (node.name === 'table:table-row') {
        mdWriter.startRow();
      } else if (node.name === 'text:line-break') {
        mdWriter.lineBreak();
      } else {
        // console.log('opentag:', node.name, node);
      }

    });

    saxStream.on('closetag', function (node) {

      if (node === 'draw:custom-shape' || node === 'draw:rect') {
        mdWriter.endCodeBlock();
      } else if (node === 'text:list') {
        mdWriter.endList();
      } else if (node === 'presentation:notes') {
        mdWriter.endNotes();
      } else if (node === 'table:table') {
        mdWriter.endTable();
      } else if (node === 'table:table-cell') {
        mdWriter.closeCell();
      } else if (node === 'text:p') {
        mdWriter.endParagraph();
      } else if (node === 'text:h') {
        mdWriter.endTitle();
      } else if (node === 'text:list-item') {
        mdWriter.endBullet();
      } else {
        // console.log('closetag:', node);
      }

    });

    saxStream.on('end', function () {
      console.log('end');
      mdWriter.addEnd();
    });

    saxStream.on('text', function (text) {
      mdWriter.addText(text);
    });

    fs.createReadStream(contentName)
      .once('readable', function () {
        console.log('convert : ' + outputFileName);
      })
      .pipe(saxStream)
      .on('end', function () {
        resolve(mdWriter);
      })
      .on('error', reject);

  }).then(function (mdWriter) {

    fs.unlink(contentName);

    var promise;
    var pageNames = [];

    if (!splitFiles && mdWriter.pages) {
      mdWriter.text = _.map(mdWriter.pages, function (page) {
        return page.text;
      }).join('');
    }

    if (mdWriter.text) {
      var outMdName = outputFileName + '.md';
      var outPath = path.join(outDir, outMdName);
      pageNames.push(outMdName);
      console.log('write to ' + outPath);
      promise = fs.writeFileAsync(outPath, mdWriter.text);
    } else if (mdWriter.pages) {
      promise = Promise.all(_.map(mdWriter.pages, function (page) {
        var outMdName = toFileName(page.title) + '.md';
        var outPath = path.join(outDir, outMdName);
        pageNames.push(outMdName);
        console.log('write to ' + outPath);
        return fs.writeFileAsync(outPath, page.text);
      }));
    }

    return promise.then(function () {
      return pageNames;
    });
  });
}
