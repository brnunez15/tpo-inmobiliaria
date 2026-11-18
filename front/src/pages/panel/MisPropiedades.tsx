/**
 * src/pages/panel/MisPropiedades.tsx
 *
 * "Mis propiedades": todas las propiedades de la inmobiliaria, en cualquier estado.
 * El filtro por estado y la página viven en la URL (useSearchParams, Clase 13):
 * se pueden compartir, y el botón "atrás" del navegador vuelve al filtro anterior.
 *
 * PIDE A LA API:
 *   - GET /agencies/:agencyId/my-properties?status=&page=&limit=
 *   - PATCH /properties/:id/status  (en cada FilaPropiedad)
 */
import { Link, useSearchParams } from "react-router";
import { toQuery } from "../../api/client";
import type { Page, Property, PropertyStatus } from "../../api/types";
import { getAgencyId } from "../../auth/sesion";
import { Cargando, ErrorCarga, Vacio } from "../../components/Estados";
import { Paginacion } from "../../components/Paginacion";
import { useFetch } from "../../hooks/useFetch";
import { PAGE_SIZE, STATUS_LABELS } from "../../utils/labels";
import FilaPropiedad from "./FilaPropiedad";

const FILTROS_ESTADO: PropertyStatus[] = ["DRAFT", "PUBLISHED", "PAUSED", "RESERVED", "SOLD", "RENTED", "CANCELLED"];

export default function MisPropiedades() {
  const agencyId = getAgencyId();
  const [searchParams, setSearchParams] = useSearchParams();
  const estado = searchParams.get("status") ?? "";
  const pagina = Number(searchParams.get("page") ?? 1);

  const path = `/agencies/${agencyId}/my-properties${toQuery({ status: estado, page: pagina, limit: PAGE_SIZE })}`;
  const { datos, cargando, error, recargar } = useFetch<Page<Property>>(path);

  function cambiarParam(clave: string, valor: string) {
    const params = new URLSearchParams(searchParams);
    if (valor) params.set(clave, valor);
    else params.delete(clave);
    if (clave !== "page") params.delete("page"); // otro filtro → vuelve a la página 1
    setSearchParams(params);
  }

  return (
    <>
      <div className="titulo-con-accion">
        <h1>Mis propiedades</h1>
        <Link to="/panel/propiedades/nueva" className="boton primario">
          + Nueva propiedad
        </Link>
      </div>

      <nav className="chips">
        <button type="button" className={estado === "" ? "chip activo" : "chip"} onClick={() => cambiarParam("status", "")}>
          Todas
        </button>
        {FILTROS_ESTADO.map((e) => (
          <button
            key={e}
            type="button"
            className={estado === e ? "chip activo" : "chip"}
            onClick={() => cambiarParam("status", e)}
          >
            {STATUS_LABELS[e]}
          </button>
        ))}
      </nav>

      {cargando && <Cargando texto="Cargando propiedades…" />}
      {error && <ErrorCarga error={`No se pudieron cargar las propiedades: ${error}`} onReintentar={recargar} />}
      {!cargando && !error && datos?.data.length === 0 && (
        <Vacio texto={estado ? "No hay propiedades en ese estado." : "Todavía no cargaste ninguna propiedad."} />
      )}

      {!cargando &&
        datos?.data.map((p) => <FilaPropiedad key={p.id} propiedad={p} onCambio={recargar} />)}

      {datos && <Paginacion meta={datos.meta} onCambiar={(p) => cambiarParam("page", String(p))} />}
    </>
  );
}
