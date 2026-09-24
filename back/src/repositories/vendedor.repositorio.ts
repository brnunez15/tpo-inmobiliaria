import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Vendedor } from "../entities/vendedor";

class RepositorioVendedor {
  private get repositorio(): Repository<Vendedor> {
    return AppDataSource.getRepository(Vendedor);
  }

  buscarPorEmail(email: string): Promise<Vendedor | null> {
    return this.repositorio.findOneBy({ email });
  }

  crear(datos: { email: string; passwordHash: string; fullName: string }): Promise<Vendedor> {
    const vendedor = this.repositorio.create(datos);
    return this.repositorio.save(vendedor);
  }
}

export const repositorioVendedor = new RepositorioVendedor();