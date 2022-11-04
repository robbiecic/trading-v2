import AWS from "aws-sdk";
import config from "../config";
import { OrderEvent } from "../entity/OrderEvent";
import axios, { AxiosInstance } from "axios";

interface apiConfig {
  identifier: string;
  password: string;
  url: string;
  apiKey: string;
  tradingAccountId?: Number;
}

export enum igEpics {
  AUDUSD = "CS.D.AUDUSD.MINI.IP",
  EURUSD = "CS.D.EURUSD.MINI.IP",
  USDJPY = "CS.D.USDJPY.MINI.IP",
}

export enum ciEpics {
  AUDUSD = 400494179,
  EURUSD = 154290,
  USDJPY = 154303,
}

export interface Position {
  contractSize: number;
  createdDate?: string;
  createdDateUTC: string;
  dealId: string;
  dealReference: string;
  size: number;
  direction: string;
  limitLevel: number;
  level: number;
  currency: string;
  controlledRisk?: boolean;
  stopLevel?: number;
  trailingStep?: number;
  trailingStopDistance?: number;
  limitedRiskPremium?: number;
}

interface Market {
  instrumentName: string;
  expiry: string;
  epic: igEpics | ciEpics;
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

export interface Confirms {
  date: Date;
  status: string;
  reason: string;
  dealStatus: string;
  epic: igEpics | ciEpics;
  expiry?: string;
  dealReference: string;
  dealId: string;
  affectedDeals?: Array<any>;
  level: number;
  size: number;
  direction: string;
  stopLevel?: number;
  limitLevel?: number;
  stopDistance?: number;
  limitDistance?: number;
  guaranteedStop?: boolean;
  trailingStop?: boolean;
  profit: number;
  profitCurrency: string;
}

export default class Broker {
  axios: AxiosInstance;

  constructor() {
    this.axios = axios.create();
    this.axios.interceptors.request.use(function (config) {
      console.info(`API Request details - ${JSON.stringify(config)}`);
      return config;
    });
  }

  protected async getApiSecrets(): Promise<apiConfig> {
    const region = "ap-southeast-2";
    var client = new AWS.SecretsManager({
      region: region,
    });
    const credentials = await client.getSecretValue({ SecretId: config.apiDetails.apiSecretName }).promise();
    const credentialsJson = JSON.parse(credentials.SecretString);
    return {
      identifier: credentialsJson.IG_REST_IDENTIFIER,
      password: credentialsJson.IG_REST_PASSWORD,
      url: credentialsJson.IG_REST_URL,
      apiKey: credentialsJson.IG_REST_API_KEY,
    };
  }

  protected returnSizeAmount(pair: string): number {
    switch (pair) {
      case "AUD/USD":
        return config.apiDetails.unitsAUDUSD || 1;
      case "EUR/USD":
        return config.apiDetails.unitsEURUSD || 1;
      case "USD/JPY":
        return config.apiDetails.unitsUSDJPY || 1;
      default:
        break;
    }
  }

  public getEpicFromPair(pair: string): igEpics | ciEpics {
    return null;
  }

  public getPairFromEpic(epic: igEpics | ciEpics): string {
    return "epic";
  }

  public async init(): Promise<void> {}

  public setHeaders(): void {}

  public async connect(): Promise<void> {}

  public async closeConnection(): Promise<void> {}

  public async placeOrder(order: OrderEvent): Promise<string> {
    return "dummyorder";
  }

  public async closePosition(position: Positions, order: OrderEvent): Promise<string> {
    return "orderid";
  }

  public async getOpenPositions(pair: string): Promise<Array<Positions>> {
    return [];
  }

  public returnOrderTicket(order: OrderEvent): any {
    // The order ticket return type depends on the broker
  }

  public async getDealDetails(dealReference: string): Promise<Confirms> {
    return {} as Confirms;
  }
}
