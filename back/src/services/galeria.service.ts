import { AppDataSource } from "../config/data-source";
import { ErrorNoEncontrado, ErrorProhibido, ErrorReglaNegocio } from "../errors/dominio.errors";
import { repositorioPropiedad } from "../repositories/property.repository";
import { repositorioGaleriaImagen } from "../repositories/galeria-imagen.repository";
import { GaleriaImagen } from "../entities/galeria-imagenes";
import { PropertyStatus } from "../entities/enums";

export class ErrorPropiedadNoEncontrada extends ErrorNoEncontrado {
  constructor(mensaje = "Propiedad no encontrada") {
    super(mensaje);
  }
}
export class ErrorImagenNoEncontrada extends ErrorNoEncontrado {
  constructor(mensaje = "Imagen no encontrada") {
    super(mensaje);
  }
}
export class ErrorSinPermiso extends ErrorProhibido {
  constructor(mensaje = "No tenés permiso para modificar las fotos de esta propiedad") {
    super(mensaje);
  }
}

// Estados en los que la propiedad está a la vista: tiene que tener al menos una foto
const ESTADOS_VISIBLES = [PropertyStatus.PUBLISHED, PropertyStatus.RESERVED];

class ServicioGaleria {
  /** Verifica que la propiedad exista y sea del vendedor logueado. */
  private async validarDueño(propiedadId: number, vendedorId: number) {
    const propiedad = await repositorioPropiedad.buscarPorId(propiedadId);
    if (!propiedad) throw new ErrorPropiedadNoEncontrada();
    if (propiedad.agency.seller.id !== vendedorId) throw new ErrorSinPermiso();
    return propiedad;
  }

  listar(propiedadId: number) {
    return repositorioGaleriaImagen.buscarPorPropiedadId(propiedadId);
  }

  async agregar(
    propiedadId: number,
    vendedorId: number,
    datos: { url: string; isCover?: boolean }
  ): Promise<GaleriaImagen> {
    await this.validarDueño(propiedadId, vendedorId);

    // La foto nueva va al final; la primera foto siempre es la portada.
    const cantidad = await repositorioGaleriaImagen.contarPorPropiedadId(propiedadId);
    const esPortada = cantidad === 0 || datos.isCover === true;

    // Transacción (clase 4, QueryRunner): si la nueva es portada,
    // primero se le saca la portada a las demás. Las dos cosas o ninguna.
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (esPortada) {
        await queryRunner.manager.update(
          GaleriaImagen,
          { property: { id: propiedadId } },
          { isCover: false }
        );
      }

      const imagen = queryRunner.manager.create(GaleriaImagen, {
        url: datos.url,
        position: cantidad,
        isCover: esPortada,
        property: { id: propiedadId },
      });
      await queryRunner.manager.save(imagen);

      await queryRunner.commitTransaction();

      // Se devuelve sin la relación con la propiedad
      return { id: imagen.id, url: imagen.url, position: imagen.position, isCover: imagen.isCover } as GaleriaImagen;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async eliminar(propiedadId: number, imagenId: number, vendedorId: number): Promise<void> {
    const propiedad = await this.validarDueño(propiedadId, vendedorId);

    const imagen = await repositorioGaleriaImagen.buscarDePropiedad(imagenId, propiedadId);
    if (!imagen) throw new ErrorImagenNoEncontrada();

    // Regla del enunciado: "Galería de fotos (mínimo una)".
    // Una propiedad Publicada o Reservada no se puede quedar sin fotos.
    const cantidad = await repositorioGaleriaImagen.contarPorPropiedadId(propiedadId);
    if (cantidad === 1 && ESTADOS_VISIBLES.includes(propiedad.status)) {
      throw new ErrorReglaNegocio("Una propiedad publicada tiene que tener al menos una foto");
    }

    // Transacción: se borra la foto y, si era la portada, la primera
    // de las que quedan pasa a ser la portada nueva.
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(GaleriaImagen, imagen.id);

      if (imagen.isCover) {
        const siguiente = await queryRunner.manager.findOne(GaleriaImagen, {
          where: { property: { id: propiedadId } },
          order: { position: "ASC" },
        });
        if (siguiente) {
          await queryRunner.manager.update(GaleriaImagen, siguiente.id, { isCover: true });
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /** Marca una foto que ya existe como portada (y les saca la portada a las demás). */
  async cambiarPortada(propiedadId: number, imagenId: number, vendedorId: number) {
    await this.validarDueño(propiedadId, vendedorId);

    const imagen = await repositorioGaleriaImagen.buscarDePropiedad(imagenId, propiedadId);
    if (!imagen) throw new ErrorImagenNoEncontrada();

    // Transacción: sacar la portada a todas y ponérsela a esta, las dos o ninguna
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        GaleriaImagen,
        { property: { id: propiedadId } },
        { isCover: false }
      );
      await queryRunner.manager.update(GaleriaImagen, imagen.id, { isCover: true });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return repositorioGaleriaImagen.buscarPorPropiedadId(propiedadId);
  }

  /**
   * Reordena la galería ("múltiples imágenes ordenables").
   * Recibe los ids de TODAS las fotos en el orden nuevo: [3, 1, 2]
   * → la foto 3 queda en la posición 0, la 1 en la 1, la 2 en la 2.
   */
  async ordenar(propiedadId: number, vendedorId: number, orden: number[]) {
    await this.validarDueño(propiedadId, vendedorId);

    const actuales = await repositorioGaleriaImagen.buscarPorPropiedadId(propiedadId);
    const idsActuales = actuales.map((imagen) => imagen.id);

    // Tienen que venir todas las fotos de la propiedad, sin repetir y sin agregar otras
    const mismoContenido =
      orden.length === idsActuales.length &&
      new Set(orden).size === orden.length &&
      orden.every((id) => idsActuales.includes(id));
    if (!mismoContenido) {
      throw new ErrorReglaNegocio("El orden tiene que incluir todas las fotos de la propiedad, una sola vez");
    }

    // Transacción: se actualizan todas las posiciones o ninguna
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const [posicion, id] of orden.entries()) {
        await queryRunner.manager.update(GaleriaImagen, id, { position: posicion });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return repositorioGaleriaImagen.buscarPorPropiedadId(propiedadId);
  }
}

export const servicioGaleria = new ServicioGaleria();
