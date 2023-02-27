const Handler = require('../../src/read-book-event');

const event = {
  Records: [
    {
      messageId: '24db3c2d-d84d-410b-8dd0-6bb3a7240de6',
      receiptHandle: '5GmwsC58Mo',
      body: {
        version: '0',
        id: 'c75a618c-e910-232a-b361-94871fbe0fc4',
        title: 'Test Book',
        author: 'John Doe'
      }
    },
    {
      messageId: '34db3c2d-d84d-410b-8dd0-6bb3a7240de6',
      receiptHandle: '6GmwsC58Mo',
      body: {
        version: '0',
        id: 'aa5a618c-e910-232a-b361-94871fbe0fc4',
        title: 'Test Book - 2',
        author: 'John Doe'
      }
    }
  ]
};

it('will check the behavior of a new transaction with no error', async () => {
  try {
    Handler.handler(event)
      .then((response) => {
        console.log(response);
        expect.arrayContaining(response);
        expect(response.length).toEqual(2);
        console.log('Test successful');
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log('Encountered error', error);
  }
});
