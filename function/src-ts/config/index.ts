const { IG_REST_API_KEY, IG_REST_IDENTIFIER, IG_REST_PASSWORD, IG_REST_URL, IG_UNITS } = process.env;

interface Config {
  ig: IG;
}

interface IG {
  apiKey: string;
  identifier: string;
  password: string;
  url: string;
  unitsPerTrade: number;
}

let config: Config = {
  ig: {
    apiKey: IG_REST_API_KEY,
    identifier: IG_REST_IDENTIFIER,
    password: IG_REST_PASSWORD,
    url: IG_REST_URL,
    unitsPerTrade: Number(IG_UNITS),
  },
};

export default config;
