import { OrderEvent, ActionTypes, DirectionTypes } from "../entity/OrderEvent";
import IG, { Positions } from "../utils/IG";

const ig = new IG();

export async function doOrder(order: OrderEvent): Promise<boolean | Error> {
  if (order.actionType == ActionTypes.Open) {
    await openPosition(order);
    return true;
  } else if (order.actionType == ActionTypes.Close) {
    await closePosition(order);
    return true;
  } else {
    throw new Error(`actionType not supported with: ${order.actionType}`);
  }
}

async function openPosition(order: OrderEvent) {
  //Place order in IG
  const dealReference = await ig.placeOrder(order);
  //Get deal reference details
  const dealDetails = await ig.getDealDetails(dealReference);
  //Log into DB
}

async function closePosition(order: OrderEvent) {
  //Get open positions from IG
  let positions: Array<Positions> | Error = await ig.getOpenPositions();
  //Loop through all open positions
  positions.forEach(async (position: Positions) => {
    let pair = ig.getPairFromEpic(position.market.epic);
    let positionDirection = position.position.direction == "BUY" ? DirectionTypes.LONG : DirectionTypes.SHORT;
    //Match on pair & position to close it out
    if (pair == order.pair && order.direction == positionDirection) {
      await ig.closePosition(position, order);
      //Log into DB
    }
  });
}
