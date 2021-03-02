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
export class tradingHistory {
  @PrimaryColumn({ type: "datetime" })
  eventDate: Date;
  @PrimaryColumn({ type: "varchar" })
  eventAction: String;
  @PrimaryColumn({ type: "varchar" })
  dealID: String;
  @Column({ type: "varchar" })
  dealReference: String;
  @Column({ type: "varchar" })
  epic: String;
  @Column({ type: "double" })
  level: Number;
  @Column({ type: "double" })
  size: Number;
  @Column({ type: "varchar" })
  direction: String;
  @Column({ type: "double", nullable: true })
  profit: Number;
  @Column({ type: "double", nullable: true })
  targetPrice: Number;
  @Column({ type: "datetime", nullable: true })
  originalOrderDateUTC: Date;
  @Column({ type: "varchar", nullable: true })
  pair: String;
}
