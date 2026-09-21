import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Inmobiliaria } from "./inmobiliaria";

@Entity("reviews")
export class Reseña {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  authorName!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "smallint" })
  rating!: number;

  @ManyToOne(() => Inmobiliaria, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "agency_id" })
  agency!: Inmobiliaria;

  @CreateDateColumn()
  createdAt!: Date;
}