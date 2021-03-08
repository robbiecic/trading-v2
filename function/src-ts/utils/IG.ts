import axios, { AxiosInstance, AxiosResponse } from "axios";
import config from "../config";
import { MarketDataInterface } from "../entity/MarketData";
import { OrderEvent, DirectionTypes } from "../entity/OrderEvent";
import moment from "moment";
import * as rax from "retry-axios";

const instance: AxiosInstance = axios.create({
  baseURL: config.ig.url,
});

//This will force failed axios requests to retry 3 times by default, 500ms apart
instance.defaults.raxConfig = {
  instance: instance,
  retryDelay: 500,
};

const interceptorId = rax.attach(instance);

interface header {
  "Content-Type": String;
  Accept: String;
  Version: String;
  "X-IG-API-KEY": String;
  Authorization?: String;
  _method?: String;
  "IG-ACCOUNT-ID"?: String;
}

export enum epics {
  AUDUSD = "CS.D.AUDUSD.MINI.IP",
  EURUSD = "CS.D.EURUSD.MINI.IP",
  USDJPY = "CS.D.USDJPY.MINI.IP",
}

export enum resolutions {
  MINUTE_10 = "MINUTE_10",
}

export interface OrderTicket {
  currencyCode: string;
  direction: string;
  epic: epics;
  expiry: string;
  size: number;
  forceOpen: boolean;
  orderType: string;
  level: number;
  limitDistance: number;
  limitLevel: number;
  stopDistance: number;
  stopLevel: number;
  guaranteedStop: boolean;
  timeInForce: string;
  trailingStop?: boolean;
  trailingStopIncrement?: number;
}

export interface Position {
  contractSize: number;
  createdDate: string;
  createdDateUTC: string;
  dealId: string;
  dealReference: string;
  size: number;
  direction: string;
  limitLevel: number;
  level: number;
  currency: string;
  controlledRisk: boolean;
  stopLevel: number;
  trailingStep: number;
  trailingStopDistance: number;
  limitedRiskPremium: number;
}

interface Market {
  instrumentName: string;
  expiry: string;
  epic: epics;
  instrumentType: string;
  lotSize: number;
  high: number;
  low: number;
  percentageChange: number;
  netChange: number;
  bid: number;
  offer: number;
  updateTime: string;
  updateTimeUTC: string;
  delayTime: number;
  streamingPricesAvailable: boolean;
  marketStatus: string;
  scalingFactor: number;
}

export interface Confirms {
  date: Date;
  status: string;
  reason: string;
  dealStatus: string;
  epic: epics;
  expiry: string;
  dealReference: string;
  dealId: string;
  affectedDeals: Array<any>;
  level: number;
  size: number;
  direction: string;
  stopLevel: number;
  limitLevel: number;
  stopDistance: number;
  limitDistance: number;
  guaranteedStop: boolean;
  trailingStop: boolean;
  profit: number;
  profitCurrency: string;
}

export interface Positions {
  position: Position;
  market: Market;
}

export default class IG {
  igApiKey: String;
  igIdentifier: String;
  igPassword: String;
  igUrl: String;
  headers: header;

  constructor() {
    this.igApiKey = config.ig.apiKey;
    this.igIdentifier = config.ig.identifier;
    this.igPassword = config.ig.password;
    this.igUrl = config.ig.url;
    this.setHeaders();
  }

  public async connect(): Promise<void> {
    console.log("Attempting to connect to IG...");
    let body = { identifier: this.igIdentifier, password: this.igPassword };
    this.headers.Version = "3";
    try {
      const { data } = await instance.post("/session", body, {
        headers: this.headers,
      });
      this.headers.Authorization = `Bearer ${data.oauthToken.access_token}`;
      this.headers["IG-ACCOUNT-ID"] = data.accountId;
      console.log(`Session headers are ${this.headers}`);
    } catch (error) {
      console.log(`Cannot connect to IG with ${JSON.stringify(error)}`);
      throw new Error(`Cannot connect to IG with ${JSON.stringify(error)}`);
    }
  }

  public async closeConnection() {
    let deleteHeader = this.headers;
    deleteHeader._method = "DELETE";
    await instance.put(`/session`, null, { headers: deleteHeader });
  }

  public async getPrices(fxPair: string, resolution: resolutions): Promise<MarketDataInterface> {
    // await this.hydrateHeaders();
    this.headers.Version = "3";
    let epic = this.getIgEpicFromPair(fxPair);
    let url = `/prices/${epic}?resolution=${resolutions[resolution]}&max=1`;
    let getDataResponse: AxiosResponse;
    try {
      getDataResponse = await instance.get(url, { headers: this.headers });
      let data = getDataResponse.data.prices[0];
      let priceData: MarketDataInterface = {
        pair: fxPair,
        dateTime: new Date(data.snapshotTime),
        snapshotTimeUTC: new Date(data.snapshotTimeUTC),
        openPrice: data.openPrice.ask,
        closePrice: data.closePrice.ask,
        highPrice: data.highPrice.ask,
        lowPrice: data.lowPrice.ask,
        lastTradedVolume: data.lastTradedVolume,
        insertStamp: new Date(moment().format("YYYY-MM-DD HH:mm:ss")),
      };
      console.log(`Prices for ${epic} are ${JSON.stringify(priceData)}`);
      return priceData;
    } catch (e) {
      throw new Error(`Could not fetch prices data for ${epic} with error - ${JSON.stringify(e)}`);
    }
  }

