import axios from "axios";
import { mocked } from "ts-jest/utils";
import IG from "../../../utils/IG";
import { mockResponse } from "./factories";
import { positions } from "./api-responses/positions";
import { expectedPositions } from "./expected-results/positions";
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

describe("IG positions data test suite", () => {
  afterEach(jest.clearAllMocks);
  let expectedResponse = { dealReference: "123456" };
  it("Should close position successfully", async () => {
    //Session
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ config: { method: "GET", url: `${ig.igUrl}/session` } }));
    //Prices call
    mockedAxios.delete.mockResolvedValueOnce(mockResponse.build({ data: expectedResponse }));
    const actualResponse = await ig.closePosition(expectedPositions[0], orderEvent);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it("Should throw an error for 400", async () => {
    //Session
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ config: { method: "GET", url: `${ig.igUrl}/session` } }));
    //Prices call
    mockedAxios.delete.mockRejectedValueOnce(mockResponse.build({ status: 401, statusText: "Bad Request" }));
    await expect(ig.closePosition(expectedPositions[0], orderEvent)).rejects.toThrow(Error(`Could not close position: Bad Request`));
  });
});
