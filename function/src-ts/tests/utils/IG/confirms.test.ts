import axios from "axios";
import { mocked } from "ts-jest/utils";
import IG from "../../../utils/IG";
import { mockResponse } from "./factories";
import { confirms } from "./api-responses/confirms";
import { expectedConfirms } from "./expected-results/confirms";

//Set up of axios mock
const mockedAxios = mocked(axios, true);
jest.mock("axios", () => ({
  defaults: {
    baseURL: "test",
    raxConfig: {},
  },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
  create: () => axios,
  get: jest.fn(() => Promise),
  post: jest.fn(() => Promise),
}));
jest.mock("retry-axios", () => ({
  attach: () => 12345,
}));

const ig = new IG();
Object.defineProperty(ig, "headers", { value: jest.fn() });

const dealReference = "WZJ8FXKEVWF44TP";

describe("IG confirms test suite", () => {
  afterEach(jest.clearAllMocks);

  it("Should retrieve confirms data properly", async () => {
    //Prices call
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ data: confirms }));
    const actualResponse = await ig.getDealDetails(dealReference);
    expect(actualResponse).toEqual(expectedConfirms);
  });

  it("Should throw an error for 4xx", async () => {
    //Prices call
    mockedAxios.get.mockRejectedValueOnce(mockResponse.build({ status: 400, statusText: "Bad Request" }));
    await expect(ig.getDealDetails(dealReference)).rejects.toThrow(Error);
  });
});
