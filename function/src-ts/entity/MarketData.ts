export interface MarketDataInterface {
  dateTime: Date;
  snapshotTimeUTC: Date;
  pair?: string;
  openPrice: Number;
  closePrice: Number;
  highPrice: Number;
  lowPrice: Number;
  lastTradedVolume: Number;
  insertStamp: Date;
}
