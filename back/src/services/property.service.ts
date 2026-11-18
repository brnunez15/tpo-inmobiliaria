import { ErrorNoEncontrado, ErrorProhibido, ErrorReglaNegocio } from "../errors/dominio.errors";
import { repositorioPropiedad } from "../repositories/property.repository";
import { repositorioInmobiliaria } from "../repositories/inmobiliaria.repositorio";
import { ErrorSinPermiso } from "./property-status.service";
import { repositorioGaleriaImagen } from "../repositories/galeria-imagen.repository";
import { repositorioSolicitudVisita } from "../repositories/visit-request.repository";
import { Propiedad } from "../entities/propiedad";
import { GaleriaImagen } from "../entities/galeria-imagenes";
import { PropertyType, OperationType, PropertyStatus } from "../entities/enums";

export class ErrorPropiedadNoEncontrada extends ErrorNoEncontrado {
  constructor(mensaje = "Propiedad no encontrada") {
    super(mensaje);
  }
}
export class ErrorSinInmobiliaria extends ErrorProhibido {
  constructor(mensaje = "Necesitás tener una inmobiliaria para publicar propiedades") {
    super(mensaje);
  }
}

interface DatosCrearPropiedad {
  title: string;
  description: string;
  type: "HOUSE" | "APARTMENT" | "LAND" | "COMMERCIAL";
  operation: "SALE" | "RENT";
  price: string;
  currency: "ARS" | "USD";
  address: string;
  area: string;
  totalAreaM2: string;
  coveredAreaM2?: string | null;
  rooms?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  ageYears?: number | null;
  tags?: string[];
  status?: PropertyStatus;
  agency: { id: number };
}

interface FiltrosPropiedades {
  type?: string;
  operation?: string;
  minPrice?: string;
  maxPrice?: string;
  area?: string;
  rooms?: string;
  tags?: string;
  search?: string;
  sortBy?: string;
  order?: string;
  currency?: string;
}

// Datos públicos de la inmobiliaria que se muestran en el detalle de una propiedad.
// No incluye al vendedor: así nunca se devuelve su passwordHash (ni su email de login).
interface InmobiliariaPublica {
  id: number;
  name: string;
  description: string;
  logoUrl: string | null;
  contactPhone: string;
  contactEmail: string;
  officeAddress: string | null;
}

type PropiedadConGaleria = Omit<Propiedad, "agency"> & {
  agency: InmobiliariaPublica;
  imagenes: GaleriaImagen[];
};

// Un Terreno no tiene superficie cubierta, ambientes, dormitorios ni baños: se guardan en null.
const CAMPOS_QUE_NO_APLICAN_A_TERRENO = {
  coveredAreaM2: null,
  rooms: null,
  bedrooms: null,
  bathrooms: null,
};

/** Reglas de superficie sobre los valores FINALES (los que va a tener la propiedad al guardarse). */
function validarSuperficies(
  tipo: string,
  total: string | number,
  cubierta: string | number | null | undefined
): void {
  if (!(Number(total) > 0)) throw new ErrorReglaNegocio("La superficie total debe ser mayor a 0");

  if (tipo === PropertyType.LAND) return; // al Terreno no le aplica la superficie cubierta
  if (cubierta === null || cubierta === undefined) return; // la cubierta es opcional: se valida "cuando se informa"

  if (!(Number(cubierta) > 0)) throw new ErrorReglaNegocio("La superficie cubierta debe ser mayor a 0");
  if (Number(cubierta) > Number(total)) {
    throw new ErrorReglaNegocio("La superficie cubierta no puede superar la superficie total");
  }
}

class ServicioPropiedad {
  async obtenerPorId(id: number): Promise<PropiedadConGaleria | null> {
    const propiedad = await repositorioPropiedad.buscarPorId(id);
    if (!propiedad) return null;

    const imagenes = await repositorioGaleriaImagen.buscarPorPropiedadId(id);

    // Separamos la inmobiliaria del resto de los datos de la propiedad
    const { agency, ...datosPropiedad } = propiedad;

    // Armamos la respuesta a mano: la inmobiliaria va SIN el vendedor.
    // Nunca se devuelve el passwordHash.
    return {
      ...datosPropiedad,
      agency: {
        id: agency.id,
        name: agency.name,
        description: agency.description,
        logoUrl: agency.logoUrl,
        contactPhone: agency.contactPhone,
        contactEmail: agency.contactEmail,
        officeAddress: agency.officeAddress,
      },
      imagenes,
    };
  }

