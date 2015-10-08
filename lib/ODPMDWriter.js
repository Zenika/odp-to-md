'use strict';

function ODPMDWriter() {
  this.text = "";
  this.inCodeBlock = false;
  this.inNotes = false;
  this.listLevel = 0;
  this.mainTitleAdded = false;
  this.firstPage = false;
  this.titreAdded = false;
}

ODPMDWriter.prototype.addPage = function () {
  this.text += "\n\n\n\n";
  this.titreAdded = false;
  this.firstPage = true;
};

ODPMDWriter.prototype.addParagraph = function () {
  if (this.inCodeBlock || this.inNotes) {
    this.text += "\n";
  }
};

ODPMDWriter.prototype.endParagraph = function () {};

ODPMDWriter.prototype.addText = function (text) {
  if (this.firstPage && !this.mainTitleAdded) {
    this.text = '# ' + text + '\n\n<!-- .slide: class="page-title" -->\n\n\n\n';
    this.mainTitleAdded = true;
  } else if (!this.titreAdded) {
    this.text += "## " + text + "\n";
    this.titreAdded = true;
  } else {
    this.text += text;
  }
};

ODPMDWriter.prototype.addImage = function (path) {
  this.text += "\n\n![](ressources/images/" + path.replace("Pictures/", "") + ")\n";
};

ODPMDWriter.prototype.startList = function () {
  this.listLevel++;
  if (this.listLevel === 1 && this.text[this.text.length - 1] !== '\n') {
    this.text += '\n';
  }
};

ODPMDWriter.prototype.endList = function () {
  this.listLevel--;
  this.text += '\n';
};

ODPMDWriter.prototype.addBullet = function () {
  if (!this.listLevel) {
    console.warning("not in a list");
  }
  this.text += "\n" + new Array(this.listLevel).join("\t") + "- ";
};

ODPMDWriter.prototype.endBullet = function () {};

ODPMDWriter.prototype.addEnd = function () {
  this.text += "\n\n\n\n<!-- .slide: class=\"page-questions\" -->\n\n\n\n<!-- .slide: class=\"page-tp1\" -->";
};

ODPMDWriter.prototype.startCodeBlock = function () {
  this.tmp = this.text;
  this.text = "";
  if (this.tmp[this.tmp.length - 1] !== '\n') {
    this.text += "\n";
  }
  this.text += "\n```";
  this.inCodeBlock = true;
};

ODPMDWriter.prototype.endCodeBlock = function () {
  this.text += "\n```\n";
  this.inCodeBlock = false;
  var codeBlock = this.text;
  this.text = this.tmp;
  this.text += codeBlock.replace(/\n{3}/g, "\n\n");
};

ODPMDWriter.prototype.startNotes = function () {
  this.text += "\nNotes :\n";
  this.inNotes = true;
};

ODPMDWriter.prototype.endNotes = function () {
  this.inNotes = false;
};

ODPMDWriter.prototype.startTable = function () {
  this.inTable = true;
  this.rowNumber = 0;
  this.colNumber = 0;
};

ODPMDWriter.prototype.endTable = function () {
  this.inTable = false;
};

ODPMDWriter.prototype.startRow = function () {
  this.text += "\n|";
  if (this.rowNumber === 1) {
    //If header was written we write separation line
    this.text += new Array(this.colNumber + 1).join("---|") + "\n|";
  }
  this.rowNumber++;
};

ODPMDWriter.prototype.closeCell = function () {
  if (this.rowNumber === 1) {
    this.colNumber++;
  }
  this.text += "|";
};

ODPMDWriter.prototype.startTitle = function () {};

ODPMDWriter.prototype.endTitle = function () {};

ODPMDWriter.prototype.lineBreak = function () {
  this.text += "  \n";
};

module.exports = ODPMDWriter;
