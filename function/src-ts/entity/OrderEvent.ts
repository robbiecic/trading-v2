export enum ActionTypes {
  "Open",
  "Close",
}

export enum DirectionTypes {
  "LONG",
  "SHORT",
}

export interface OrderEvent {
  actionType: ActionTypes;
  direction: DirectionTypes;
  pair: string;
  orderDateUTC: string;
  priceTarget: number;
}
