import axios from "axios";
import { mocked } from "ts-jest/utils";
import IG from "../../../utils/IG";
import { mockResponse } from "./factories";
import { positions } from "./api-responses/positions";
import { expectedPositions } from "./expected-results/positions";

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
}));
jest.mock("retry-axios", () => ({
  attach: () => 12345,
}));

// Set up oAuthToken
const ig = new IG();

describe("IG positions data test suite", () => {
  afterEach(jest.clearAllMocks);

  it("Should get the correct position data back", async () => {
    //Prices call
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ data: positions }));
    const actualResponse = await ig.getOpenPositions();
    expect(actualResponse).toEqual(expectedPositions);
  });

  it("Should throw an error for 400", async () => {
    //Prices call
    mockedAxios.get.mockRejectedValueOnce(mockResponse.build({ status: 401, statusText: "Bad Request" }));
    await expect(ig.getOpenPositions()).rejects.toThrow(Error);
  });
});
