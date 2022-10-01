# market-data

An instance of this application will be spun up in accordance to the environment variables provided below. For example, if you which to setup an IG trading service, then specify the `BROKER` as `IG`, connect to the corresponding secret in AWS secretsManager and then set the values you wish to trade

## Environment variables

| Key                     | Value               |
| ----------------------- | ------------------- |
| DB_SCHEMA               | main                |
| BROKER                  | _IG or CI_          |
| API_ACCOUNT_SECRET_NAME | _IG_ROBERT_UK_LIVE_ |
| UNITS_AUDUSD            | 1                   |
| UNITS_EURUSD            | 1                   |
| UNITS_USDJPY            | 0.5                 |
| AUDUSD_ENABLED          | TRUE or FALSE       |
| EURUSD_ENABLED          | TRUE or FALSE       |
| USDJPY_ENABLED          | TRUE or FALSE       |

## AWS SecretManager schema for _`API_ACCOUNT_SECRET_NAME`_

| Key                | Value                           |
| ------------------ | ------------------------------- |
| IG_REST_API_KEY    | _Enter API Key_                 |
| IG_REST_IDENTIFIER | _Enter Account Name_            |
| IG_REST_PASSWORD   | _Enter Account Password_        |
| IG_REST_URL        | https://api.ig.com/gateway/deal |

## Broker API details

- CI - http://docs.labs.gaincapital.com
- Pre-Production: https://ciapipreprod.cityindextest9.co.uk/TradingApi/
- Live: https://ciapi.cityindex.com/tradingapi

## E2E tests

Tests will execute on demo accounts so the markets need to be opened. The DB should point to localhost.

```bash
$ npm run dev-long-open
$ npm run dev-long-close
$ npm run dev-short-open
$ npm run dev-short-close
```

## Unit tests

```bash
$ npm install
$ npm run test
```
