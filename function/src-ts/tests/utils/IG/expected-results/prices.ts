import { MarketDataInterface } from "../../../../entity/MarketData";
import moment from "moment";

export const expectedPrices: MarketDataInterface = {
  dateTime: new Date("2021/02/27 06:50:00"),
  snapshotTimeUTC: new Date("2021-02-26T19:50:00"),
  pair: "AUD/USD",
  openPrice: 1.20888,
  closePrice: 1.20787,
  highPrice: 1.20888,
  lowPrice: 1.2077,
  lastTradedVolume: 1826,
  insertStamp: new Date(moment().format("YYYY-MM-DD HH:mm:ss")),
};
