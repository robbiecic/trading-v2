import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class tradingHistory {
  @PrimaryColumn({ type: "datetime" })
  eventDate: Date;
}
