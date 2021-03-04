import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import * as rax from "retry-axios";
import { mocked } from "ts-jest/utils";
import IG from "../../../utils/IG";
import { mockResponse } from "./factories";
import { positions } from "./api-responses/positions";
import { expectedPositions } from "./expected-results/positions";
import { JsxEmit } from "typescript";

// jest.mock("axios");
const mockedAxios = mocked(axios, true);

// let axiosConfig: AxiosRequestConfig;
// axiosConfig.baseURL = "https://demo-api.ig.com/deal";

// let axiosInstance: AxiosInstance;
// axiosInstance.defaults = {
//   baseURL: "test",
//   raxConfig: { instance: mockedAxios, retryDelay: 500 },
// };

// test.defaults = {
//   baseURL: "test",
//   raxConfig: { instance: mockedAxios, retryDelay: 500 },
// };

// mockedAxios.create = jest.fn((axiosConfig) => axios);
// mockedAxios.create = jest.fn((config) => axios);

jest.mock("axios", () => ({
  defaults: {
    baseURL: "test",
    raxConfig: {},
  },
  create: () => axios,
  get: jest.fn(() => Promise.resolve()),
}));

jest.mock("retry-axios", () => ({
  attach: () => 12345,
}));

// mockedAxios.defaults =
// let retryConfig: rax.RetryConfig;
// jest.mock("rax.RetryConfig", () => ({
//   retryConfig: {
//     retryDelay: 500,
//     instance: mockedAxios,
//   },
// }));
// // let retryConfig: rax.RetryConfig;
// // retryConfig.retryDelay = 500;
// // retryConfig.instance = mockedAxios;

// // mockedAxios.defaults.raxConfig = jest.fn(() => retryConfig);
// jest.mock("rax.RetryConfig", () => ({
//   retryConfig: {
//     retryDelay: 500,
//     instance: mockedAxios,
//   },
// }));

// instance.defaults.raxConfig = {
//   instance: instance,
//   retryDelay: 500,
// };

// mockedAxios.defaults.raxConfig = jest.fn(() => mockedAxios);
// mockedAxios.defaults.raxConfig = {
// instance: instance,
// retryDelay: 500,
// };

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
    await expect(ig.getOpenPositions()).rejects.toThrow(Error);
  });
});
