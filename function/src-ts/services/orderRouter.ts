import { OrderEvent, ActionTypes, DirectionTypes } from "../entity/OrderEvent";
import { Deal, tradingHistory } from "../entity/Deal";
import IG, { Positions, Confirms } from "../utils/IG";
import { getConnection } from "typeorm";

const ig = new IG();

export async function doOrder(order: OrderEvent): Promise<boolean | Error> {
  await ig.connect();
  if (order.actionType === ActionTypes.Open) {
    await openPosition(order);
    return true;
  } else if (order.actionType === ActionTypes.Close) {
    await closePosition(order);
    return true;
  } else {
    throw new Error(`actionType not supported with: ${order.actionType}`);
  }
}

async function openPosition(order: OrderEvent) {
  //Place order in IG
  const dealReference = await ig.placeOrder(order);
  console.log(`Open position with deal reference - ${dealReference}`);
  //Get deal reference details
  const dealDetails = await ig.getDealDetails(dealReference);
  console.log(`Deal details are - ${JSON.stringify(dealDetails)}`);
  //Map details to Deal Type, IG will return it's own dataset
  const finalOrderDetails = mapConfirmToDeal(dealDetails, order);
  console.log(`Attempting to insert into DB: ${JSON.stringify(finalOrderDetails)}`);
  //Log into DB
  await saveData(finalOrderDetails);
}

async function closePosition(order: OrderEvent) {
  //Get open positions from IG
  let positions: Array<Positions> = await ig.getOpenPositions();
  //Loop through all open positions
  positions.forEach(async (position: Positions) => {
    console.log(`Position - ${JSON.stringify(position)}`);
    let pair = ig.getPairFromEpic(position.market.epic);
    let positionDirection = position.position.direction == "BUY" ? DirectionTypes.LONG : DirectionTypes.SHORT;
    //Match on pair & position to close it out
    if (pair == order.pair && order.direction == positionDirection) {
      //Close position
      const dealReference = await ig.closePosition(position, order);
      console.log(`Closed position with deal reference - ${dealReference}`);
      //Get deal reference details
      const dealDetails = await ig.getDealDetails(dealReference);
      console.log(`Deal details are - ${JSON.stringify(dealDetails)}`);
      //Map details to Deal Type, IG will return it's own dataset
      const finalOrderDetails = mapConfirmToDeal(dealDetails, order);
      console.log(`Attempting to insert into DB: ${JSON.stringify(finalOrderDetails)}`);
      //Log into DB
      await saveData(finalOrderDetails);
    }
  });
}

export function mapConfirmToDeal(confirmObject: Confirms, order: OrderEvent): Deal {
  let returnDeal: Deal = {
    eventDate: confirmObject.date,
    eventAction: ActionTypes[order.actionType],
    dealID: confirmObject.dealId,
    dealReference: confirmObject.dealReference,
    epic: confirmObject.epic.toString(),
    level: confirmObject.level,
    size: confirmObject.size,
    direction: confirmObject.direction,
    profit: confirmObject.profit ?? null,
    targetPrice: order.priceTarget,
    originalOrderDateUTC: order.orderDateUTC,
    pair: order.pair,
  };
  return returnDeal;
}

async function saveData(data: Deal): Promise<boolean | Error> {
  try {
    const connection = await getConnection();
    const repository = connection.getRepository(tradingHistory);
    await repository.save(data);
    console.log(`Trade data added to DB for - ${data.pair}`);
    return true;
  } catch (e) {
    throw Error(`Failed to save data to DB with error - ${e}`);
  }
}
