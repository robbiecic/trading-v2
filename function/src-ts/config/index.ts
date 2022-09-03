const { IG_ACCOUNT_SECRET_NAME, IG_UNITS_AUDUSD, IG_UNITS_USDJPY, IG_UNITS_EURUSD } = process.env;

interface Config {
  ig: IG;
}

interface IG {
  igSecretName: string;
  unitsAUDUSD: number;
  unitsUSDJPY: number;
  unitsEURUSD: number;
}

let config: Config = {
  ig: {
    igSecretName: IG_ACCOUNT_SECRET_NAME,
    unitsAUDUSD: Number(IG_UNITS_AUDUSD),
    unitsUSDJPY: Number(IG_UNITS_USDJPY),
    unitsEURUSD: Number(IG_UNITS_EURUSD),
  },
};

export default config;
