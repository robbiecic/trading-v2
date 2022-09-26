import { AxiosResponse } from "axios";
import { OrderEvent, DirectionTypes } from "../entity/OrderEvent";
import Broker, { Positions, igEpics, Confirms } from "./Broker";

export interface OrderTicket {
  currencyCode: string;
  direction: string;
  epic: igEpics;
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

interface header {
  "Content-Type": String;
  Accept: String;
  Version: String;
  "X-IG-API-KEY": String;
  Authorization?: String;
  _method?: String;
  "IG-ACCOUNT-ID"?: String;
}

export enum resolutions {
  MINUTE_10 = "MINUTE_10",
}

export default class IG extends Broker {
  igApiKey: String;
  igIdentifier: String;
  igPassword: String;
  igUrl: String;
  headers: header;

  constructor() {
    super();
  }

  public async init(): Promise<void> {
    const igCreds = await super.getApiSecrets();
    this.igApiKey = igCreds.apiKey;
    this.igIdentifier = igCreds.identifier;
    this.igPassword = igCreds.password;
    this.igUrl = igCreds.url;
    this.setHeaders();
  }

  public async connect(): Promise<void> {
    console.log("Attempting to connect to IG...");
    let body = { identifier: this.igIdentifier, password: this.igPassword };
    this.headers.Version = "3";
    try {
      const { data } = await this.axios.post(`${this.igUrl}/session`, body, {
        headers: this.headers,
      });
      this.headers.Authorization = `Bearer ${data.oauthToken.access_token}`;
      this.headers["IG-ACCOUNT-ID"] = data.accountId;
    } catch (error) {
      throw new Error(`Cannot connect to IG with ${JSON.stringify(error)}`);
    }
  }

  public async closeConnection(): Promise<void> {
    let deleteHeader = this.headers;
    deleteHeader._method = "DELETE";
    await this.axios.put(`${this.igUrl}/session`, null, { headers: deleteHeader });
  }

  public async placeOrder(order: OrderEvent): Promise<string> {
    this.headers.Version = "2";
    let orderTicket: OrderTicket = this.returnOrderTicket(order);
    console.log("Order ticket - ", JSON.stringify(orderTicket));
    try {
      let response = await this.axios.post(`${this.igUrl}/positions/otc`, orderTicket, {
        headers: this.headers,
      });
      return response.data.dealReference;
    } catch (e) {
      throw new Error(`Could not place trade: ${JSON.stringify(e)}`);
    }
  }

  public async getOpenPositions(pair: string): Promise<Array<Positions>> {
    let getPositionsResponse: AxiosResponse;
    let returnPositions: Array<Positions> = [];
    this.headers.Version = "2";
    const epic = this.getEpicFromPair(pair);
    try {
      getPositionsResponse = await this.axios.get(`${this.igUrl}/positions`, {
        headers: this.headers,
      });
      getPositionsResponse.data.positions.forEach((position: { position: any; market: any }) => {
        let igEpic: igEpics = position.market.epic as igEpics;
        if (epic == igEpic) {
          returnPositions.push({
            position: position.position,
            market: {
              instrumentName: position.market.instrumentName,
              expiry: position.market.expiry,
              epic: igEpic,
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
        }
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
      getCloseResponse = await this.axios.post(`${this.igUrl}/positions/otc`, body, { headers: this.headers });
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
      const getCloseResponse = await this.axios.get(`${this.igUrl}/confirms/${dealReference}`, { headers: this.headers });
      returnData = {
        date: new Date(getCloseResponse.data.date),
        status: getCloseResponse.data.status,
        reason: getCloseResponse.data.reason,
        dealStatus: getCloseResponse.data.dealStatus,
        epic: getCloseResponse.data.epic as igEpics,
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
      epic: this.getEpicFromPair(order.pair),
      expiry: "-",
      size: super.returnSizeAmount(order.pair),
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

  public setHeaders(): void {
    this.headers = {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
      Version: "1",
      "X-IG-API-KEY": this.igApiKey,
    };
  }

  public getEpicFromPair(fxPair: string): igEpics {
    switch (fxPair) {
      case "AUD/USD": {
        return igEpics.AUDUSD;
      }
      case "EUR/USD": {
        return igEpics.EURUSD;
      }
      case "USD/JPY": {
        return igEpics.USDJPY;
      }
    }
  }

  public getPairFromEpic(epic: igEpics): string {
    switch (epic) {
      case igEpics.AUDUSD: {
        return "AUD/USD";
      }
      case igEpics.EURUSD: {
        return "EUR/USD";
      }
      case igEpics.USDJPY: {
        return "USD/JPY";
      }
    }
  }
}
