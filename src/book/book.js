const assert = require('assert').strict;
const { v4 } = require('uuid');

class Book {
  constructor(id, title, author) {
    assert(title, 'title is a mandatory field');
    assert(author, 'author is a mandatory field');

    this.id = id || v4();
    this.title = title;
    this.author = author;
  }
}

function bookFromJson(json) {
  return new Book(json.id, json.title, json.author);
}

module.exports = {
  Book,
  bookFromJson
};
