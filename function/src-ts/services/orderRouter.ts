import { OrderEvent, ActionTypes } from "../entity/OrderEvent";
import IG, { Positions } from "../utils/IG";

const ig = new IG();

export async function doOrder(order: OrderEvent): Promise<boolean | Error> {
  if (order.actionType == ActionTypes.Open) {
    await openPosition(order);
    return true;
  } else if (order.actionType == ActionTypes.Close) {
    await closePosition(order);
    return true;
  }
}

async function openPosition(order: OrderEvent) {
  //Place order in IG
  await ig.placeOrder(order);
  //Log into DB
}

async function closePosition(order: OrderEvent) {
  //Get open positions from IG
  let positions: Array<Positions> | Error = await ig.getOpenPositions();
  //Close positions that match criteria
  positions.forEach((position) => {
    console.log(position);
  });
  //Log into DB
}
