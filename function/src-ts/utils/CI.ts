import { AxiosResponse } from "axios";
import { DirectionTypes, OrderEvent } from "../entity/OrderEvent";
import Broker, { Positions, ciEpics, Confirms } from "./Broker";
import returnOrderStatusReason from "./CI_orderStatus";
import ls, { LightstreamerClient } from "lightstreamer-client-node";

interface Headers {
  Session?: string;
  Username: string;
  "Content-type": string;
}

interface Prices {
  bid: number;
  offer: number;
}

interface ListTradeHistoryResponseDTO {
  TradeHistory: Array<ApiTradeHistoryDTO>;
  SupplementalOpenOrders: ApiTradeHistoryDTO;
}

interface ApiOrderResponseDTO {
  OrderId: number; // Order ID.
  StatusReason: number; //Order status reason ID. The table of lookup codes can be found at Lookup Values.
  Status: number; // Order status ID. The table of lookup codes can be found at Lookup Values.
  OrderTypeId: number; // Order type ID. The table of lookup codes can be found at Lookup Values.
  Price: number; // Order fill price.
  Quantity: number; // Order quantity
  TriggerPrice?: number; // Trigger price, if applicable
  CommissionCharge?: number; // Commission charge.
  IfDone?: Array<any>; //	ApiIfDoneResponseDTO	List of If/Done orders.
  GuaranteedPremium?: number; // Premium for guaranteed orders.
  OCO: any; //	ApiOrderResponseDTO	An order in an OCO relationship with this order.
  AssociatedOrders?: any; //	ApiAssociatedResponseDTO	Associated orders that are linked to this order. An associated order is linked to a net position rather than to specific individual trades.
  Associated?: boolean; //	boolean	Flag to indicate if this is an associated order.
}

interface ApiTradeHistoryDTO {
  OrderId: number;
  OpeningOrderIds: Array<number>; // The orders that are being closed / part closed by this order.
  MarketId: number;
  MarketName: string;
  Direction: string;
  OriginalQuantity: number;
  Quantity: number;
  Price: number;
  TradingAccountId: number;
  Currency: string;
  RealisedPnl: number;
  RealisedPnlCurrency: string;
  LastChangedDateTimeUtc: string;
  ExecutedDateTimeUtc: string;
  TradeReference: string;
  ManagedTrades: Array<any>;
  OrderReference: string;
  Source: string;
  IsCloseBy: boolean;
  Liquidation: boolean;
  FixedInitalMargin: number;
}

export interface ListOpenPositionsResponseDTO {
  OpenPositions: Array<ApiOpenPositionDTO>;
}

export interface ApiOpenPositionDTO {
  OrderId: number; // The order's unique identifier.
  AutoRollover: Boolean; // Flag to indicate whether the trade will automatically roll into the next market interval when the current market interval expires. Only applies to markets where the underlying is a futures contract.
  MarketId: Number; // The market's unique identifier.
  MarketName: string; // The market's name.
  Direction: string; //Buy or Sell
  Quantity: number; // Size of the order/trade.
  Price?: number; // The price / rate that the trade was opened at.
  TradingAccountId: Number; // The ID of the trading account associated with the trade/order request.
  Currency: string; // Currency to place order in.
  Status: number; // The order status. The table of lookup codes can be found at Lookup Values.
  StopOrder?: any; // The stop order attached to this order.
  LimitOrder?: any; // The limit order attached to this order.
  LastChangedDateTimeUTC: string; // Represents the date and time when the trade/order was last edited in UNIX time format. Note: does not include things such as the current market price.
  CreatedDateTimeUTC: string; // The date and time that the order was created in UNIX time format. This can be the time an active order was created, which then become an open position after a fill. Alternatively, this can be the time a market order was executed.
  ExecutedDateTimeUTC: string; // The date time that the order executed initially in UNIX time format. This does not include any partial closures. This can be the time an active order was created, which then become an open position after a fill. Alternatively, this can be the time a market order was executed.
  TradeReference: string; // An alternative trade reference.
  ManagedTrades?: any; // The list of constituent trades for Trading Advisor managed positions (if applicable).
  AllocationProfileId?: Number; // The identifier of the allocation profile that was used to create the open position, where applicable. (Used by Trade Advisor accounts).
  AllocationProfileName?: string; // The name of the allocation profile that was used to create the open position, where applicable. (Used by Trade Advisor accounts).
  AssociatedOrders?: any; // The associated orders linked to this open position. An associated order is linked to a net position rather than to specific individual trades.
  FixedInitalMargin?: Number; // The fixed amount of trading resources used to place the trade.
  PositionMethodId?: Number;
}

