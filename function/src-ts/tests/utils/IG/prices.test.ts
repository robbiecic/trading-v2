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
Object.defineProperty(ig, "headers", { value: jest.fn() });
