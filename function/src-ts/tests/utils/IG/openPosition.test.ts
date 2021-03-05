import axios from "axios";
import { mocked } from "ts-jest/utils";
import IG from "../../../utils/IG";
import { mockResponse } from "./factories";
import { OrderEvent, ActionTypes, DirectionTypes } from "../../../entity/OrderEvent";

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

const ig = new IG();

const orderEvent: OrderEvent = {
  actionType: ActionTypes.Open,
  direction: DirectionTypes.LONG,
  pair: "AUD/USD",
  orderDateUTC: new Date(),
  priceTarget: 0.761,
};

describe("IG open positions test suite", () => {
  afterEach(jest.clearAllMocks);

  it("Should open position successfully", async () => {
    let expectedResponse = { dealReference: "123456" };
    //Prices call
    mockedAxios.post.mockResolvedValueOnce(mockResponse.build({ data: expectedResponse }));
    const actualResponse = await ig.placeOrder(orderEvent);
    expect(actualResponse).toEqual("123456");
  });

  it("Should throw an error for 4xx", async () => {
    //Prices call
    mockedAxios.post.mockRejectedValueOnce(mockResponse.build({ status: 401, statusText: "Bad Request" }));
    await expect(ig.placeOrder(orderEvent)).rejects.toThrow(Error);
  });
});
