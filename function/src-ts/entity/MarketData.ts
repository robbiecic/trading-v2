import { Entity, PrimaryColumn, Column } from "typeorm";

export interface MarketDataInterface {
  dateTime: Date;
  snapshotTimeUTC: Date;
  pair?: string;
  openPrice: Number;
  closePrice: Number;
  highPrice: Number;
  lowPrice: Number;
  lastTradedVolume: Number;
  insertStamp: Date;
}

@Entity()
export class MarketDataEntity {
  @PrimaryColumn({ type: "datetime" })
  dateTime: Date;
  @PrimaryColumn({ type: "datetime" })
  snapshotTimeUTC: Date;
  @PrimaryColumn({ type: "varchar" })
  pair: string;
  @Column({ type: "double" })
  openPrice: Number;
  @Column({ type: "double" })
  closePrice: Number;
  @Column({ type: "double" })
  highPrice: Number;
  @Column({ type: "double" })
  lowPrice: Number;
  @Column({ type: "int" })
  lastTradedVolume: Number;
  @Column({ type: "datetime" })
  insertStamp: Date;
}
