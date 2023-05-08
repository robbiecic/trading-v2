import CI, { OrderTicket } from "../../../utils/CI";
import { ciEpics } from "../../../utils/Broker";
import { OrderEvent, ActionTypes, DirectionTypes } from "../../../entity/OrderEvent";
import { mocked } from "ts-jest/utils";
import axios from "axios";
import { orderCloseSuccessResponse } from "./api-responses/order-success";
import { mockResponse } from "./factories";
import { orderQuoteResponse } from "./api-responses/order-quote-response";

const ci = new CI();
Object.defineProperty(ci, "headers", { value: jest.fn() });
Object.defineProperty(ci, "tradingAccountId", { value: 123456 });

//Set up of axios mock
const mockedAxios = mocked(axios, true);
jest.mock("axios", () => ({
  defaults: {
    baseURL: "test",
    raxConfig: {},
  },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
  create: () => axios,
  get: jest.fn(() => Promise),
  post: jest.fn(() => Promise),
}));
jest.mock("retry-axios", () => ({
  attach: () => 12345,
}));

const orderEventCloseLong: OrderEvent = {
  actionType: ActionTypes.Close,
  direction: DirectionTypes.LONG,
  pair: "AUD/USD",
  orderDateUTC: new Date(),
  priceTarget: 0.761,
};

const orderTicket: OrderTicket = {
  MarketId: ciEpics.AUDUSD,
  Currency: "USD",
  AutoRollover: false,
  Direction: "sell",
  Quantity: 10000,
  QuoteId: null,
  PositionMethodId: 2,
  BidPrice: 0.652,
  OfferPrice: 0.653,
  AuditId: `CI|Open|AUD/USD|LONG|0.761|${new Date().toISOString()}`,
  TradingAccountId: 123456,
  IfDone: [],
  Close: ["123456"],
  Reference: "GCAPI",
  AllocationProfileId: null,
  OrderReference: null,
  Source: null,
  PriceTolerance: 1000,
};

describe("CI test for closing orders", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Test - closeOrderRequest(), expect successful order Id to be returned without quote", async () => {
    // Mock first request with successful response
    mockedAxios.post.mockResolvedValueOnce(mockResponse.build({ data: orderCloseSuccessResponse }));
    let spyappendOrderToConfirmsArray = jest.spyOn(ci, "appendOrderToConfirmsArray").mockImplementation(() => null);
    const orderIdResponse = await ci.closeOrderRequest(orderTicket, orderEventCloseLong);
    expect(orderIdResponse).toEqual(882672565);
  });

  it("Test - closeOrderRequest(), expect quote Id to be returned", async () => {
    // Mock first request with quote response
    mockedAxios.post.mockResolvedValueOnce(mockResponse.build({ data: orderQuoteResponse }));
    // Mock send request with successful response
    mockedAxios.post.mockResolvedValueOnce(mockResponse.build({ data: orderCloseSuccessResponse }));
    let spyappendOrderToConfirmsArray = jest.spyOn(ci, "appendOrderToConfirmsArray").mockImplementation(() => null);
    const orderIdResponse = await ci.closeOrderRequest(orderTicket, orderEventCloseLong);
    expect(orderIdResponse).toEqual(882672565);
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});
