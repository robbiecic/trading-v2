import { mapConfirmToDeal } from "../../services/orderRouter";
import { expectedConfirms } from "../utils/IG/expected-results/confirms";
import { OrderEvent, ActionTypes, DirectionTypes } from "../../entity/OrderEvent";
import { expectedDeal } from "./expected-results/exectedDeal";

const orderEvent: OrderEvent = {
  actionType: ActionTypes.Open,
  direction: DirectionTypes.LONG,
  pair: "AUD/USD",
  orderDateUTC: new Date(),
  priceTarget: 0.761,
};

describe("Test suite for OrderRouter.ts", () => {
  it("Should close position successfully", async () => {
    const actualResponse = mapConfirmToDeal(expectedConfirms, orderEvent);
    expect(actualResponse).toEqual(expectedDeal);
  });
});
