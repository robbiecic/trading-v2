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
      let orderObject: OrderEvent = {
        actionType: queueOrderObject.actionType as ActionTypes,
        direction: queueOrderObject.direction as DirectionTypes,
        pair: queueOrderObject.pair,
        orderDateUTC: new Date(queueOrderObject.orderDateUTC),
        priceTarget: queueOrderObject.priceTarget,
      };
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
