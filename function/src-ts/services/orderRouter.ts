import { OrderEvent, ActionTypes, DirectionTypes } from "../entity/OrderEvent";
import { Deal, tradingHistory } from "../entity/Deal";
import IG, { Positions, Confirms } from "../utils/IG";
import { getConnection, Repository, Connection } from "typeorm";

export async function doOrder(order: OrderEvent, ig: IG): Promise<boolean | Error> {
  await ig.connect(); //Will set oAuth token valid for ~60 seconds which is long enough
  const connection: Connection = getConnection();
  const repository: Repository<any> = connection.getRepository(tradingHistory);
  if (order.actionType === ActionTypes.Open) {
    await openPosition(ig, order, repository);
    return true;
  } else if (order.actionType === ActionTypes.Close) {
    const positions = await getPositions(ig, order.pair);
    await closePosition(ig, order, repository, positions);
    return true;
  } else {
    throw new Error(`actionType not supported with: ${order.actionType}`);
  }
}

async function openPosition(ig: IG, order: OrderEvent, repository: Repository<any>) {
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
  await saveData(finalOrderDetails, repository);
}

async function getPositions(ig: IG, pair: string): Promise<Array<Positions>> {
  //Get open positions from IG
  let positions: Array<Positions> = await ig.getOpenPositions(pair);
  if (positions.length === 0) {
    console.log("No positions opened");
    return [];
  } else return positions;
}

export async function closePosition(ig: IG, order: OrderEvent, repository: Repository<any>, positions: Array<Positions>) {
  //Loop through all open positions
  for (let position of positions) {
    console.log(`Position - ${JSON.stringify(position)}`);
    let pair = ig.getPairFromEpic(position.market.epic);
    let positionDirection = position.position.direction == "BUY" ? DirectionTypes.LONG : DirectionTypes.SHORT;
    //Match on pair & position to close it out
    if (pair == order.pair && order.direction == positionDirection) {
      //Close position
      let dealReference = await ig.closePosition(position, order);
      console.log(`Closed position with deal reference - ${dealReference}`);
      //Get deal reference details
      let dealDetails = await ig.getDealDetails(dealReference);
      console.log(`Deal details are - ${JSON.stringify(dealDetails)}`);
      //Map details to Deal Type, IG will return it's own dataset
      let finalOrderDetails = mapConfirmToDeal(dealDetails, order);
      console.log(`Attempting to insert into DB: ${JSON.stringify(finalOrderDetails)}`);
      //Log into DB
      await saveData(finalOrderDetails, repository);
    } else {
      console.log("Close order did not match any open positions.");
    }
  }
}

export function mapConfirmToDeal(confirmObject: Confirms, order: OrderEvent): Deal {
  let returnDeal: Deal = {
    eventDate: confirmObject.date,
    eventAction: ActionTypes[order.actionType],
    dealID: confirmObject.dealId,
    accountName: process.env.IG_ACCOUNT_SECRET_NAME,
    dealReference: confirmObject.dealReference,
    epic: confirmObject.epic.toString(),
    level: confirmObject.level,
    size: confirmObject.size,
    direction: confirmObject.direction,
    profit: confirmObject.profit,
    targetPrice: order.priceTarget,
    originalOrderDateUTC: order.orderDateUTC,
    pair: order.pair,
  };
  return returnDeal;
}

async function saveData(data: Deal, repository: Repository<any>): Promise<void> {
  try {
    await repository.save(data);
    console.log(`Trade results added to DB for - ${data.pair}`);
  } catch (e) {
    throw Error(`Failed to save data to DB with error - ${e}`);
  }
}
