const { BookService } = require('../book/book-service');

const service = new BookService();

exports.handler = async (event) => {
  console.log({ Event: event });

  return event.Records.map((record) => {
    let actualEvent = record.body;
    if (typeof actualEvent !== 'object') {
      actualEvent = JSON.parse(record.body);
    }
    return service.receive(actualEvent);
  });
};
