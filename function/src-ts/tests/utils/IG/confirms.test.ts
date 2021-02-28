import axios from "axios";
import { mocked } from "ts-jest/utils";
import IG from "../../../utils/IG";
import { mockResponse } from "./factories";
import { confirms } from "./api-responses/confirms";
import { expectedConfirms } from "./expected-results/confirms";

jest.mock("axios");
const mockedAxios = mocked(axios, true);
const ig = new IG();

const dealReference = "WZJ8FXKEVWF44TP";

describe("IG confirms test suite", () => {
  afterEach(jest.clearAllMocks);

  it("Should retrieve confirms data properly", async () => {
    //Session
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ config: { method: "GET", url: `${ig.igUrl}/session` } }));
    //Prices call
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ data: confirms }));
    const actualResponse = await ig.getDealDetails(dealReference);
    expect(actualResponse).toEqual(expectedConfirms);
  });

  it("Should throw an error for 4xx", async () => {
    //Session
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ config: { method: "GET", url: `${ig.igUrl}/session` } }));
    //Prices call
    mockedAxios.get.mockRejectedValueOnce(mockResponse.build({ status: 400, statusText: "Bad Request" }));
    await expect(ig.getDealDetails(dealReference)).rejects.toThrow(Error(`Could not get deal reference details: Bad Request`));
  });
});
