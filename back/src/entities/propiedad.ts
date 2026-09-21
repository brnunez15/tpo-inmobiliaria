import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Inmobiliaria } from "./inmobiliaria";
import { OperationType, PropertyStatus, PropertyType } from "./enums";

@Entity("properties")
export class Propiedad {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 160 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "enum", enum: PropertyType })
  type!: PropertyType;

  @Column({ type: "enum", enum: OperationType })
  operation!: OperationType;

  @Column({ type: "decimal", precision: 14, scale: 2 })
  price!: string;

  @Column({ type: "varchar", length: 3 })
  currency!: "ARS" | "USD";

  @Column({ length: 255 })
  address!: string;

  @Column({ length: 120 })
  area!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  coveredAreaM2!: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalAreaM2!: string;

  @Column({ type: "smallint", nullable: true })
  rooms!: number | null;

  @Column({ type: "smallint", nullable: true })
  bedrooms!: number | null;

  @Column({ type: "smallint", nullable: true })
  bathrooms!: number | null;

  @Column({ type: "smallint", nullable: true })
  ageYears!: number | null;

  @Column({ type: "simple-array", default: "" })
  tags!: string[];

  @Column({ type: "enum", enum: PropertyStatus, default: PropertyStatus.DRAFT })
  status!: PropertyStatus;

  @ManyToOne(() => Inmobiliaria, { nullable: false, onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({ name: "agency_id" })
  agency!: Inmobiliaria;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
