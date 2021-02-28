import { APIGatewayProxyResult } from "aws-lambda";
import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import { OrderEvent, ActionTypes, DirectionTypes } from "./entity/OrderEvent";
import { doOrder } from "./services/orderRouter";

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
  try {
    //Do Something
    connection = await createConnection();
    //We might have multiple orders to process from the queue
    event.Records.forEach(async (queueOrder: string) => {
      //Map queue to orderEvent object
      let queueOrderObject = JSON.parse(queueOrder);
      let orderObject = mapEventObjectToOrderEvent(queueOrderObject);

      console.log(orderObject);
      await doOrder(orderObject);
    });
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
