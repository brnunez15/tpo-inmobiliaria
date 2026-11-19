import { PropertyStatus } from "../entities/enums";
import { ErrorConflicto, ErrorNoEncontrado, ErrorProhibido } from "../errors/dominio.errors";
import { AppDataSource } from "../config/data-source";
import { repositorioInmobiliaria } from "../repositories/inmobiliaria.repositorio";
import { Inmobiliaria } from "../entities/inmobiliaria";
import { Propiedad } from "../entities/propiedad";
import { repositorioPropiedad } from "../repositories/property.repository";
import { repositorioComentario } from "../repositories/comment.repository";
import { repositorioGaleriaImagen } from "../repositories/galeria-imagen.repository";
import { repositorioReseña } from "../repositories/review.repository";
import { ErrorNombreInmobiliariaDuplicado } from "./auth.service";

export class ErrorInmobiliariaNoEncontrada extends ErrorNoEncontrado {
  constructor(mensaje = "Inmobiliaria no encontrada") {
    super(mensaje);
  }
}
export class ErrorSinPermiso extends ErrorProhibido {
  constructor(mensaje = "No tenés permiso sobre esta inmobiliaria") {
    super(mensaje);
  }
}
export class ErrorInmobiliariaConPropiedadesActivas extends ErrorConflicto {
  constructor(mensaje = "No se puede eliminar la inmobiliaria porque tiene propiedades Publicadas o Reservadas") {
    super(mensaje);
  }
}

export {
  ErrorInmobiliariaNoEncontrada as AgencyNotFoundError,
  ErrorSinPermiso as AgencyForbiddenError,
  ErrorInmobiliariaConPropiedadesActivas as AgencyHasActivePropertiesError,
};

interface DatosActualizarInmobiliaria {
  name?: string;
  description?: string;
  logoUrl?: string | null;
  contactPhone?: string;
  contactEmail?: string;
  officeAddress?: string | null;
}

class ServicioInmobiliaria {
  async obtenerPerfil(id: number) {
    const inmobiliaria = await repositorioInmobiliaria.buscarPorId(id);
    if (!inmobiliaria) throw new ErrorInmobiliariaNoEncontrada();
    return this.aPerfilPublico(inmobiliaria);
  }

  async actualizar(id: number, vendedorId: number, datos: DatosActualizarInmobiliaria) {
    const inmobiliaria = await repositorioInmobiliaria.buscarPorId(id);
    if (!inmobiliaria) throw new ErrorInmobiliariaNoEncontrada();
    if (inmobiliaria.seller.id !== vendedorId) throw new ErrorSinPermiso();

        // El nombre de fantasía es único en toda la plataforma (regla del enunciado)
    if (datos.name !== undefined && datos.name !== inmobiliaria.name) {
      const repetida = await repositorioInmobiliaria.buscarPorNombre(datos.name);
      if (repetida && repetida.id !== id) throw new ErrorNombreInmobiliariaDuplicado();
    }

    Object.assign(inmobiliaria, datos);
    const guardada = await repositorioInmobiliaria.guardar(inmobiliaria);
    return this.aPerfilPublico(guardada);
  }

  async eliminar(id: number, vendedorId: number): Promise<void> {
    const inmobiliaria = await repositorioInmobiliaria.buscarPorId(id);
    if (!inmobiliaria) throw new ErrorInmobiliariaNoEncontrada();
    if (inmobiliaria.seller.id !== vendedorId) throw new ErrorSinPermiso();

    const cantidadActivas = await repositorioInmobiliaria.contarActivasPorInmobiliariaId(id);
    if (cantidadActivas > 0) throw new ErrorInmobiliariaConPropiedadesActivas();

    // Si llegamos acá, las propiedades que quedan son INACTIVAS
    // (Borrador, Pausada, Vendida, Alquilada, Cancelada).
    // La base no deja borrar una inmobiliaria que todavía tiene propiedades
    // (FK con ON DELETE RESTRICT), así que primero se borran las propiedades
    // y después la inmobiliaria.
    // Transacción (clase 4, QueryRunner): se borra todo o no se borra nada.
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Propiedades inactivas de la inmobiliaria.
      //    Su historial, comentarios, visitas, fotos y novedades se borran solos (CASCADE).
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Propiedad)
        .where("agency_id = :id", { id })
        .execute();

