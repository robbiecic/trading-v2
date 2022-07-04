import IG, { OrderTicket, epics } from "../../../utils/IG";
import { OrderEvent, ActionTypes, DirectionTypes } from "../../../entity/OrderEvent";

const ig = new IG();
Object.defineProperty(ig, "headers", { value: jest.fn() });

const orderEvent: OrderEvent = {
  actionType: ActionTypes.Open,
  direction: DirectionTypes.LONG,
  pair: "AUD/USD",
  orderDateUTC: new Date(),
  priceTarget: 0.761,
};

const expectedResponse: OrderTicket = {
  currencyCode: "USD",
  direction: "BUY",
  epic: epics.AUDUSD,
  expiry: "-",
  size: 1,
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

describe("IG test for order ticket", () => {
  it("Valid transformation on Order Ticket works", async () => {
    let actualResponse = ig.returnOrderTicket(orderEvent, 10);
    expect(actualResponse).toEqual(expectedResponse);
  });
});
