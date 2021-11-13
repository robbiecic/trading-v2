const { IG_ACCOUNT_SECRET_NAME, IG_UNITS } = process.env;

interface Config {
  ig: IG;
}

interface IG {
  igSecretName: string;
  unitsPerTrade: number;
}

let config: Config = {
  ig: {
    igSecretName: IG_ACCOUNT_SECRET_NAME,
    unitsPerTrade: Number(IG_UNITS),
  },
};

export default config;
