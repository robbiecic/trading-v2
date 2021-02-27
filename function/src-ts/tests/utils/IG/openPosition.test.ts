import axios from "axios";
import { mocked } from "ts-jest/utils";
import IG from "../../../utils/IG";
import { mockResponse } from "./factories";
import { OrderEvent, ActionTypes, DirectionTypes } from "../../../entity/OrderEvent";

jest.mock("axios");
const mockedAxios = mocked(axios, true);
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
    //Session
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ config: { method: "GET", url: `${ig.igUrl}/session` } }));
    //Prices call
    mockedAxios.post.mockResolvedValueOnce(mockResponse.build({ data: expectedResponse }));
    const actualResponse = await ig.placeOrder(orderEvent);
    expect(actualResponse).toEqual("123456");
  });

  it("Should throw an error for 4xx", async () => {
    //Session
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ config: { method: "GET", url: `${ig.igUrl}/session` } }));
    //Prices call
    mockedAxios.post.mockRejectedValueOnce(mockResponse.build({ status: 401, statusText: "Bad Request" }));
    await expect(ig.placeOrder(orderEvent)).rejects.toThrow(Error(`Could not place trade: Bad Request`));
  });
});
