import { mapConfirmToDeal, closePosition } from "../../services/orderRouter";
import { expectedConfirms } from "../utils/IG/expected-results/confirms";
import { OrderEvent, ActionTypes, DirectionTypes } from "../../entity/OrderEvent";
import { expectedDeal } from "./expected-results/exectedDeal";
// import "typeorm";

// jest.mock("typeorm", () => ({ getConnection: jest.fn() }));

const orderEvent: OrderEvent = {
  actionType: ActionTypes.Open,
  direction: DirectionTypes.LONG,
  pair: "AUD/USD",
  orderDateUTC: new Date(),
  priceTarget: 0.761,
};

describe("Test suite for OrderRouter.ts", () => {
  it("Confirm to deal mapping works as expected", async () => {
    const actualResponse = mapConfirmToDeal(expectedConfirms, orderEvent);
    expect(actualResponse).toEqual(expectedDeal);
  });

  // it("Close orders works where all positions are in one FX pair", async () => {
  //   //Need to mock ORM
  //   const connection: Connection = getConnection();
  //   const repository: Repository<any> = connection.getRepository(tradingHistory);
  //   const actualResult = await closePosition(orderEvent, respository, positions);
  // });
});
