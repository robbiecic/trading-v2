import AWS from "aws-sdk";
import config from "../config";
import { MarketDataInterface } from "../entity/MarketData";

AWS.config.update({ region: config.aws.region });
const sqs: AWS.SQS = new AWS.SQS({ apiVersion: "2012-11-05" });

export default async function publishToQueue(messageBody: MarketDataInterface): Promise<boolean | Error> {
  return new Promise((resolve, reject) => {
    const sqsBody = {
      pair: messageBody.pair,
      data: messageBody,
    };
    var params: AWS.SQS.SendMessageRequest = {
      DelaySeconds: 0,
      MessageBody: JSON.stringify(sqsBody),
      QueueUrl: config.aws.sqsUrlPreAlgo,
    };
    console.log(`Sending data to algo service - ${JSON.stringify(params)}`);
    //Invoke SQS method which returns a callback which we will resolve
    sqs.sendMessage(params, function (err: AWS.AWSError, data: AWS.SQS.SendMessageResult) {
      if (err) {
        reject(`Error trying to push to Queue - ${JSON.stringify(err)}`);
      } else {
        console.log(`Published to queue successfully - ${config.aws.sqsUrlPreAlgo} - ${data.MessageId}`);
        resolve(true);
      }
    });
  });
}
