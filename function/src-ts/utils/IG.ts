import axios, { AxiosResponse } from "axios";
import config from "../config";
import { MarketDataInterface } from "../entity/MarketData";
import { OrderEvent, DirectionTypes } from "../entity/OrderEvent";
import moment from "moment";

interface header {
  "Content-Type": String;
  Accept: String;
  Version: String;
  "X-IG-API-KEY": String;
  "X-SECURITY-TOKEN"?: String;
  CST?: String;
  _method?: String;
}

interface tokens {
  CST: String;
  "X-SECURITY-TOKEN": String;
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

interface Position {
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
  currentTokens: tokens;

  constructor() {
    this.igApiKey = config.ig.apiKey;
    this.igIdentifier = config.ig.identifier;
    this.igPassword = config.ig.password;
    this.igUrl = config.ig.url;
    this.headers = this.setHeaders();
  }

  public async connect(): Promise<tokens> {
    let body = { identifier: this.igIdentifier, password: this.igPassword };
    let loginResponse: AxiosResponse;
    try {
      loginResponse = await axios.post(this.igUrl + "/session", body, {
        headers: this.headers,
      });
      return {
        "X-SECURITY-TOKEN": loginResponse.headers["x-security-token"],
        CST: loginResponse.headers["cst"],
      };
    } catch (error) {
      console.log(error);
      throw new Error(`Could not connect to IG with error - ${error.response.status} ${JSON.stringify(error.response.data)}`);
    }
  }

  private async hydrateHeaders(): Promise<header> {
    this.currentTokens = await this.isConnected();
    this.headers.CST = this.currentTokens.CST;
    this.headers["X-SECURITY-TOKEN"] = this.currentTokens["X-SECURITY-TOKEN"];
    return this.headers;
  }

  public async isConnected(): Promise<tokens> {
    let sessionResponse: AxiosResponse;
    try {
      sessionResponse = await axios.get(`${this.igUrl}/session`, {
        headers: this.headers,
      });
      return {
        "X-SECURITY-TOKEN": sessionResponse.headers["x-security-token"],
        CST: sessionResponse.headers["cst"],
      };
    } catch (e) {
      this.headers["Version"] = "1";
      return await this.connect();
    }
  }

  public async closeConnection() {
    let deleteHeader = this.headers;
    deleteHeader._method = "DELETE";
    await axios.put(`${this.igUrl}/session`, null, { headers: deleteHeader });
  }

  public async getPrices(fxPair: string, resolution: resolutions): Promise<MarketDataInterface> {
    let headers = await this.hydrateHeaders();
    headers.Version = "3";
    let epic = this.getIgEpicFromPair(fxPair);
    let url = `${this.igUrl}/prices/${epic}?resolution=${resolutions[resolution]}&max=1`;
    let getDataResponse: AxiosResponse;
    try {
      getDataResponse = await axios.get(url, { headers: headers });
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
      throw new Error(`Could not fetch prices data for ${epic} with error - ${e.statusText}`);
    }
  }

  private setHeaders(): header {
    let headers: header;
    headers = {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
      Version: "1",
      "X-IG-API-KEY": this.igApiKey,
    };
    return headers;
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

  public async placeOrder(order: OrderEvent): Promise<string> {
    let headers = await this.hydrateHeaders();
    let orderTicket: OrderTicket = this.returnOrderTicket(order);
    console.log("Order ticket - ", JSON.stringify(orderTicket));
    try {
      let response = await axios.post(this.igUrl + "/deal/positions/otc", orderTicket, {
        headers: headers,
      });
      return response.data.dealReference;
    } catch (e) {
      throw new Error(`Could not place trade: ${e.statusText}`);
    }
  }

  public async getOpenPositions(): Promise<Array<Positions>> {
    let headers = await this.hydrateHeaders();
    let getPositionsResponse: AxiosResponse;
    let returnPositions: Array<Positions> = [];
    try {
      getPositionsResponse = await axios.get(`${this.igUrl}/deal/positions`, {
        headers: headers,
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
      throw new Error(`Could not get open positions: ${e.statusText}`);
    }
  }

  public async closePosition(position: Positions, order: OrderEvent): Promise<any> {
    let headers = await this.hydrateHeaders();
    let getCloseResponse: AxiosResponse;
    headers.Version = "1";
    let body = {
      dealId: position.position.dealId,
      direction: order.direction == DirectionTypes.LONG ? "BUY" : "SELL",
      expiry: "-",
      size: position.position.size,
      orderType: "MARKET",
    };
    try {
      getCloseResponse = await axios.delete(`${this.igUrl}/positions/otc`, { data: body, headers: headers });
      return getCloseResponse.data.dealReference;
    } catch (e) {
      throw new Error(`Could not close position: ${e.statusText}`);
    }
  }

  public async getDealDetails(dealReference: string) {
    //to-do
  }

  public returnOrderTicket(order: OrderEvent): OrderTicket {
    return {
      currencyCode: "USD",
      direction: order.direction == DirectionTypes.LONG ? "BUY" : "SELL",
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
}
