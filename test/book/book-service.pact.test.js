const {
  Matchers,
  MessageConsumerPact,
  asynchronousBodyHandler
} = require('@pact-foundation/pact');
const path = require('path');
const { BookService } = require('../../src/book/book-service');

const { like } = Matchers;

describe('book event handler', () => {
  const messagePact = new MessageConsumerPact({
    consumer: 'consumer-sqs-pact-example',
    dir: path.resolve(process.cwd(), 'pacts'),
    pactfileWriteMode: 'update',
    provider: process.env.PACT_PROVIDER
      ? process.env.PACT_PROVIDER
      : 'provider-sqs-pact-example',
    logLevel: 'info'
  });

  describe('receive a book update', () => {
    it('accepts a book event', () => {
      return messagePact
        .expectsToReceive('a book event update')
        .withContent({
          id: like('some-uuid-1234-5678'),
          title: like('Some Book'),
          author: like('Some Author')
        })
        .verify(asynchronousBodyHandler(new BookService().receive));
    });
  });
});
