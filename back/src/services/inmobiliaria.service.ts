import { repositorioInmobiliaria } from "../repositories/inmobiliaria.repositorio";
import { Inmobiliaria } from "../entities/inmobiliaria";
import { Propiedad } from "../entities/propiedad";

export class ErrorInmobiliariaNoEncontrada extends Error {}
export class ErrorSinPermiso extends Error {}
export class ErrorInmobiliariaConPropiedadesActivas extends Error {}

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

    await repositorioInmobiliaria.eliminar(inmobiliaria);
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

  private aPerfilPublico(inmobiliaria: Inmobiliaria) {
    return {
      id: inmobiliaria.id,
      nombre: inmobiliaria.name,
      descripcion: inmobiliaria.description,
      logo: inmobiliaria.logoUrl,
      telefonoContacto: inmobiliaria.contactPhone,
      emailContacto: inmobiliaria.contactEmail,
      direccionOficina: inmobiliaria.officeAddress,
      creadaEn: inmobiliaria.createdAt,
    };
  }
}

export const servicioInmobiliaria = new ServicioInmobiliaria();
export const agencyService = servicioInmobiliaria;