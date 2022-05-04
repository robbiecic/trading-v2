import { APIGatewayProxyResult } from "aws-lambda";
import "reflect-metadata";
import { Connection } from "typeorm";
import { OrderEvent, ActionTypes, DirectionTypes } from "./entity/OrderEvent";
import { doOrder } from "./services/orderRouter";
import IG from "./utils/IG";
import createDbConnection from "./services/dbConnection";

export const lambdaHandler = async (event: Array<any>): Promise<APIGatewayProxyResult> => {
  let connection: Connection;
  let ig: IG;

  // Establish dependencies, DB and IG API
  try {
    ig = new IG();
    await ig.init();
    connection = await createDbConnection();
  } catch (e) {
    throw `Could not establish dependencies. Failed with with error ${e}`;
  }
  try {
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
      body: `Successfully ran trading service for ${JSON.stringify(event)}`,
    };
  } catch (e) {
    await connection.close();
    throw `Traind service failed with error ${e}`;
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
