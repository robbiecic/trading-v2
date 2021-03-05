import axios from "axios";
import { mocked } from "ts-jest/utils";
import IG from "../../../utils/IG";
import { mockResponse } from "./factories";
import { expectedPositions } from "./expected-results/positions";
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
  delete: jest.fn(() => Promise),
}));
jest.mock("retry-axios", () => ({
  attach: () => 12345,
}));

const ig = new IG();
const oAuthToken = { data: { oauthToken: { access_token: "123456" } } };

const orderEvent: OrderEvent = {
  actionType: ActionTypes.Open,
  direction: DirectionTypes.LONG,
  pair: "AUD/USD",
  orderDateUTC: new Date(),
  priceTarget: 0.761,
};

describe("IG close positions test suite", () => {
  afterEach(jest.clearAllMocks);

  it("Should close position successfully", async () => {
    let expectedResponse = { dealReference: "123456" };
    //Prices call
    mockedAxios.post.mockResolvedValueOnce(mockResponse.build({ data: expectedResponse }));
    const actualResponse = await ig.closePosition(expectedPositions[0], orderEvent);
    expect(actualResponse).toEqual("123456");
  });

  it("Should throw an error for 400", async () => {
    //Prices call
    mockedAxios.delete.mockRejectedValueOnce(mockResponse.build({ status: 401, statusText: "Bad Request" }));
    await expect(ig.closePosition(expectedPositions[0], orderEvent)).rejects.toThrow(Error);
  });
});
