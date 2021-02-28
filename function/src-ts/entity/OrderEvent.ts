export enum ActionTypes {
  Open = "Open",
  Close = "Close",
}

export enum DirectionTypes {
  LONG = "LONG",
  SHORT = "SHORT",
}

export interface OrderEvent {
  actionType: ActionTypes;
  direction: DirectionTypes;
  pair: string;
  orderDateUTC: Date;
  priceTarget: number;
}
