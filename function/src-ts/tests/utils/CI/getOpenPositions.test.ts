import CI from "../../../utils/CI";
import { mocked } from "ts-jest/utils";
import axios from "axios";
import { positions } from "../CI/api-responses/positions";
import { positions as expectedPositions } from "../CI/expected-results/positions";
import { mockResponse } from "./factories";


const ci = new CI();
Object.defineProperty(ci, "headers", { value: jest.fn() });
Object.defineProperty(ci, "tradingAccountId", { value: 123456 });

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


  describe("CI test for closing multiple orders", () => {

    it("Test - returnCloseOrderChunks()", async () => {
        mockedAxios.get.mockResolvedValueOnce(mockResponse.build({data: positions}));
        const closeMultiplePositionsResponse = await ci.getOpenPositions("AUD/USD");
        expect(closeMultiplePositionsResponse).toEqual(expectedPositions);
    });
  });