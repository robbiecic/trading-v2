import CI, { OrderTicket } from "../../../utils/CI";
import { ciEpics } from "../../../utils/Broker";
import { OrderEvent, ActionTypes, DirectionTypes } from "../../../entity/OrderEvent";
import { mocked } from "ts-jest/utils";
import axios from "axios";
import { positions } from "../CI/expected-results/positions";
import { positionsChunks } from "../CI/expected-results/positions_chunks_10";

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

const orderTicket: OrderTicket = {
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

describe("CI test for closing multiple orders", () => {
  it("Test - returnCloseOrderChunks(), expect to divide into 3", async () => {
    const closePositionsIntoChunks = ci.returnCloseOrderChunks(positions, 20000);
    expect(closePositionsIntoChunks.length).toEqual(3);
    expect(closePositionsIntoChunks).toEqual(positionsChunks);
  });

  it("Test - returnCloseOrderChunks(), expect to divide into 1", async () => {
    const closePositionsIntoChunks = ci.returnCloseOrderChunks(positions, 100000);
    expect(closePositionsIntoChunks.length).toEqual(1);
  });

  it("Test - returnCloseOrderChunks(), expect to divide into 6", async () => {
    const closePositionsIntoChunks = ci.returnCloseOrderChunks(positions, 10000);
    expect(closePositionsIntoChunks.length).toEqual(6);
  });

  // it("Closing multiple orders in chunks - e2e test", async () => {
  //     let spyOrderTicket = jest.spyOn(ci, 'returnOrderTicket').mockImplementation(() => Promise.resolve(expectedOrderTicket));
  //     const closeMultiplePositionsResponse = await ci.closeMultiplePositions(positions, orderEvent);
  //     expect(spyOrderTicket).toHaveBeenCalledTimes(1);
  //     expect(closeMultiplePositionsResponse).toEqual(expectedOpenLongResponse);
  // });

  // public async closeMultiplePositions(positions: Array<Positions>, order: OrderEvent): Promise<string[]> {
  //     let orderTicket = await this.returnOrderTicket(order, 1);
  //     const closePositionsIntoChunks = this.returnCloseOrderChunks(orderTicket, positions, 5000000);
  //     const promises = this.returnCloseOrderChunksAPIOrderRequests(orderTicket, closePositionsIntoChunks, order);
  //     return await Promise.all(promises);
  //   }
});
