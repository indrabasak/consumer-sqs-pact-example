// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();
// eslint-disable-next-line import/no-extraneous-dependencies
const { MessageProviderPact } = require('@pact-foundation/pact');
const { Book } = require('../../src/book/book');

describe('Message provider tests', () => {
  const baseOpts = {
    logLevel: 'INFO',
    providerVersion: process.env.GIT_COMMIT,
    providerVersionTags: process.env.GIT_BRANCH ? [process.env.GIT_BRANCH] : []
  };

  // For builds triggered by a 'contract content changed' webhook,
  // just verify the changed pact. The URL will have been passed in
  // from the webhook to the CI job.
  const pactChangedOpts = {
    pactUrls: [process.env.PACT_URL]
  };

  // For 'normal' provider builds, fetch `master` and `prod` pacts for this provider
  const fetchPactsDynamicallyOpts = {
    provider: 'provider-sqs-pact-example',
    consumerVersionTags: ['master', 'prod', 'main'], // the old way of specifying which pacts to verify
    // consumerVersionSelectors: [{ tag: 'master', latest: true }, { tag: 'prod', latest: true } ], // the new way of specifying which pacts to verify
    pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
    enablePending: true
  };

  const book = new Book(null, 'Test Book', 'John Doe');
  console.log(book);

  const opts = {
    ...baseOpts,
    ...(process.env.PACT_URL ? pactChangedOpts : fetchPactsDynamicallyOpts),
    messageProviders: {
      'a new book creation': () => book
    }
  };

  const pact = new MessageProviderPact(opts);
  // const messagePact = new MessageProviderPact({
  //   messageProviders: {
  //     "a hero created message": () =>
  //       CreateHeroEventProducer.produceHeroCreatedEvent()
  //   },
  //   log: path.resolve(process.cwd(), "logs", "pact.log"),
  //   logLevel: "info",
  //   provider: "node-message-provider",
  //   pactBrokerUrl: "https://test.pact.dius.com.au/",
  //   pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
  //   pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
  //   publishVerificationResult: true,
  //   providerVersion: "1.0.0"
  // });

  describe('send an event', () => {
    it('a book creation', () => {
      return pact.verify();
    });
  });
});
