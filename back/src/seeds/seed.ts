import { AppDataSource } from "../config/data-source";
import { Vendedor } from "../entities/vendedor";
import { Inmobiliaria } from "../entities/inmobiliaria";
import { Propiedad } from "../entities/propiedad";
import { PropertyType, OperationType, PropertyStatus, VisitRequestStatus, ActivityType } from "../entities/enums";
import bcrypt from "bcrypt";
import { HistorialEstadoPropiedad } from "../entities/historial-estado-propiedad";
import { SolicitudVisita } from "../entities/visitas";
import { Comentario } from "../entities/historial-comentarios";
import { Reseña } from "../entities/historial-reseñas";
import { Actividad } from "../entities/actividad";

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  console.log("Seeding database...");

  // clear all data
  await AppDataSource.query(`TRUNCATE TABLE agencies, sellers, properties, property_status_history, activities, visit_requests, comments, reviews RESTART IDENTITY CASCADE;`);

  const hash = await bcrypt.hash("password123", 10);

  // Vendedor
  const vendedorRepo = AppDataSource.getRepository(Vendedor);
  const vendedor = vendedorRepo.create({
    fullName: "Juan Perez",
    email: "juan@example.com",
    passwordHash: hash,
    phone: "123456789"
  });
  await vendedorRepo.save(vendedor);

  // Inmobiliaria
  const inmoRepo = AppDataSource.getRepository(Inmobiliaria);
  const inmobiliaria = inmoRepo.create({
    name: "Inmobiliaria Perez",
    description: "La mejor inmobiliaria de la ciudad",
    contactPhone: "123456789",
    contactEmail: "contacto@inmobiliariaperez.com",
    seller: vendedor,
    officeAddress: "Calle Falsa 123"
  });
  await inmoRepo.save(inmobiliaria);

  // Properties
  const propRepo = AppDataSource.getRepository(Propiedad);
  
  const propiedadPublicada = propRepo.create({
    title: "Casa hermosa en el centro",
    description: "Gran casa con patio y pileta",
    type: PropertyType.HOUSE,
    operation: OperationType.SALE,
    price: "150000",
    currency: "USD",
    address: "Av Siempreviva 742",
    area: "Centro",
    coveredAreaM2: "120",
    totalAreaM2: "200",
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    ageYears: 10,
    tags: ["luminoso", "patio", "pileta"],
    status: PropertyStatus.PUBLISHED,
    agency: inmobiliaria
  });
  await propRepo.save(propiedadPublicada);

  const propiedadBorrador = propRepo.create({
    title: "Depto en pozo 2 ambientes",
    description: "Excelente oportunidad de inversion",
    type: PropertyType.APARTMENT,
    operation: OperationType.SALE,
    price: "50000",
    currency: "USD",
    address: "Calle 1 123",
    area: "Sur",
    coveredAreaM2: "40",
    totalAreaM2: "45",
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    ageYears: 0,
    tags: ["pozo", "inversion"],
    status: PropertyStatus.DRAFT,
    agency: inmobiliaria
  });
  await propRepo.save(propiedadBorrador);

  // Property Status History
  const statusRepo = AppDataSource.getRepository(HistorialEstadoPropiedad);
  await statusRepo.save(statusRepo.create({
    property: propiedadPublicada,
    fromStatus: PropertyStatus.DRAFT,
    toStatus: PropertyStatus.PUBLISHED
  }));

  const activityRepo = AppDataSource.getRepository(Actividad);
  await activityRepo.save(activityRepo.create({
    type: ActivityType.PROPERTY_STATUS_CHANGE,
    agency: inmobiliaria,
    property: propiedadPublicada
  }));

  // Comment
  const commentRepo = AppDataSource.getRepository(Comentario);
  const comment = await commentRepo.save(commentRepo.create({
    authorName: "Cliente Uno",
    content: "Hola, aceptan mascotas?",
    property: propiedadPublicada
  }));

  await activityRepo.save(activityRepo.create({
    type: ActivityType.COMMENT,
    agency: inmobiliaria,
    property: propiedadPublicada,
    comment: comment
  }));

  // Visits
  const visitRepo = AppDataSource.getRepository(SolicitudVisita);
  const visita = await visitRepo.save(visitRepo.create({
    requesterName: "Cliente Dos",
    requesterPhone: "987654321",
    proposedDate: new Date(Date.now() + 86400000), // Tomorrow
    message: "Quisiera ver la propiedad mañana",
    status: VisitRequestStatus.PENDING,
    property: propiedadPublicada
  }));

  await activityRepo.save(activityRepo.create({
    type: ActivityType.VISIT_REQUEST,
    agency: inmobiliaria,
    property: propiedadPublicada,
    visitRequest: visita
  }));

  // Reviews
  const reviewRepo = AppDataSource.getRepository(Reseña);
  const review = await reviewRepo.save(reviewRepo.create({
    authorName: "Cliente Tres",
    content: "Excelente atencion y la casa es hermosa.",
    rating: 5,
    agency: inmobiliaria
  }));

  await activityRepo.save(activityRepo.create({
    type: ActivityType.REVIEW,
    agency: inmobiliaria,
    review: review
  }));

  console.log("Seeding completed successfully!");
  await AppDataSource.destroy();
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
