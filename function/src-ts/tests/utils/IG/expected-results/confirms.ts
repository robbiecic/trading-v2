import { Confirms, epics } from "../../../../utils/IG";

export const expectedConfirms: Confirms = {
  date: new Date("2021-02-27T17:23:09.869"),
  status: null as string,
  reason: "UNKNOWN",
  dealStatus: "REJECTED",
  epic: "CS.D.AUDUSD.MINI.IP" as epics,
  expiry: null as string,
  dealReference: "WZJ8FXKEVWF44TP",
  dealId: "DIAAAAE9MJR5DA9",
  affectedDeals: [] as any,
  level: null as number,
  size: null as number,
  direction: "BUY",
  stopLevel: null as number,
  limitLevel: null as number,
  stopDistance: null as number,
  limitDistance: null as number,
  guaranteedStop: false,
  trailingStop: false,
  profit: null as number,
  profitCurrency: null as string,
};
