import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Propiedad } from "./propiedad";

@Entity("comments")
export class Comentario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  authorName!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "text", nullable: true })
  response!: string | null;

  @ManyToOne(() => Propiedad, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "property_id" })
  property!: Propiedad;

  @CreateDateColumn()
  createdAt!: Date;
}