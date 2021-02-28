import { mapEventObjectToOrderEvent } from "../app";
import { OrderEvent, ActionTypes, DirectionTypes } from "../entity/OrderEvent";

const orderEvent: OrderEvent = {
  actionType: ActionTypes.Open,
  direction: DirectionTypes.LONG,
  pair: "AUD/USD",
  orderDateUTC: new Date("2021-02-26 17:40:22"),
  priceTarget: 0.761,
};

describe("Test suite for app.ts", () => {
  let inboundMessage = {
    actionType: "Open",
    direction: "LONG",
    pair: "AUD/USD",
    orderDateUTC: "2021-02-26 17:40:22",
    priceTarget: 0.761,
  };

  it("Should transform incoming event body to type OrderEvent", async () => {
    const actualResponse = mapEventObjectToOrderEvent(inboundMessage);
    expect(actualResponse).toEqual(orderEvent);
  });
});
