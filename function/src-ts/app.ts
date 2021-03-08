import { APIGatewayProxyResult } from "aws-lambda";
import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import { OrderEvent, ActionTypes, DirectionTypes } from "./entity/OrderEvent";
import { doOrder } from "./services/orderRouter";
import IG from "./utils/IG";

/* event
 * {
 *  Records: [
 *  {
 *   body: "{\"actionType\": \"Open\",\"direction\": \"LONG\",\"pair\": \"AUD/USD\", \"orderDateUTC\":\"\", \"priceTarget\": \"\"}",
 *  }
 * ]
 *
 */

export const lambdaHandler = async (event: any): Promise<APIGatewayProxyResult> => {
  let connection: Connection;
  const ig = new IG();
  try {
    //Do Something
    try {
      connection = await createConnection();
    } catch {
      console.log("Already have connection with DB, skipping...");
    }
    //We might have multiple orders to process from the queue
    for (let queueOrder of event.Records) {
      //Map queue to orderEvent object
      let queueOrderObject = JSON.parse(queueOrder.body);
      let orderObject = mapEventObjectToOrderEvent(queueOrderObject);
      console.log(`Order for this event is ${JSON.stringify(orderObject)}`);
      await doOrder(orderObject, ig);
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
