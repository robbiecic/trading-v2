import { Entity, PrimaryColumn, Column } from "typeorm";

//Non-IG specific interface to record deal details
export interface Deal {
  eventDate: Date;
  eventAction: String;
  dealID: String;
  dealReference: String;
  epic: String;
  level: Number;
  size: Number;
  direction: String;
  profit?: Number;
  targetPrice?: Number;
  originalOrderDateUTC?: Date;
  pair?: String;
}

@Entity()
export class MarketDataEntity {
  @PrimaryColumn({ type: "datetime" })
  eventDate: Date;
  @PrimaryColumn({ type: "varchar" })
  eventAction: string;
  @PrimaryColumn({ type: "varchar" })
  dealID: string;
  @Column({ type: "varchar" })
  dealReference: string;
  @Column({ type: "varchar" })
  epic: string;
  @Column({ type: "double" })
  level: Number;
  @Column({ type: "double" })
  size: Number;
  @Column({ type: "varchar" })
  direction: string;
  @Column({ type: "double" })
  profit: Number;
  @Column({ type: "double" })
  targetPrice: Number;
  @Column({ type: "datetime" })
  originalOrderDateUTC: Date;
  @Column({ type: "varchar" })
  pair: string;
}
