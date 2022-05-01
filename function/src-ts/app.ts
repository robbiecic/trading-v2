import { APIGatewayProxyResult } from "aws-lambda";
import "reflect-metadata";
import { Connection } from "typeorm";
import { OrderEvent, ActionTypes, DirectionTypes } from "./entity/OrderEvent";
import { doOrder } from "./services/orderRouter";
import IG from "./utils/IG";
import createDbConnection from "./services/dbConnection";

export const lambdaHandler = async (event: Array<any>): Promise<APIGatewayProxyResult> => {
  let connection: Connection;
  const ig = new IG();
  await ig.init();
  try {
    //Do Something
    try {
      connection = await createDbConnection();
    } catch (e) {
      console.error("Could not create connection to DB");
      console.error(e);
      return {
        statusCode: 400,
        body: e.toString(),
      };
    }
    //We might have multiple orders to process from the queue
    for (let order of event) {
      try {
        let orderObject = mapEventObjectToOrderEvent(order);
        console.log(`Order for this event is ${JSON.stringify(orderObject)}`);
        await doOrder(orderObject, ig);
      } catch (e) {
        console.error(`Could not process order ${JSON.stringify(order)}. Errored with ${e}`);
      }
    }
    await connection.close();
    return {
      statusCode: 200,
      body: "Something",
    };
  } catch (e) {
    console.log(e);
    await connection.close();
    return {
      statusCode: 400,
      body: e.toString(),
    };
  }
};

export function mapEventObjectToOrderEvent(queueObject: any): OrderEvent {
  let orderEvent: OrderEvent = {
    actionType: queueObject.actionType as ActionTypes,
    direction: queueObject.direction as DirectionTypes,
    pair: queueObject.pair,
    orderDateUTC: new Date(queueObject.orderDateUTC),
    priceTarget: queueObject.priceTarget,
  };
  return orderEvent;
}
