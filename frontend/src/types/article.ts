export interface Article {
  id: string;
  title: string;
  author: string;
  authorPaymentAddress: string; // BSV address where writer receives payment
  subject: string;
  wordCount: number;
  price: number; // in satoshis
  preview: string;
  fullContent: string;
  isPurchased: boolean;
  txid?: string; // Transaction ID for purchased articles
}
