import IG from "../../utils/IG";
import axios, { AxiosResponse } from "axios";
import { mocked } from "ts-jest/utils";

jest.mock("axios");
const mockedAxios = mocked(axios, true);

const ig = new IG();

describe("IG()", () => {
  afterEach(jest.clearAllMocks);

  it("Mock out IG Connect call", async () => {
    let mockResponse: AxiosResponse;
    let expectedResponseBody = {
      "X-SECURITY-TOKEN": "1234",
      CST: "456",
    };
    mockResponse.data = expectedResponseBody;
    mockedAxios.mockResolvedValueOnce(mockResponse);
    const response = await ig.connect();
    expect(response).toEqual(expectedResponseBody);
  });
});

// it('should return app that has been just created', async () => {
//   const payload = mockApigeeApp.build();

//   // apigee returns data is returned after created
//   mockedAxios.mockResolvedValueOnce(mockResponse.build({ data: payload }));
//   const result = await createCompanyApp(payload.companyName, payload);
//   expect(result).toEqual(payload);
// });
