import IG, { OrderTicket } from "../../../utils/IG";
import { igEpics } from "../../../utils/Broker";
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
  epic: igEpics.AUDUSD,
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
    let actualResponse = ig.returnOrderTicket(orderEvent);
    expect(actualResponse).toEqual(expectedResponse);
  });
});