export interface OrderTicket {
  MarketId: ciEpics; // The unique identifier for a market.
  Currency: string; // Currency to place order in.
  AutoRollover: false; // Flag to indicate whether the trade will automatically roll into the next market interval when the current market interval expires. Only applies to markets where the underlying is a futures contract.
  Direction: string; //Buy or Sell
  Quantity: number; // Size of the order/trade.
  QuoteId?: Number; // The unique quote identifier.
  PositionMethodId?: 1 | 2; // Indicates the position of the trade. 1 == LongOrShortOnly, 2 == LongAndShort.
  BidPrice: Number; // Market prices are quoted as a pair (buy/sell or bid/offer), the BidPrice is the lower value of the pair.
  OfferPrice: Number; // Market prices are quote as a pair (buy/sell or bid/offer), the OfferPrice is the higher value of the pair.
  AuditId: string; // Unique identifier for each price tick. Read this value from the prices stream. Treat it as a unique but random string.
  TradingAccountId: Number; // The ID of the trading account associated with the trade/order request.
  IfDone?: Array<any>; // List of If/Done Orders that will be filled when the initial trade/order is triggered. (Optional).
  Close: Array<string>; // List of existing open trade order IDs that require part or full closure.
  Reference: string; // A reference code to identify the source origin of the trade order request. API calls should use the string: GCAPI.
  AllocationProfileId?: Number; // ID of the allocation profile to use if this is a Trading Advisor trade.
  OrderReference?: string; // The order reference for this new trade request - only applicable where source is set. (Optional).
  Source?: string; // The source of the trade order request. (Optional).
  PriceTolerance?: Number; //Sets the amount of slippage you are willing to accept to get the trade executed. Values are in the range 0 - 1000.
}

export default class CI extends Broker {
  ciApiKey: String;
  ciIdentifier: string;
  ciPassword: string;
  ciUrl: String;
  headers: Headers;
  tradingAccountId: Number;
  lsClient: ls.LightstreamerClient;
  confirmsArray: Array<Confirms>;

  constructor() {
    super();
  }

  public async init(): Promise<void> {
    const ciCreds = await super.getApiSecrets();
    this.name = "CI";
    this.ciApiKey = ciCreds.apiKey;
    this.ciIdentifier = ciCreds.identifier;
    this.ciPassword = ciCreds.password;
    this.ciUrl = ciCreds.url; // https://ciapi.cityindex.com/TradingAPI
    this.tradingAccountId = ciCreds.tradingAccountId;
    this.headers = {
      Username: ciCreds.identifier,
      "Content-type": "application/json",
    };
    this.confirmsArray = [];
    // this.lsClient = new ls.LightstreamerClient("https://push.cityindex.com", "STREAMINGALL");
  }

  public async connect(): Promise<void> {
    console.log("Attempting to connect to CI...");
    let body = {
      UserName: this.ciIdentifier,
      Password: this.ciPassword,
      AppVersion: "1",
      AppComments: "",
      AppKey: this.ciApiKey,
    };
    try {
      let { data } = await this.axios.post(`${this.ciUrl}/session`, body, {
        headers: this.headers,
      });
      this.headers.Session = data.Session;
      await this.setTradingAccountID();
      // await this.connectToLightStream(this.ciIdentifier, data.Session);
    } catch (error) {
      throw new Error(`Cannot connect to CI with ${JSON.stringify(error)}`);
    }
  }

