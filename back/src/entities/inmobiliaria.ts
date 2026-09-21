import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Vendedor } from "./vendedor";

@Entity("agencies")
export class Inmobiliaria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 120 })
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", nullable: true, length: 500 })
  logoUrl!: string | null;

  @Column({ length: 40 })
  contactPhone!: string;

  @Column({ length: 255 })
  contactEmail!: string;

  @Column({ type: "varchar", nullable: true, length: 255 })
  officeAddress!: string | null;

  @OneToOne(() => Vendedor, { nullable: false })
  @JoinColumn({ name: "seller_id" })
  seller!: Vendedor;

  @CreateDateColumn()
  createdAt!: Date;
}
