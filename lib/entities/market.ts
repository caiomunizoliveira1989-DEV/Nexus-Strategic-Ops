export interface PriceQuote {
  id: string;
  crop: string;
  region: string;
  pricePerKg: number;
  currency: string;
  date: string;
  source: string;
}

export interface MarketListing {
  id: string;
  producerId: string;
  crop: string;
  volumeKg: number;
  askingPrice: number;
  availableFrom: string;
  status: 'open' | 'reserved' | 'closed';
}

export interface LogisticsLoss {
  id: string;
  listingId: string;
  lostKg: number;
  reason: 'transport' | 'storage' | 'delay' | 'quality';
  costBRL: number;
}
