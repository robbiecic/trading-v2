import { AxiosResponse } from "axios";
import { Factory } from "rosie";
import { internet, random } from "faker";

export const mockResponse = Factory.define<AxiosResponse>("AxiosResponseFactory").attrs({
  status: 200,
  statusText: "Success",
  headers: () => ({
    "Content-Type": "application/json",
    "x-security-token": "ba387d409e402838b96f37e23b6c387cda78058a5cbaa720b835c09a32bc4aCD01112",
    cst: "73c505d2d63f7d6af65921e587e29a8d7ea793d5c5a578ef305cf043e3c2e7CU01112",
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
