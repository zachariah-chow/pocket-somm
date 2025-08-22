export type Wine = {
  wineId: string;
  canonicalKey: string;
  producer: string;
  cuvee: string;
  vintage?: number;
  country?: string;
  region?: string;
  grapes?: string[];
  color?: 'red' | 'white' | 'rose' | 'sparkling' | 'orange';
  style?: string;
};

export type Retailer = {
  retailerId: string;
  slug: string;
  name: string;
  website?: string;
  currency?: 'SGD';
};

export type Listing = {
  retailerId: string;
  listingId: string; // wineId#volume
  wineId: string;
  volumeMl: number;
  price: number;
  currency: 'SGD';
  inStock: boolean;
  url?: string;
  updatedAt: number;
  source?: 'manual' | 'scrape' | 'api';
};