      // 2. La inmobiliaria (sus reseñas y novedades también se borran por CASCADE).
      //    El vendedor NO se borra: el enunciado dice que un vendedor tiene
      //    "como máximo" una inmobiliaria, así que puede quedar sin ninguna.
      await queryRunner.manager.delete(Inmobiliaria, id);

      await queryRunner.commitTransaction();
    } catch (error) {
      // Si algo falló, se deshace todo
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /** Verifica que la inmobiliaria exista y sea del vendedor logueado. */
  private async validarDueño(id: number, vendedorId: number): Promise<Inmobiliaria> {
    const inmobiliaria = await repositorioInmobiliaria.buscarPorId(id);
    if (!inmobiliaria) throw new ErrorInmobiliariaNoEncontrada();
    if (inmobiliaria.seller.id !== vendedorId) throw new ErrorSinPermiso();
    return inmobiliaria;
  }

  /**
   * "Mis propiedades" (pantalla del vendedor): sus propiedades en cualquier estado
   * (o solo las de un estado), paginadas, con la foto de portada y cuántas
   * consultas sin responder tiene cada una.
   */
  async obtenerMisPropiedades(
    id: number,
    vendedorId: number,
    filtros: { estado?: PropertyStatus },
    paginacion: { pagina: number; limite: number }
  ) {
    await this.validarDueño(id, vendedorId);

    const { datos: propiedades, total } = await repositorioPropiedad.buscarPorInmobiliariaId(
      id,
      filtros,
      paginacion
    );
    const portadas = await repositorioGaleriaImagen.buscarPortadas(propiedades.map((p) => p.id));
    const sinResponder = await repositorioComentario.contarSinResponderPorPropiedad(id);

    const data = propiedades.map((propiedad) => {
      const portada = portadas.find((imagen) => imagen.property.id === propiedad.id);
      const conteo = sinResponder.find((fila) => Number(fila.propiedadId) === propiedad.id);
      return {
        ...propiedad,
        // Mismo nombre que en el listado público (GET /properties)
        coverImageUrl: portada ? portada.url : null,
        consultasSinResponder: conteo ? Number(conteo.cantidad) : 0,
      };
    });

    return { data, total };
  }

  /**
   * "Consultas" (pantalla del vendedor): los comentarios de todas sus propiedades.
   * Con soloSinResponder = true trae solo las que falta contestar.
   */
  async obtenerConsultas(id: number, vendedorId: number, soloSinResponder: boolean) {
    await this.validarDueño(id, vendedorId);

    const comentarios = await repositorioComentario.buscarPorInmobiliariaId(id, soloSinResponder);

    // De la propiedad solo mandamos lo que necesita la pantalla
    return comentarios.map(({ property, ...comentario }) => ({
      ...comentario,
      property: { id: property.id, title: property.title },
    }));
  }

  async obtenerPropiedades(id: number): Promise<Propiedad[]> {
    const inmobiliaria = await repositorioInmobiliaria.buscarPorId(id);
    if (!inmobiliaria) throw new ErrorInmobiliariaNoEncontrada();
    return repositorioInmobiliaria.buscarPublicadasPorInmobiliariaId(id);
  }

  getPublicProfile(id: number) {
    return this.obtenerPerfil(id);
  }

  update(id: number, vendedorId: number, datos: DatosActualizarInmobiliaria) {
    return this.actualizar(id, vendedorId, datos);
  }

  delete(id: number, vendedorId: number) {
    return this.eliminar(id, vendedorId);
  }

  getProperties(id: number) {
    return this.obtenerPropiedades(id);
  }

  private async aPerfilPublico(inmobiliaria: Inmobiliaria) {
    const rating = await repositorioReseña.resumenPorInmobiliariaId(inmobiliaria.id);
    return {
      id: inmobiliaria.id,
      name: inmobiliaria.name,
      description: inmobiliaria.description,
      logoUrl: inmobiliaria.logoUrl,
      contactPhone: inmobiliaria.contactPhone,
      contactEmail: inmobiliaria.contactEmail,
      officeAddress: inmobiliaria.officeAddress,
      createdAt: inmobiliaria.createdAt,
      rating,
    };
  }
}
export const servicioInmobiliaria = new ServicioInmobiliaria();
export const agencyService = servicioInmobiliaria;