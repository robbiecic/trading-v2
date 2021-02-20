import { APIGatewayProxyResult } from "aws-lambda";
import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import { OrderEvent } from "./entity/OrderEvent";
import { doOrder } from "./services/orderRouter";

/* event
 * {
 *  Records: [
 *  {
 *   body: string
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
    event.Records.forEach(async (queueOrder: OrderEvent) => {
      console.log(queueOrder);
      await doOrder(queueOrder);
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
