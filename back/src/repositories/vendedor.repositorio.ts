import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Vendedor } from "../entities/vendedor";

class SellerRepository {
  private get repository(): Repository<Vendedor> {
    return AppDataSource.getRepository(Vendedor);
  }

  findByEmail(email: string): Promise<Vendedor | null> {
    return this.repository.findOneBy({ email });
  }

  findById(id: number): Promise<Vendedor | null> {
    return this.repository.findOneBy({ id });
  }
}

export const sellerRepository = new SellerRepository();