import axios from "axios";
import { mocked } from "ts-jest/utils";
import IG, { resolutions } from "../../../utils/IG";
import { mockResponse } from "./factories";
import { priceData } from "./api-responses/prices";
import { expectedPrices } from "./expected-results/prices";

//Set up of axios mock
const mockedAxios = mocked(axios, true);
jest.mock("axios", () => ({
  defaults: {
    baseURL: "test",
    raxConfig: {},
  },
  create: () => axios,
  get: jest.fn(() => Promise),
  post: jest.fn(() => Promise),
  delete: jest.fn(() => Promise),
}));
jest.mock("retry-axios", () => ({
  attach: () => 12345,
}));

const ig = new IG();
const oAuthToken = { data: { oauthToken: { access_token: "123456" } } };

describe("IG price data test suite", () => {
  afterEach(jest.clearAllMocks);

  it("Should get the correct price data back", async () => {
    //Prices call
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ data: priceData }));
    const actualResponse = await ig.getPrices("AUD/USD", resolutions.MINUTE_10);
    expect(actualResponse).toEqual(expectedPrices);
  });

  it("Should throw an error for 400", async () => {
    //Prices call
    mockedAxios.get.mockRejectedValueOnce(mockResponse.build({ status: 401, statusText: "Bad Request" }));
    await expect(ig.getPrices("AUD/USD", resolutions.MINUTE_10)).rejects.toThrow(Error);
  });
});
