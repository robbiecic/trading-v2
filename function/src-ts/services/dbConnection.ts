const { DB_HOST, DB_SCHEMA, DB_USER, DB_PASSWORD, NODE_ENV } = process.env;
import { createConnection, Connection } from "typeorm";
import AWS from "aws-sdk";

export default async function createDbConnection(): Promise<Connection> {
  const region = "ap-southeast-2";
  const secretName = "trading-db-secret";

  var client = new AWS.SecretsManager({
    region: region,
  });

  const dbCredentials = await client.getSecretValue({ SecretId: secretName }).promise();
  const dbCredentialsJson = JSON.parse(dbCredentials.SecretString);

  const connection = await createConnection({
    type: "mysql",
    host: DB_HOST || dbCredentialsJson.host,
    port: 3306,
    username: DB_USER || dbCredentialsJson.username,
    password: DB_PASSWORD || dbCredentialsJson.password,
    database: DB_SCHEMA,
    entities: NODE_ENV == "dev" ? ["built/entity/**/*.js"] : ["entity/**/*.js"],
    logging: false,
    synchronize: true,
  });
  console.log(`Successfully connected to db ${DB_HOST || dbCredentialsJson.host}`);
  return connection;
}
