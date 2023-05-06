import CI, { OrderTicket } from "../../../utils/CI";
import { ciEpics } from "../../../utils/Broker";
import { mocked } from "ts-jest/utils";
import axios from "axios";
import { positionsChunks } from "./expected-results/positions_chunks_10";

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

const orderTicket: OrderTicket = {
  MarketId: ciEpics.AUDUSD,
  Currency: "USD",
  AutoRollover: false,
  Direction: "buy",
  Quantity: 1,
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

const orderTicketsExpected: OrderTicket[] = [
  {
    MarketId: ciEpics.AUDUSD,
    Currency: "USD",
    AutoRollover: false,
    Direction: "buy",
    Quantity: 20000,
    QuoteId: null,
    PositionMethodId: 2,
    BidPrice: 0.652,
    OfferPrice: 0.653,
    AuditId: `CI|Open|AUD/USD|LONG|0.761|${new Date().toISOString()}`,
    TradingAccountId: 123456,
    IfDone: [],
    Close: ["882537008", "882538314"],
    Reference: "GCAPI",
    AllocationProfileId: null,
    OrderReference: null,
    Source: null,
    PriceTolerance: 1000,
  },
  {
    MarketId: ciEpics.AUDUSD,
    Currency: "USD",
    AutoRollover: false,
    Direction: "buy",
    Quantity: 20000,
    QuoteId: null,
    PositionMethodId: 2,
    BidPrice: 0.652,
    OfferPrice: 0.653,
    AuditId: `CI|Open|AUD/USD|LONG|0.761|${new Date().toISOString()}`,
    TradingAccountId: 123456,
    IfDone: [],
    Close: ["882537008", "882538314"],
    Reference: "GCAPI",
    AllocationProfileId: null,
    OrderReference: null,
    Source: null,
    PriceTolerance: 1000,
  },
  {
    MarketId: ciEpics.AUDUSD,
    Currency: "USD",
    AutoRollover: false,
    Direction: "buy",
    Quantity: 20000,
    QuoteId: null,
    PositionMethodId: 2,
    BidPrice: 0.652,
    OfferPrice: 0.653,
    AuditId: `CI|Open|AUD/USD|LONG|0.761|${new Date().toISOString()}`,
    TradingAccountId: 123456,
    IfDone: [],
    Close: ["882537008", "882538314"],
    Reference: "GCAPI",
    AllocationProfileId: null,
    OrderReference: null,
    Source: null,
    PriceTolerance: 1000,
  },
];

describe("CI - returnOrderTicketChunks()", () => {
  it("Test - are orderTickets being created?", async () => {
    const orderTickets = ci.returnOrderTicketChunks(orderTicket, positionsChunks);
    expect(orderTickets.length).toEqual(3);
    expect(orderTickets).toEqual(orderTicketsExpected);
  });
});
