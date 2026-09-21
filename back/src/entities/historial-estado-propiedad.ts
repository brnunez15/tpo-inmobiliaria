import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Propiedad } from "./propiedad";
import { PropertyStatus } from "./enums";

@Entity("property_status_history")
export class HistorialEstadoPropiedad {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "enum", enum: PropertyStatus })
  fromStatus!: PropertyStatus;

  @Column({ type: "enum", enum: PropertyStatus })
  toStatus!: PropertyStatus;

  @ManyToOne(() => Propiedad, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "property_id" })
  property!: Propiedad;

  @CreateDateColumn()
  createdAt!: Date;
}
