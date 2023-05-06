import { Deal } from "../../../entity/Deal";
import { igEpics } from "../../../utils/Broker";

export const expectedDeal: Deal = {
  eventDate: new Date("2021-02-27T17:23:09.869"),
  eventAction: "Open",
  dealID: "DIAAAAE9MJR5DA9",
  accountName: "CI_RODI_DEMO",
  dealReference: "WZJ8FXKEVWF44TP",
  epic: "CS.D.AUDUSD.MINI.IP" as igEpics,
  level: null,
  size: null,
  direction: "BUY",
  profit: null,
  targetPrice: 0.761,
  originalOrderDateUTC: new Date(),
  pair: "AUD/USD",
};
