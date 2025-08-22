/// <reference path="../../../.sst/platform/config.d.ts" />
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';

const now = () => Date.now();

const wines = [
  {
    wineId: 'w-1',
    canonicalKey: 'domaine-sample|bourgogne-rouge|2021',
    producer: 'Domaine Sample',
    cuvee: 'Bourgogne Rouge',
    vintage: 2021,
    country: 'France',
    region: 'Burgundy',
    color: 'red',
  },
  {
    wineId: 'w-2',
    canonicalKey: 'riesling-house|kabinett|2022',
    producer: 'Riesling House',
    cuvee: 'Kabinett',
    vintage: 2022,
    country: 'Germany',
    region: 'Mosel',
    color: 'white',
    style: 'off-dry',
  },
];

const retailers = [
  {
    retailerId: 'r-1',
    slug: 'vinoteca-sg',
    name: 'Vinoteca SG',
    website: 'https://example-1.sg',
    currency: 'SGD',
  },
  {
    retailerId: 'r-2',
    slug: 'neighbour-bottles',
    name: 'Neighbour Bottles',
    website: 'https://example-2.sg',
    currency: 'SGD',
  },
];

const listings = [
  {
    retailerId: 'r-1',
    wineId: 'w-1',
    volumeMl: 750,
    price: 78,
    inStock: true,
    url: 'https://example-1.sg/w-1',
  },
  {
    retailerId: 'r-2',
    wineId: 'w-1',
    volumeMl: 750,
    price: 74,
    inStock: false,
    url: 'https://example-2.sg/w-1',
  },
  {
    retailerId: 'r-1',
    wineId: 'w-2',
    volumeMl: 750,
    price: 52,
    inStock: true,
    url: 'https://example-1.sg/w-2',
  },
].map((x) => ({
  ...x,
  listingId: `${x.wineId}#${x.volumeMl}`,
  currency: 'SGD' as const,
  updatedAt: now(),
  source: 'manual' as const,
}));

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function table(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}. Export it or pass via CI.`);
  return v;
}

const WINES = table('WINES_TABLE');
const RETAILERS = table('RETAILERS_TABLE');
const LISTINGS = table('LISTINGS_TABLE');

async function batchPut(table: string, items: any[]) {
  for (let i = 0; i < items.length; i += 25) {
    const group = items.slice(i, i + 25);
    await ddb.send(
      new BatchWriteCommand({
        RequestItems: {
          [table]: group.map((Item) => ({ PutRequest: { Item } })),
        },
      }),
    );
  }
}

async function main() {
  await batchPut(WINES, wines);
  await batchPut(RETAILERS, retailers);
  await batchPut(LISTINGS, listings);
  console.log('Seed complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
