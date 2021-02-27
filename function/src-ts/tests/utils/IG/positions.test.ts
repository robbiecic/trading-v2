import axios from "axios";
import { mocked } from "ts-jest/utils";
import IG from "../../../utils/IG";
import { mockResponse } from "./factories";
import { positions } from "./api-responses/positions";
import { expectedPositions } from "./expected-results/positions";

jest.mock("axios");
const mockedAxios = mocked(axios, true);
const ig = new IG();

describe("IG positions data test suite", () => {
  afterEach(jest.clearAllMocks);

  it("Should get the correct position data back", async () => {
    //Session
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ config: { method: "GET", url: `${ig.igUrl}/session` } }));
    //Prices call
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ data: positions }));
    const actualResponse = await ig.getOpenPositions();
    expect(actualResponse).toEqual(expectedPositions);
  });

  it("Should throw an error for 400", async () => {
    //Session
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ config: { method: "GET", url: `${ig.igUrl}/session` } }));
    //Prices call
    mockedAxios.get.mockRejectedValueOnce(mockResponse.build({ status: 401, statusText: "Bad Request" }));
    await expect(ig.getOpenPositions()).rejects.toThrow(Error(`Could not get open positions: Bad Request`));
  });
});
