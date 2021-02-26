import axios from "axios";
import { mocked } from "ts-jest/utils";
import IG, { resolutions } from "../../../utils/IG";
import { mockResponse } from "./factories";
import { priceData } from "./api-responses/prices";

jest.mock("axios");
const mockedAxios = mocked(axios, true);
const ig = new IG();

describe("getApps()", () => {
  afterEach(jest.clearAllMocks);

  it("Should get the correct price data back", async () => {
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ config: { method: "GET", url: `${ig.igUrl}/session` } }));
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ data: priceData }));

    const result = await ig.getPrices("AUD/USD", resolutions.MINUTE_10);
    expect(result).toEqual(priceData);
  });
});
