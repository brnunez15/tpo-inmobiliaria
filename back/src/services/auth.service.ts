import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { Vendedor } from "../entities/vendedor";
import { Inmobiliaria } from "../entities/inmobiliaria";
import { sellerRepository } from "../repositories/vendedor.repositorio";
import { agencyRepository } from "../repositories/inmobiliaria.repositorio";

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  agencyName: string;
  contactPhone: string;
  contactEmail: string;
  description: string;
}

// Estos dos "errores con nombre" nos van a servir para que el controller
// sepa qué status code devolver sin tener que repetir el mensaje ahí.
export class EmailAlreadyExistsError extends Error {}
export class AgencyNameAlreadyExistsError extends Error {}
export class InvalidCredentialsError extends Error {}

class AuthService {
  async register(input: RegisterInput): Promise<{ id: number; email: string }> {
    const existingSeller = await sellerRepository.findByEmail(input.email);
    if (existingSeller) throw new EmailAlreadyExistsError();

    const existingAgency = await agencyRepository.findByName(input.agencyName);
    if (existingAgency) throw new AgencyNameAlreadyExistsError();

    const passwordHash = await bcrypt.hash(input.password, 10);

    // las dos filas se guardan juntas,
    // dentro de una transacción manejada por TypeORM.
    const savedSeller = await AppDataSource.transaction(async (manager) => {
      const seller = await manager.save(Vendedor, {
        fullName: input.fullName,
        email: input.email,
        passwordHash,
      });

      await manager.save(Inmobiliaria, {
        name: input.agencyName,
        description: input.description,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        seller,
      });

      return seller;
    });

    return { id: savedSeller.id, email: savedSeller.email };
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const seller = await sellerRepository.findByEmail(email);
    if (!seller) throw new InvalidCredentialsError();

    const passwordMatches = await bcrypt.compare(password, seller.passwordHash);
    if (!passwordMatches) throw new InvalidCredentialsError();

    const token = jwt.sign({ sellerId: seller.id }, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });

    return { token };
  }
}

export const authService = new AuthService();