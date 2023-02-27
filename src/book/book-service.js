const { bookFromJson } = require('./book');

class BookService {
  // eslint-disable-next-line class-methods-use-this
  async receive(event) {
    return Promise.resolve(bookFromJson(event));
  }
}

module.exports = {
  BookService
};
