import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Inmobiliaria } from "./inmobiliaria";
import { Comentario } from "./historial-comentarios";
import { Reseña } from "./historial-reseñas";
import { SolicitudVisita } from "./visitas";
import { Propiedad } from "./propiedad";
import { ActivityType } from "./enums";
 
@Entity("activities")
export class Actividad {
  @PrimaryGeneratedColumn()
  id!: number;
 
  @Column({ type: "enum", enum: ActivityType })
  type!: ActivityType;
 
  @Column({ default: false })
  read!: boolean;
 
  // Dueña del feed: siempre presente, es sobre quién se filtra en
  // GET /agencies/:id/activity.
  @ManyToOne(() => Inmobiliaria, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "agency_id" })
  agency!: Inmobiliaria;
 
  // Solo una de estas cuatro va a estar cargada, según "type".
  // Las cuatro son opcionales (nullable: true) por eso.
  @ManyToOne(() => Propiedad, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "property_id" })
  property!: Propiedad | null;
 
  @ManyToOne(() => Comentario, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "comment_id" })
  comment!: Comentario | null;
 
  @ManyToOne(() => SolicitudVisita, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "visit_request_id" })
  visitRequest!: SolicitudVisita | null;
 
  @ManyToOne(() => Reseña, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "review_id" })
  review!: Reseña | null;
 
  @CreateDateColumn()
  createdAt!: Date;
}
 