import axios from "axios";
import { mocked } from "ts-jest/utils";
import IG, { resolutions } from "../../../utils/IG";
import { mockResponse } from "./factories";
import { priceData } from "./api-responses/prices";
import { expectedPrices } from "./expected-results/prices";

jest.mock("axios");
const mockedAxios = mocked(axios, true);
const ig = new IG();

describe("IG price data test suite", () => {
  afterEach(jest.clearAllMocks);

  it("Should get the correct price data back", async () => {
    //Session
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ config: { method: "GET", url: `${ig.igUrl}/session` } }));
    //Prices call
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ data: priceData }));
    const actualResponse = await ig.getPrices("AUD/USD", resolutions.MINUTE_10);
    expect(actualResponse).toEqual(expectedPrices);
  });

  it("Should throw an error for 400", async () => {
    //Session
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ config: { method: "GET", url: `${ig.igUrl}/session` } }));
    //Prices call
    mockedAxios.get.mockRejectedValueOnce(mockResponse.build({ status: 401, statusText: "Bad Request" }));
    await expect(ig.getPrices("AUD/USD", resolutions.MINUTE_10)).rejects.toThrow(
      Error(`Could not fetch prices data for CS.D.AUDUSD.MINI.IP with error - Bad Request`)
    );
  });
});
