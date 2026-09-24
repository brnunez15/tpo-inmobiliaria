import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Propiedad } from "./propiedad";

@Entity("property_images")
export class GaleriaImagen {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 500 })
  url!: string;

  @Column({ type: "smallint", default: 0 })
  position!: number;

  @Column({ type: "boolean", default: false })
  isCover!: boolean;

  @ManyToOne(() => Propiedad, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "property_id" })
  property!: Propiedad;
}