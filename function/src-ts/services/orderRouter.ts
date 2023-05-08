import { OrderEvent, ActionTypes, DirectionTypes } from "../entity/OrderEvent";
import { Deal, tradingHistory } from "../entity/Deal";
import Broker, { Positions, Confirms } from "../utils/Broker";
import { getConnection, Repository, Connection } from "typeorm";
import config from "../config";

export async function doOrder(order: OrderEvent, broker: Broker): Promise<boolean | Error> {
  await broker.connect(); //Will set oAuth token valid for ~60 seconds which is long enough
  const connection: Connection = getConnection();
  const repository: Repository<any> = connection.getRepository(tradingHistory);
  if (order.actionType === ActionTypes.Open) {
    await openPosition(broker, order, repository);
    return true;
  } else if (order.actionType === ActionTypes.Close) {
    const positions = await getPositions(broker, order.pair);
    await closePositions(broker, order, repository, positions);
    return true;
  } else {
    throw new Error(`actionType not supported with: ${order.actionType}`);
  }
}

async function openPosition(broker: Broker, order: OrderEvent, repository: Repository<any>) {
  //Place order in IG
  const dealReference = await broker.placeOrder(order);
  console.log(`Open position with deal reference - ${dealReference}`);
  //Get deal reference details
  const dealDetails: Confirms = await broker.getDealDetails(dealReference);
  console.log(`Deal details are - ${JSON.stringify(dealDetails)}`);
  //Map details to Deal Type, IG will return it's own dataset
  const finalOrderDetails: Deal = mapConfirmToDeal(dealDetails, order);
  console.log(`Attempting to insert into DB: ${JSON.stringify(finalOrderDetails)}`);
  //Log into DB
  await saveData(finalOrderDetails, repository);
}

async function getPositions(broker: Broker, pair: string): Promise<Array<Positions>> {
  //Get open positions from IG
  let positions: Array<Positions> = await broker.getOpenPositions(pair);
  if (positions.length === 0) {
    console.log("No positions opened");
    return [];
  } else return positions;
}

export async function closePositions(broker: Broker, order: OrderEvent, repository: Repository<any>, positions: Array<Positions>) {
  if (broker.name == "CI") {
    await closeCIPositionsInBulk(broker, order, repository, positions);
  }
  else {
    const promises = [];
    for (let position of positions) {
      promises.push(closePosition(broker, order, repository, position));
    }
    // Execute all close positions at the same time, async. Await promises back from all. Risk of throttling here.
    await Promise.all(promises);
  }
}

async function closeCIPositionsInBulk(broker: Broker, order: OrderEvent, repository: Repository<any>, positions: Array<Positions>) {
  // Filter only positions that we want to close
  let positionsForOrderPairAndDirection: Array<Positions> = positions.filter(
    (position) => broker.getPairFromEpic(position.market.epic) == order.pair
      && order.direction == (position.position.direction == "BUY" ? DirectionTypes.LONG : DirectionTypes.SHORT));

  if (positionsForOrderPairAndDirection.length > 0) {
    let dealReferences = await broker.closeMultiplePositions(positionsForOrderPairAndDirection, order);
    for (let dealReference of dealReferences)
    {
      console.log(`Closed position with deal reference - ${dealReference}`);
      //Get deal reference details
      let dealDetails = await broker.getDealDetails(dealReference);
      console.log(`Deal details are - ${JSON.stringify(dealDetails)}`);
      //Map details to Deal Type, IG will return it's own dataset
      let finalOrderDetails = mapConfirmToDeal(dealDetails, order);
      console.log(`Attempting to insert into DB: ${JSON.stringify(finalOrderDetails)}`);
      //Log into DB
      await saveData(finalOrderDetails, repository);
    }
  } else {
    console.log("Close order did not match any open positions.");
  }
}

export async function closePosition(broker: Broker, order: OrderEvent, repository: Repository<any>, position: Positions) {
  console.log(`Position - ${JSON.stringify(position)}`);
  let pair = broker.getPairFromEpic(position.market.epic);
  let positionDirection = position.position.direction == "BUY" ? DirectionTypes.LONG : DirectionTypes.SHORT;
  //Match on pair & position to close it out
  if (pair == order.pair && order.direction == positionDirection) {
    //Close position
    let dealReference = await broker.closePosition(position, order);
    console.log(`Closed position with deal reference - ${dealReference}`);
    //Get deal reference details
    let dealDetails = await broker.getDealDetails(dealReference);
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

export function mapConfirmToDeal(confirmObject: Confirms, order: OrderEvent): Deal {
  let returnDeal: Deal = {
    eventDate: confirmObject.date,
    eventAction: ActionTypes[order.actionType],
    dealID: confirmObject.dealId,
    accountName: config.apiDetails.apiSecretName,
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
