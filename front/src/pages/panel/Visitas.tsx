/**
 * src/pages/panel/Visitas.tsx
 *
 * Solicitudes de visita recibidas, agrupadas por propiedad (como el mockup
 * del enunciado), con el nombre y teléfono de quien la pidió para coordinar.
 *
 * PIDE A LA API:
 *   - GET /agencies/:agencyId/visit-requests
 *   - PATCH /visit-requests/:id/status  (en cada TarjetaVisita)
 */
import type { VisitRequest, VisitStatus } from "../../api/types";
import { getAgencyId } from "../../auth/sesion";
import { Cargando, ErrorCarga, Vacio } from "../../components/Estados";
import { useFetch } from "../../hooks/useFetch";
import TarjetaVisita from "./TarjetaVisita";
import estilos from "./Visitas.module.css";

export default function Visitas() {
  const agencyId = getAgencyId();
  const { datos: visitas, setDatos: setVisitas, cargando, error, recargar } = useFetch<VisitRequest[]>(
    `/agencies/${agencyId}/visit-requests`,
  );

  if (cargando) return <Cargando texto="Cargando solicitudes…" />;
  if (error || !visitas) return <ErrorCarga error={`No se pudieron cargar las solicitudes: ${error}`} onReintentar={recargar} />;

  // Actualiza la lista sin volver a pedirla. Con función: si se responden dos a la vez,
  // cada una parte de la lista más reciente (Clase 12, función actualizadora).
  function marcarRespondida(id: number, estado: VisitStatus) {
    setVisitas((lista) => lista && lista.map((v) => (v.id === id ? { ...v, status: estado } : v)));
  }

  // Agrupar por propiedad: un dato calculado en cada render, no va en el estado.
  // filter deja cada título una sola vez: se queda solo con su primera aparición en la lista.
  const titulos = visitas
    .map((v) => v.property.title)
    .filter((titulo, indice, lista) => lista.indexOf(titulo) === indice);

  return (
    <>
      <h1>Solicitudes de visita</h1>
      {visitas.length === 0 && <Vacio texto="Todavía no recibiste solicitudes de visita." />}
      {titulos.map((titulo) => (
        <section key={titulo}>
          <h2 className={estilos.grupo}>{titulo}</h2>
          {visitas
            .filter((v) => v.property.title === titulo)
            .map((v) => (
              <TarjetaVisita key={v.id} visita={v} onRespondida={marcarRespondida} />
            ))}
        </section>
      ))}
    </>
  );
}
