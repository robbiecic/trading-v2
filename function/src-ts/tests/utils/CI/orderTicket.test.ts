import CI, { OrderTicket } from "../../../utils/CI";
import { ciEpics } from "../../../utils/Broker";
import { OrderEvent, ActionTypes, DirectionTypes } from "../../../entity/OrderEvent";
import { mocked } from "ts-jest/utils";
import axios from "axios";

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

const orderEvent: OrderEvent = {
  actionType: ActionTypes.Open,
  direction: DirectionTypes.LONG,
  pair: "AUD/USD",
  orderDateUTC: new Date(),
  priceTarget: 0.761,
};

const expectedOpenLongResponse: OrderTicket = {
  MarketId: ciEpics.AUDUSD,
  Currency: "USD",
  AutoRollover: false,
  Direction: "buy",
  Quantity: 10000,
  QuoteId: null,
  PositionMethodId: 2,
  BidPrice: 0.652,
  OfferPrice: 0.653,
  AuditId: `CI|Open|AUD/USD|LONG|0.761|${new Date().toISOString()}`,
  TradingAccountId: 123456,
  IfDone: [],
  Close: null,
  Reference: "GCAPI",
  AllocationProfileId: null,
  OrderReference: null,
  Source: null,
  PriceTolerance: 1000,
};

describe("CI test for order ticket", () => {
  it("Valid transformation on Order Ticket works", async () => {
    // CI gets prices for the order ticket so we need to mock it (const priceData = await this.getLatestPriceData(order))
    let spy = jest.spyOn(ci, "getLatestPriceData").mockImplementation(() => Promise.resolve({ bid: 0.652, offer: 0.653 }));
    let actualResponse = await ci.returnOrderTicket(orderEvent, 20);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedOpenLongResponse);
  });
});
