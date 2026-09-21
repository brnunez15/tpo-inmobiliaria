import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Propiedad } from "./propiedad";
import { VisitRequestStatus } from "./enums";

@Entity("visit_requests")
export class SolicitudVisita {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  requesterName!: string;

  @Column({ length: 40 })
  requesterPhone!: string;

  @Column({ type: "timestamptz" })
  proposedDate!: Date;

  @Column({ type: "text", nullable: true })
  message!: string | null;

  @Column({ type: "enum", enum: VisitRequestStatus, default: VisitRequestStatus.PENDING })
  status!: VisitRequestStatus;

  @ManyToOne(() => Propiedad, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "property_id" })
  property!: Propiedad;

  @CreateDateColumn()
  createdAt!: Date;
}