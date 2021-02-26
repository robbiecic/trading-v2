import axios from "axios";
import { mocked } from "ts-jest/utils";
import IG, { resolutions } from "../../utils/IG";
import { AxiosResponse } from "axios";
import { Factory } from "rosie";
import { internet, random } from "faker";

export const mockResponse = Factory.define<AxiosResponse>("AxiosResponseFactory").attrs({
  status: 200,
  statusText: "Success",
  headers: () => ({
    "Content-Type": "application/json",
  }),
  config: () => ({
    url: internet.url(),
    method: random.arrayElement(["GET", "POST", "DELETE"]),
  }),
  data: () => ({
    num: random.number(),
    text: random.words(),
    boolValue: true,
  }),
});

const successHeaders = {
  "x-security-token": "1234",
  cst: "456",
};

jest.mock("axios");

const mockedAxios = mocked(axios, true);
const ig = new IG();

// mockedAxios.get.mockResolvedValueOnce((url) => {
//   switch(url) {
//     case `${ig.igUrl}/prices/CS.D.AUDUSD.CFD.IP?resolution=MINUTE_10&max=1`:
//       return Promise.resolve({ data: { app: appData })
//   }
// });

describe("getApps()", () => {
  afterEach(jest.clearAllMocks);

  it("should return list of apps", async () => {
    const priceData = [
      {
        snapshotTime: "",
        snapshotTimeUTC: "",
        openPrice: {
          ask: 1,
        },
        closePrice: {
          ask: 2,
        },
        highPrice: {
          ask: 3,
        },
        lowPrice: {
          ask: 3,
        },
        lastTradedVolume: 100,
      },
    ];
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ config: { method: "GET", url: `${ig.igUrl}/session` }, headers: successHeaders }));
    mockedAxios.get.mockResolvedValueOnce(mockResponse.build({ data: { prices: priceData } }));

    const result = await ig.getPrices("AUD/USD", resolutions.MINUTE_10);
    expect(result).toEqual(priceData);
  });
});