  async crear(vendedorId: number, datos: Omit<DatosCrearPropiedad, "agency">): Promise<Propiedad> {
    if (Number(datos.price) <= 0) {
      throw new ErrorReglaNegocio("El precio debe ser mayor a 0");
    }
    validarSuperficies(datos.type, datos.totalAreaM2, datos.coveredAreaM2);

    const inmobiliaria = await repositorioInmobiliaria.buscarPorVendedorId(vendedorId);
    if (!inmobiliaria) throw new ErrorSinInmobiliaria("Necesitás tener una inmobiliaria para publicar propiedades");

    return repositorioPropiedad.crear({
      ...datos,
      agency: { id: inmobiliaria.id },
      type: datos.type as PropertyType,
      operation: datos.operation as OperationType,
      coveredAreaM2: datos.coveredAreaM2 ?? null,
      rooms: datos.rooms ?? null,
      bedrooms: datos.bedrooms ?? null,
      bathrooms: datos.bathrooms ?? null,
      ageYears: datos.ageYears ?? null,
      tags: datos.tags ?? [],
      status: datos.status ?? PropertyStatus.DRAFT,
      ...(datos.type === PropertyType.LAND ? CAMPOS_QUE_NO_APLICAN_A_TERRENO : {}),
    });
  }

  async actualizar(id: number, vendedorId: number, datos: Partial<DatosCrearPropiedad>): Promise<Propiedad> {
    const propiedad = await repositorioPropiedad.buscarPorId(id);
    if (!propiedad) throw new ErrorPropiedadNoEncontrada("Propiedad no encontrada");
    if (propiedad.agency.seller.id !== vendedorId) {
      throw new ErrorSinPermiso("No tenés permiso para editar esta propiedad");
    }

    if (
      propiedad.status === PropertyStatus.SOLD ||
      propiedad.status === PropertyStatus.RENTED ||
      propiedad.status === PropertyStatus.CANCELLED
    ) {
      throw new ErrorReglaNegocio("No se puede editar una propiedad Vendida, Alquilada o Cancelada");
    }

    const tieneVisitaConfirmada = await repositorioSolicitudVisita.tieneConfirmadaPendiente(id);
    if (tieneVisitaConfirmada) {
      throw new ErrorReglaNegocio("No se puede editar una propiedad con una visita Confirmada pendiente");
    }

    if (datos.price !== undefined && Number(datos.price) <= 0) {
      throw new ErrorReglaNegocio("El precio debe ser mayor a 0");
    }

    // Valores finales = lo que ya tenía la propiedad + lo que se está cambiando
    const tipoFinal = datos.type ?? propiedad.type;
    const totalFinal = datos.totalAreaM2 ?? propiedad.totalAreaM2;
    const cubiertaFinal = datos.coveredAreaM2 !== undefined ? datos.coveredAreaM2 : propiedad.coveredAreaM2;
    validarSuperficies(tipoFinal, totalFinal, cubiertaFinal);

    return repositorioPropiedad.actualizar(id, {
      ...datos,
      ...(tipoFinal === PropertyType.LAND ? CAMPOS_QUE_NO_APLICAN_A_TERRENO : {}),
    });
  }

  buscarTodos(
    filtros: FiltrosPropiedades,
    paginacion: { pagina: number; limite: number }
  ): Promise<{ datos: Propiedad[]; total: number }> {
    return repositorioPropiedad.buscarTodos(filtros, paginacion);
  }

  getById(id: number) {
    return this.obtenerPorId(id);
  }

  create(vendedorId: number, datos: Omit<DatosCrearPropiedad, "agency">) {
    return this.crear(vendedorId, datos);
  }

  update(id: number, vendedorId: number, datos: Partial<DatosCrearPropiedad>) {
    return this.actualizar(id, vendedorId, datos);
  }

  async findAll(filtros: FiltrosPropiedades, paginacion: { page: number; limit: number }) {
    const res = await this.buscarTodos(filtros, { pagina: paginacion.page, limite: paginacion.limit });

    // Cada tarjeta del listado muestra su foto de portada
    const portadas = await repositorioGaleriaImagen.buscarPortadas(res.datos.map((p) => p.id));
    const data = res.datos.map((propiedad) => {
      const portada = portadas.find((imagen) => imagen.property.id === propiedad.id);
      return { ...propiedad, portada: portada ? portada.url : null };
    });

    return { data, total: res.total };
  }
}

export const servicioPropiedad = new ServicioPropiedad();
export const propertyService = servicioPropiedad;