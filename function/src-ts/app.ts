import { APIGatewayProxyResult } from "aws-lambda";
import "reflect-metadata";
import { Connection } from "typeorm";
import { OrderEvent, ActionTypes, DirectionTypes } from "./entity/OrderEvent";
import { doOrder } from "./services/orderRouter";
import IG from "./utils/IG";
import CI from "./utils/CI";
import createDbConnection from "./services/dbConnection";
import config from "./config";

export const lambdaHandler = async (event: Array<any>): Promise<APIGatewayProxyResult> => {
  let connection: Connection;
  let broker: IG | CI;
  try {
    broker = await createBrokerClass();
    connection = await createDbConnection();
  } catch (e) {
    throw `Could not establish dependencies. Failed with with error ${e}`;
  }
  try {
    //We might have multiple orders to process from the queue
    for (let order of event) {
      try {
        let orderObject = mapEventObjectToOrderEvent(order);
        if (isTradingEnabled(orderObject.pair)) {
          console.log(`Trading enabled. Order for this event is ${JSON.stringify(orderObject)}`);
          await doOrder(orderObject, broker);
        } else {
          console.log(`Trading is not enabled on pair ${orderObject.pair}. Shutting down.`);
        }
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
    throw `Trading service failed with error ${e}`;
  }
};

async function createBrokerClass(): Promise<IG | CI> {
  let broker: IG | CI;
  console.log(`Setting up this trading instance for the ${config.broker} Broker.`);
  if (config.broker == "IG") {
    broker = new IG();
    await broker.init();
  } else if (config.broker == "CI") {
    broker = new CI();
    await broker.init();
  } else {
    throw `Broker is not set to either IG or CI, shutting down app.`;
  }
  return broker;
}

function isTradingEnabled(pair: string): boolean {
  switch (pair) {
    case "AUD/USD":
      return config.audusdEnabled;
    case "EUR/USD":
      return config.eurusdEnabled;
    case "USD/JPY":
      return config.usdjpyEnabled;
    default:
      return false;
  }
}

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