  public async placeOrder(order: OrderEvent): Promise<string> {
    this.headers.Version = "2";
    let orderTicket: OrderTicket = this.returnOrderTicket(order);
    console.log("Order ticket - ", JSON.stringify(orderTicket));
    console.log(`Headers - ${JSON.stringify(this.headers)}`);
    try {
      let response = await instance.post("/positions/otc", orderTicket, {
        headers: this.headers,
      });
      return response.data.dealReference;
    } catch (e) {
      throw new Error(`Could not place trade: ${JSON.stringify(e)}`);
    }
  }

  public async getOpenPositions(): Promise<Array<Positions>> {
    let getPositionsResponse: AxiosResponse;
    let returnPositions: Array<Positions> = [];
    this.headers.Version = "2";
    try {
      getPositionsResponse = await instance.get(`/positions`, {
        headers: this.headers,
      });
      getPositionsResponse.data.positions.forEach((position: { position: any; market: any }) => {
        let stringEpic: string = position.market.epic;
        returnPositions.push({
          position: position.position,
          market: {
            instrumentName: position.market.instrumentName,
            expiry: position.market.expiry,
            epic: stringEpic as epics,
            instrumentType: position.market.instrumentType,
            lotSize: position.market.lotSize,
            high: position.market.high,
            low: position.market.low,
            percentageChange: position.market.percentageChange,
            netChange: position.market.netChange,
            bid: position.market.bid,
            offer: position.market.offer,
            updateTime: position.market.updateTime,
            updateTimeUTC: position.market.updateTimeUTC,
            delayTime: position.market.delayTime,
            streamingPricesAvailable: position.market.streamingPricesAvailable,
            marketStatus: position.market.marketStatus,
            scalingFactor: position.market.scalingFactor,
          },
        });
      });
      return returnPositions;
    } catch (e) {
      throw new Error(`Could not get open positions: ${JSON.stringify(e)}`);
    }
  }

  public async closePosition(position: Positions, order: OrderEvent): Promise<string> {
    let getCloseResponse: AxiosResponse;
    this.headers.Version = "1";
    this.headers._method = "DELETE";
    let body = {
      dealId: position.position.dealId,
      direction: order.direction == DirectionTypes.LONG ? "SELL" : "BUY",
      size: position.position.size.toString(),
      orderType: "MARKET",
    };
    console.log(`Closing trading with body - ${JSON.stringify(body)}`);
    try {
      getCloseResponse = await instance.post(`/positions/otc`, body, { headers: this.headers });
      delete this.headers._method;
      return getCloseResponse.data.dealReference;
    } catch (e) {
      throw new Error(`Could not close position: ${JSON.stringify(e)}`);
    }
  }

  public async getDealDetails(dealReference: string): Promise<Confirms> {
    this.headers.Version = "1";
    let returnData: Confirms;
    try {
      const getCloseResponse = await instance.get(`/confirms/${dealReference}`, { headers: this.headers });
      returnData = {
        date: new Date(getCloseResponse.data.date),
        status: getCloseResponse.data.status,
        reason: getCloseResponse.data.reason,
        dealStatus: getCloseResponse.data.dealStatus,
        epic: getCloseResponse.data.epic as epics,
        expiry: getCloseResponse.data.expiry,
        dealReference: getCloseResponse.data.dealReference,
        dealId: getCloseResponse.data.dealId,
        affectedDeals: getCloseResponse.data.affectedDeals,
        level: getCloseResponse.data.level,
        size: getCloseResponse.data.size,
        direction: getCloseResponse.data.direction,
        stopLevel: getCloseResponse.data.stopLevel,
        limitLevel: getCloseResponse.data.limitLevel,
        stopDistance: getCloseResponse.data.stopDistance,
        limitDistance: getCloseResponse.data.limitDistance,
        guaranteedStop: getCloseResponse.data.guaranteedStop,
        trailingStop: getCloseResponse.data.trailingStop,
        profit: getCloseResponse.data.profit,
        profitCurrency: getCloseResponse.data.profitCurrency,
      };
      return returnData;
    } catch (e) {
      throw new Error(`Could not get deal reference details: ${JSON.stringify(e)}`);
    }
  }

  public returnOrderTicket(order: OrderEvent): OrderTicket {
    return {
      currencyCode: this.returnCurrency(order.pair),
      direction: order.direction === DirectionTypes.LONG ? "BUY" : "SELL",
      epic: this.getIgEpicFromPair(order.pair),
      expiry: "-",
      size: config.ig.unitsPerTrade || 1,
      forceOpen: true,
      orderType: "MARKET",
      level: null,
      limitDistance: null,
      limitLevel: null,
      stopDistance: null,
      stopLevel: null,
      guaranteedStop: false,
      timeInForce: "FILL_OR_KILL",
    };
  }

  private returnCurrency(pair: string): string {
    switch (pair) {
      case "AUD/USD":
        return "USD";
      case "EUR/USD":
        return "USD";
      case "USD/JPY":
        return "JPY";
      default:
        break;
    }
  }

  private setHeaders() {
    this.headers = {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
      Version: "1",
      "X-IG-API-KEY": this.igApiKey,
    };
  }

  public getIgEpicFromPair(fxPair: string): epics {
    switch (fxPair) {
      case "AUD/USD": {
        return epics.AUDUSD;
      }
      case "EUR/USD": {
        return epics.EURUSD;
      }
      case "USD/JPY": {
        return epics.USDJPY;
      }
    }
  }

  public getPairFromEpic(epic: epics): string {
    switch (epic) {
      case epics.AUDUSD: {
        return "AUD/USD";
      }
      case epics.EURUSD: {
        return "EUR/USD";
      }
      case epics.USDJPY: {
        return "USD/JPY";
      }
    }
  }
}
