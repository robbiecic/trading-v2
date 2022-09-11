const { API_ACCOUNT_SECRET_NAME, UNITS_AUDUSD, UNITS_USDJPY, UNITS_EURUSD, BROKER } = process.env;

interface Config {
  apiDetails: apiSecrets;
  broker: string;
}

interface apiSecrets {
  apiSecretName: string;
  unitsAUDUSD: number;
  unitsUSDJPY: number;
  unitsEURUSD: number;
}

let config: Config = {
  apiDetails: {
    apiSecretName: API_ACCOUNT_SECRET_NAME,
    unitsAUDUSD: Number(UNITS_AUDUSD),
    unitsUSDJPY: Number(UNITS_USDJPY),
    unitsEURUSD: Number(UNITS_EURUSD),
  },
  broker: BROKER,
};

export default config;
