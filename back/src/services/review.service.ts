import { repositorioReseña } from "../repositories/review.repository";
import { repositorioInmobiliaria } from "../repositories/inmobiliaria.repositorio";
import { repositorioActividad } from "../repositories/activity.repository";

export class ErrorInmobiliariaNoEncontrada extends Error {}

class ServicioReseña {
  async crear(
    inmobiliariaId: number,
    datos: { nombreAutor: string; contenido: string; calificacion: number }
  ) {
    const inmobiliaria = await repositorioInmobiliaria.buscarPorId(inmobiliariaId);
    if (!inmobiliaria) throw new ErrorInmobiliariaNoEncontrada();

    const reseña = await repositorioReseña.crear({ ...datos, inmobiliariaId });

    await repositorioActividad.crearPorReseña(inmobiliariaId, reseña.id);

    return reseña;
  }

  async listarPorInmobiliaria(inmobiliariaId: number) {
    const inmobiliaria = await repositorioInmobiliaria.buscarPorId(inmobiliariaId);
    if (!inmobiliaria) throw new ErrorInmobiliariaNoEncontrada();
    return repositorioReseña.buscarPorInmobiliariaId(inmobiliariaId);
  }
}

export const servicioReseña = new ServicioReseña();
