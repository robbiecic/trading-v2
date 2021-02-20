const {
  IG_REST_API_KEY,
  IG_REST_IDENTIFIER,
  IG_REST_PASSWORD,
  IG_REST_URL,
  AWS_REGION_NAME,
  ROBERT_AWS_ACCESS_KEY_ID,
  ROBERT_AWS_SECRET_ACCESS_KEY,
  AWS_SQS_PREALGO,
  IG_UNITS,
} = process.env;

interface Config {
  ig: IG;
  aws: AWS;
}

interface IG {
  apiKey: string;
  identifier: string;
  password: string;
  url: string;
  unitsPerTrade: number;
}

interface AWS {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sqsUrlPreAlgo: string;
}

let config: Config = {
  ig: {
    apiKey: IG_REST_API_KEY,
    identifier: IG_REST_IDENTIFIER,
    password: IG_REST_PASSWORD,
    url: IG_REST_URL,
    unitsPerTrade: Number(IG_UNITS),
  },
  aws: {
    region: AWS_REGION_NAME,
    accessKeyId: ROBERT_AWS_ACCESS_KEY_ID,
    secretAccessKey: ROBERT_AWS_SECRET_ACCESS_KEY,
    sqsUrlPreAlgo: AWS_SQS_PREALGO,
  },
};

export default config;
