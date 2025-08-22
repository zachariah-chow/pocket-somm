/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: 'pocket-somm',
      home: 'aws',
      providers: { aws: { region: 'ap-southeast-1', profile: 'pocket-somme' } },
      removal: input?.stage === 'prod' ? 'retain' : 'remove',
    };
  },
  async run() {
    const uploads = new sst.aws.Bucket('UploadsBucket', {
      cors: {
        allowOrigins: ['*'], // tighten to domain later
        allowMethods: ['PUT', 'GET', 'HEAD', 'POST'],
        allowHeaders: ['*'],
      },
    });

    const wines = new sst.aws.Dynamo('Wines', {
      fields: { wineId: 'string', canonicalKey: 'string' },
      primaryIndex: { hashKey: 'wineId' },
      globalIndexes: { ByCanonicalKey: { hashKey: 'canonicalKey' } },
    });

    const retailers = new sst.aws.Dynamo('Retailers', {
      fields: { retailerId: 'string', slug: 'string' },
      primaryIndex: { hashKey: 'retailerId' },
      globalIndexes: { BySlug: { hashKey: 'slug' } },
    });

    const listings = new sst.aws.Dynamo('Listings', {
      fields: {
        retailerId: 'string',
        listingId: 'string',
        wineId: 'string',
        price: 'number',
        updatedAt: 'number',
      },
      primaryIndex: { hashKey: 'retailerId', rangeKey: 'listingId' },
      globalIndexes: {
        ByWine: { hashKey: 'wineId', rangeKey: 'price' },
        ByUpdatedAt: { hashKey: 'retailerId', rangeKey: 'updatedAt' },
      },
    });

    const web = new sst.aws.Nextjs('PocketSomme', {
      path: 'apps/web',
      link: [uploads, wines, retailers, listings],
    });

    return {
      websiteUrl: web.url,
      uploadsBucket: uploads.name,
      winesTable: wines.name,
      retailersTable: retailers.name,
      listingsTable: listings.name,
    };
  },
});
