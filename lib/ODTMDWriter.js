'use strict';

function ODTMDWriter() {
  this.text = "";
  this.inCodeBlock = false;
  this.inNotes = false;
  this.listLevel = 0;
  this.mainTitleAdded = false;
  this.firstPage = false;
  this.titleLevel = 0;

  this.currentTitle = "first_page";
  this.pages = [];
}


ODTMDWriter.prototype.addPage = function () {
  this.text += "\n\n\n\n";
  this.mainTitleAdded = false;
  this.firstPage = true;
};

ODTMDWriter.prototype.addParagraph = function () {
  //this.text += "\n";
};

ODTMDWriter.prototype.lineBreak = function () {
  this.text += "  \n";
};

ODTMDWriter.prototype.endParagraph = function () {
  if (!this.listLevel) {
    this.text += "  \n";
  }
};

ODTMDWriter.prototype.startTitle = function (level) {
  if (level === 1) {
    this.newFile();
  }
  this.text += new Array(level + 2).join("#") + " ";
  this.titleLevel = level;
};

ODTMDWriter.prototype.newFile = function () {
  this.pages.push({
    title: this.currentTitle,
    text: this.text
  });
  this.text = "";
  this.currentTitle = "";
};

ODTMDWriter.prototype.endTitle = function () {
  this.titleLevel = 0;
  this.text += "\n\n";
};

ODTMDWriter.prototype.addText = function (text) {
  if (this.titleLevel === 1) {
    this.currentTitle += text;
  }

  if (this.firstPage && !this.mainTitleAdded) {
    this.text = '#' + text + '\n\n<!-- .slide: class="page-title" -->\n\n\n\n';
    this.mainTitleAdded = true;
  } else {
    this.text += text;
  }
};

ODTMDWriter.prototype.addImage = function (path) {
  this.text += "\n\n![](ressources/images/" + path.replace("Pictures/", "") + ")\n";
};

ODTMDWriter.prototype.startList = function () {
  this.listLevel++;
  if (this.text[this.text.length - 1] !== '\n') {
    this.text += '\n';
  }
};

ODTMDWriter.prototype.endList = function () {
  this.listLevel--;
  this.text += '\n';
};

ODTMDWriter.prototype.addBullet = function () {
  if (!this.listLevel) {
    console.warning("not in a list");
  }
  this.text += new Array(this.listLevel).join("\t") + "- ";
};

ODTMDWriter.prototype.endBullet = function () {
  this.text += "\n";
};

ODTMDWriter.prototype.addEnd = function () {
  this.newFile();
};

ODTMDWriter.prototype.startCodeBlock = function () {
  this.tmp = this.text;
  this.text = "";
  if (this.tmp[this.tmp.length - 1] !== '\n') {
    this.text += "\n";
  }
  this.text += "\n```";
  this.inCodeBlock = true;
};

ODTMDWriter.prototype.endCodeBlock = function () {
  this.text += "\n```\n";
  this.inCodeBlock = false;
  var codeBlock = this.text;
  this.text = this.tmp;
  this.text += codeBlock.replace(/\n{3}/g, "\n\n");
};

ODTMDWriter.prototype.startTable = function () {
  this.inTable = true;
  this.rowNumber = 0;
  this.colNumber = 0;
};

ODTMDWriter.prototype.endTable = function () {
  this.inTable = false;
};

ODTMDWriter.prototype.startRow = function () {
  this.text += "\n|";
  if (this.rowNumber == 1) {
    //If header was written we write separation line
    this.text += new Array(this.colNumber + 1).join("---|") + "\n|";
  }
  this.rowNumber++;
};

ODTMDWriter.prototype.closeCell = function () {
  if (this.rowNumber == 1) {
    this.colNumber++;
  }
  this.text += "|";
};


module.exports = ODTMDWriter;
