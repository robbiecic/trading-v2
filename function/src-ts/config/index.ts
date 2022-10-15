const { API_ACCOUNT_SECRET_NAME, UNITS_AUDUSD, UNITS_USDJPY, UNITS_EURUSD, BROKER, AUDUSD_ENABLED, EURUSD_ENABLED, USDJPY_ENABLED } = process.env;

interface Config {
  apiDetails: apiSecrets;
  broker: string;
  audusdEnabled: boolean;
  eurusdEnabled: boolean;
  usdjpyEnabled: boolean;
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
  audusdEnabled: AUDUSD_ENABLED.toUpperCase() == "TRUE",
  eurusdEnabled: EURUSD_ENABLED.toUpperCase() == "TRUE",
  usdjpyEnabled: USDJPY_ENABLED.toUpperCase() == "TRUE",
};

export default config;