  private async connectToLightStream(user: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Connect to light streamer client
      this.lsClient.connectionDetails.setUser(user);
      this.lsClient.connectionDetails.setPassword(password);

      this.lsClient.addListener({
        onStatusChange: function (newStatus) {
          newStatus == "CONNECTED" ? resolve() : console.log(newStatus);
        },
        onServerError: function (errorCode, errorMessage) {
          reject(`Could not connect to LightStream server failed with error code ${errorCode} and message ${errorMessage}`);
        },
      });

      this.lsClient.connect();
    });
  }

  private subscribeToPriceInfo(): void {
    var mySubscription = new ls.Subscription("MERGE", [`PRICES.PRICE.${ciEpics.AUDUSD.toString()}`], ["Bid", "Offer"]);

    mySubscription.addListener({
      onSubscription: function () {
        console.log("SUBSCRIBED");
      },
      onUnsubscription: function () {
        console.log("UNSUBSCRIBED");
      },
      onItemUpdate: function (obj) {
        console.log(obj.getValue("stock_name") + ": " + obj.getValue("last_price"));
      },
    });

    this.lsClient.subscribe(mySubscription);
  }

  private async setTradingAccountID(): Promise<void> {
    try {
      const { data } = await this.axios.get(`${this.ciUrl}/useraccount/ClientAndTradingAccount`, { headers: this.headers });
      this.tradingAccountId = data.TradingAccounts[0].TradingAccountId;
    } catch (error) {
      throw new Error(`Cannot fetch trading account id with ${JSON.stringify(error)}`);
    }
  }

  private async marketSearch(): Promise<void> {
    try {
      const { data } = await this.axios.get(`${this.ciUrl}/market/search?SearchByMarketName=TRUE&Query=USD%2FJPY&MaxResults=10`, {
        headers: this.headers,
      });
      console.log(`Market Search results = ${JSON.stringify(data)}`);
    } catch (error) {
      throw new Error(`Cannot complete market search - ${JSON.stringify(error)}`);
    }
  }

  public async closeConnection(): Promise<void> {
    await this.axios.post(`${this.ciUrl}/deleteSession`, this.headers);
  }

  public async placeOrder(order: OrderEvent): Promise<string> {
    const positions = await this.getOpenPositions(order.pair);
    // Count the number of open long or short directions only
    const igDirection = order.direction == DirectionTypes.SHORT ? "SELL" : "BUY";
    const positionsOrderType = positions.filter((a) => a.position.direction == igDirection);
    console.log(`positionsOrderType = ${positionsOrderType.length}`);
    let orderTicket: OrderTicket = await this.returnOrderTicket(order, positionsOrderType.length);
    console.log("Order ticket - ", JSON.stringify(orderTicket));
    try {
      let response = await this.axios.post(`${this.ciUrl}/order/newtradeorder`, orderTicket, {
        headers: this.headers,
      });
      console.log(`Place order API response ${JSON.stringify(response.data)}`);
      console.log(`Overral status reason = ${returnOrderStatusReason(response.data.StatusReason)}`);
      console.log(`Specific status reason = ${returnOrderStatusReason(response.data.Orders[0].StatusReason)}`);
      this.appendOrderToConfirmsArray(order, response.data.Orders[0]);
      return response.data.OrderId;
    } catch (e) {
      throw new Error(`Could not place trade: ${JSON.stringify(e)}`);
    }
  }

  private appendOrderToConfirmsArray(order: OrderEvent, orderResponse: ApiOrderResponseDTO): void {
    try {
      console.log(`Attempting to push into confirms array ${JSON.stringify(orderResponse)}`);
      const confirms: Confirms = {
        date: new Date(),
        status: returnOrderStatusReason(orderResponse.StatusReason),
        reason: returnOrderStatusReason(orderResponse.StatusReason),
        dealStatus: returnOrderStatusReason(orderResponse.StatusReason),
        epic: this.getEpicFromPair(order.pair),
        expiry: null,
        dealReference: String(orderResponse.OrderId),
        dealId: String(orderResponse.OrderId),
        affectedDeals: null,
        level: orderResponse.Price,
        size: orderResponse.Quantity,
        direction: order.direction,
        stopLevel: null,
        limitLevel: null,
        stopDistance: null,
        limitDistance: null,
        guaranteedStop: null,
        trailingStop: null,
        profit: 0,
        profitCurrency: "AUD",
      };
      console.log(`confirms = ${JSON.stringify(confirms)}`);
      this.confirmsArray.push(confirms);
    } catch (error) {
      throw new Error(`Could not append order into Confirms array - ${JSON.stringify(error)}`);
    }
  }

  public async returnOrderTicket(order: OrderEvent, numberOpenPositions: number): Promise<OrderTicket> {
    const priceData = await this.getLatestPriceData(order);
    return {
      MarketId: this.getEpicFromPair(order.pair),
      Currency: "USD",
      AutoRollover: false,
      Direction: order.direction == DirectionTypes.LONG ? "buy" : "sell",
      Quantity: super.returnSizeAmount(order.pair, numberOpenPositions) * 10000, // CI trades in who units not fractions, so need to multiple by 10k.
      QuoteId: null,
      PositionMethodId: 2, // 1 == LongOrShortOnly, 2 == LongAndShort.
      BidPrice: priceData.bid,
      OfferPrice: priceData.offer,
      AuditId: this.generateAuditId(order),
      TradingAccountId: this.tradingAccountId,
      IfDone: [],
      Close: null,
      Reference: "GCAPI",
      AllocationProfileId: null,
      OrderReference: null,
      Source: null,
      PriceTolerance: 1000, // Market order
    };
  }

  public async getOpenPositions(pair: string): Promise<Array<Positions>> {
    let getPositionsResponse: AxiosResponse;
    let returnPositions: Array<Positions> = [];
    const epic = this.getEpicFromPair(pair);
    try {
      getPositionsResponse = await this.axios.get(`${this.ciUrl}/order/openpositions`, {
        headers: this.headers,
      });
      console.log(`Fetching open positions for ${pair}`);
      console.log(`Open positions CI API resposne ${JSON.stringify(getPositionsResponse.data)}`);
      const data: ListOpenPositionsResponseDTO = getPositionsResponse.data;
      data.OpenPositions.forEach((order) => {
        if (pair == order.MarketName.slice(0, 7)) {
          returnPositions.push({
            position: {
              dealReference: order.TradeReference,
              contractSize: order.Quantity,
              createdDate: order.CreatedDateTimeUTC,
              createdDateUTC: order.CreatedDateTimeUTC,
              dealId: String(order.OrderId),
              size: order.Quantity,
              direction: order.Direction == "buy" ? "BUY" : "SELL",
              limitLevel: order.Price,
              level: order.Price,
              currency: order.Currency,
            },
            market: {
              instrumentName: order.MarketName,
              expiry: null,
              epic: epic,
              instrumentType: null,
              lotSize: order.Quantity,
              high: null,
              low: null,
              percentageChange: null,
              netChange: null,
              bid: null,
              offer: null,
              updateTime: null,
              updateTimeUTC: order.LastChangedDateTimeUTC,
              delayTime: null,
              streamingPricesAvailable: null,
              marketStatus: null,
              scalingFactor: null,
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
    let orderTicket = await this.returnOrderTicket(order, 1); // The 1 is redundant as the quantity is changed below
    orderTicket.Close = [position.position.dealId];
    orderTicket.Quantity = position.position.size;
    // Inverse the direction to close the trade
    orderTicket.Direction = orderTicket.Direction == "buy" ? "sell" : "buy";
    console.log(`Closing trading with body - ${JSON.stringify(orderTicket)}`);
    try {
      getCloseResponse = await this.axios.post(`${this.ciUrl}/order/newtradeorder`, orderTicket, { headers: this.headers });
      this.appendOrderToConfirmsArray(order, getCloseResponse.data.Orders[0]);
      return getCloseResponse.data.OrderId;
    } catch (e) {
      throw new Error(`Could not close position: ${JSON.stringify(e)}`);
    }
  }

  public async closeMultiplePositions(positions: Array<Positions>, order: OrderEvent): Promise<string[]> {
    let orderTicket = await this.returnOrderTicket(order, 1);
    const closePositionsIntoChunks = this.returnCloseOrderChunks(positions, 5000000);
    const orderTicketChunks = this.returnOrderTicketChunks(orderTicket, closePositionsIntoChunks);
    const promises = this.returnCloseOrderChunksAPIOrderRequests(orderTicketChunks, order);
    return await Promise.all(promises);
  }

  public returnCloseOrderChunks(positions: Array<Positions>, CIOrderSizeLimit: number): Array<Array<Positions>> {
    // We have an array of positions, we want to split this array by Quantity/Blobsize
    const totalQuantity = positions.map((position) => position.position.contractSize).reduce((a, b) => a + b);
    const chunkSize = Math.ceil(totalQuantity / CIOrderSizeLimit);
    const positionsIntoChunks = this.chunkIntoN(positions, chunkSize);
    console.info(`Our total position size is ${totalQuantity}, and we will divide into ${chunkSize} chunks`);
    return positionsIntoChunks;
  }

  public returnOrderTicketChunks(orderTicket: OrderTicket, positionsChunks: Positions[][]): OrderTicket[] {
    // Inverse the direction to close the trade
    orderTicket.Direction = orderTicket.Direction == "buy" ? "sell" : "buy";
    let orderTicketCunks: OrderTicket[] = [];
    for (let position of positionsChunks) {
      let orderTicketTemp = orderTicket;
      // List all open contracts we want to close in this chunk
      orderTicketTemp.Close = position.map((position) => position.position.dealId);
      // Override quantity with the TOTAL position size of this chunk
      orderTicketTemp.Quantity = position.map((position) => position.position.contractSize).reduce((a, b) => a + b);
      // Add new orderTicket to array of orderTickets
      orderTicketCunks.push({ ...orderTicketTemp });
    }
    return orderTicketCunks;
  }

  public returnCloseOrderChunksAPIOrderRequests(orderTickets: OrderTicket[], order: OrderEvent): Promise<string>[] {
    const promises = [];
    for (let orderTicket of orderTickets) {
      promises.push(this.closeOrderRequest(orderTicket, order));
    }
    return promises;
  }

  private chunkIntoN(array: Array<Positions>, chunks: number): Array<Array<Positions>> {
    const size = Math.ceil(array.length / chunks);
    return Array.from({ length: chunks }, (v, i) => array.slice(i * size, i * size + size));
  }

  private async closeOrderRequest(orderTicket: OrderTicket, order: OrderEvent): Promise<string> {
    let getCloseResponse: AxiosResponse;
    console.log(`Closing trading with body - ${JSON.stringify(orderTicket)}`);
    try {
      getCloseResponse = await this.axios.post(`${this.ciUrl}/order/newtradeorder`, orderTicket, { headers: this.headers });
      console.info(`CI API responce to Close order - ${JSON.stringify(getCloseResponse.data)}`);
      this.appendOrderToConfirmsArray(order, getCloseResponse.data.Orders[0]);
      return getCloseResponse.data.OrderId;
    } catch (e) {
      throw new Error(`Could not close position: ${JSON.stringify(e)}`);
    }
  }

  public async getDealDetails(dealReference: string): Promise<Confirms> {
    try {
      const returnConfirm = this.confirmsArray.filter((confirm) => confirm.dealReference == dealReference);
      return returnConfirm[0];
    } catch (e) {
      throw new Error(`Could not get deal reference details: ${JSON.stringify(e)}`);
    }
  }

  public async getLatestPriceData(order: OrderEvent): Promise<Prices> {
    const marketId = this.getEpicFromPair(order.pair);
    let prices = {} as Prices;
    const promises = [];
    try {
      promises.push(
        this.axios.get(`${this.ciUrl}/market/${marketId}/barhistory?interval=MINUTE&span=1&PriceBars=1&priceType=ASK`, {
          headers: this.headers,
        })
      );
      promises.push(
        this.axios.get(`${this.ciUrl}/market/${marketId}/barhistory?interval=MINUTE&span=1&PriceBars=1&priceType=BID`, {
          headers: this.headers,
        })
      );
      const results = await Promise.all(promises);
      for (let result of results) {
        result.config.url.indexOf("priceType=ASK") > 0 ? (prices.offer = result.data.PartialPriceBar.Close) : null;
        result.config.url.indexOf("priceType=BID") > 0 ? (prices.bid = result.data.PartialPriceBar.Close) : null;
      }
      return prices;
    } catch (e) {
      throw new Error(`Could not get price data: ${JSON.stringify(e)}`);
    }
  }

  public getEpicFromPair(pair: string): ciEpics {
    switch (pair) {
      case "AUD/USD": {
        return ciEpics.AUDUSD;
      }
      case "EUR/USD": {
        return ciEpics.EURUSD;
      }
      case "USD/JPY": {
        return ciEpics.USDJPY;
      }
    }
  }

  public getPairFromEpic(epic: ciEpics): string {
    switch (epic) {
      case ciEpics.AUDUSD: {
        return "AUD/USD";
      }
      case ciEpics.EURUSD: {
        return "EUR/USD";
      }
      case ciEpics.USDJPY: {
        return "USD/JPY";
      }
    }
  }

  private generateAuditId(order: OrderEvent): string {
    // CI|Open|AUD/USD|LONG|0.7654|2022-09-19T14:40:00.000Z
    return `CI|${order.actionType}|${order.pair}|${order.direction}|${order.priceTarget}|${order.orderDateUTC.toISOString()}`;
  }
}
