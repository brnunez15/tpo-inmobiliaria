/**
 * src/pages/panel/Reportes.tsx
 *
 * El dashboard del enunciado: propiedades por estado, publicaciones y
 * ventas/alquileres por mes, y tiempo promedio en el mercado.
 * Las barras son divs con el ancho (o alto) en un style inline y el color
 * en una variable CSS, como en la Clase 15 (estilos dinámicos).
 *
 * PIDE A LA API:
 *   - GET /agencies/:agencyId/reports/status-summary
 *   - GET /agencies/:agencyId/reports/monthly
 *   - GET /agencies/:agencyId/reports/avg-time-on-market
 */
import type { CSSProperties } from "react";
import type { AvgTimeOnMarket, MonthlyItem, PropertyStatus, StatusSummaryItem } from "../../api/types";
import { getAgencyId } from "../../auth/sesion";
import { BadgeEstadoPropiedad } from "../../components/Badge";
import { Cargando, ErrorCarga, Vacio } from "../../components/Estados";
import { useFetch } from "../../hooks/useFetch";
import estilos from "./Reportes.module.css";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Color de la barra de cada estado: el mismo tono que su etiqueta (Badge.module.css)
const COLOR_ESTADO: Record<PropertyStatus, string> = {
  DRAFT: "#9a9e94",
  PUBLISHED: "#5f9a56",
  PAUSED: "#d4ac3f",
  RESERVED: "#c58a64",
  SOLD: "#4a6178",
  RENTED: "#4a6178",
  CANCELLED: "#b5534a",
};

// "2026-11" → "Nov 26"
function nombreMes(clave: string): string {
  const [anio, mes] = clave.split("-");
  return `${MESES[Number(mes) - 1]} ${anio.slice(2)}`;
}

export default function Reportes() {
  const agencyId = getAgencyId();
  // Tres pedidos independientes: cada uno con su propio estado (Clase 15)
  const porEstado = useFetch<StatusSummaryItem[]>(`/agencies/${agencyId}/reports/status-summary`);
  const mensual = useFetch<MonthlyItem[]>(`/agencies/${agencyId}/reports/monthly`);
  const tiempo = useFetch<AvgTimeOnMarket>(`/agencies/${agencyId}/reports/avg-time-on-market`);

  if (porEstado.cargando || mensual.cargando || tiempo.cargando) return <Cargando texto="Cargando reportes…" />;
  const error = porEstado.error ?? mensual.error ?? tiempo.error;
  if (error || !porEstado.datos || !mensual.datos || !tiempo.datos) {
    return (
      <ErrorCarga
        error={`No se pudieron cargar los reportes: ${error}`}
        onReintentar={() => {
          porEstado.recargar();
          mensual.recargar();
          tiempo.recargar();
        }}
      />
    );
  }

  const maximoEstado = Math.max(0, ...porEstado.datos.map((f) => f.count));
  const maximoMes = Math.max(0, ...mensual.datos.map((m) => Math.max(m.published, m.closed)));

  return (
    <>
      <h1>Reportes</h1>

      <section className={estilos.tarjeta}>
        <h2>Propiedades por estado</h2>
        {porEstado.datos.length === 0 && <Vacio texto="Todavía no hay propiedades." />}
        {porEstado.datos.map(({ status, count }) => {
          const estiloBarra = {
            width: `${maximoEstado === 0 ? 0 : (count / maximoEstado) * 100}%`,
            "--color-barra": COLOR_ESTADO[status],
          } as CSSProperties;
          return (
            <div key={status} className={estilos.fila}>
              <BadgeEstadoPropiedad status={status} />
              <div className={estilos.barra} style={estiloBarra} />
              <span>{count}</span>
            </div>
          );
        })}
      </section>

      <section className={estilos.tarjeta}>
        <h2>Publicaciones y ventas/alquileres por mes</h2>
        <p>
          <span className={estilos.muestra} style={{ "--color-barra": "#26303b" } as CSSProperties} /> Publicadas{" "}
          <span className={estilos.muestra} style={{ "--color-barra": "#9a694e" } as CSSProperties} /> Vendidas/alquiladas
        </p>
        {mensual.datos.length === 0 && <Vacio texto="Todavía no hay movimientos." />}
        <div className={estilos.meses}>
          {mensual.datos.map((m) => (
            <div key={m.month} className={estilos.mes}>
              <div className={estilos.barras}>
                <div
                  className={estilos.vertical}
                  title={`${m.published} publicadas`}
                  style={{ height: `${maximoMes === 0 ? 0 : (m.published / maximoMes) * 100}%`, "--color-barra": "#26303b" } as CSSProperties}
                />
                <div
                  className={estilos.vertical}
                  title={`${m.closed} vendidas/alquiladas`}
                  style={{ height: `${maximoMes === 0 ? 0 : (m.closed / maximoMes) * 100}%`, "--color-barra": "#9a694e" } as CSSProperties}
                />
              </div>
              <span>{nombreMes(m.month)}</span>
              <span>
                {m.published} / {m.closed}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={estilos.tarjeta}>
        <h2>Tiempo promedio en el mercado</h2>
        {tiempo.datos.avgDaysOnMarket === null ? (
          <p>Todavía no se vendió ni alquiló ninguna propiedad.</p>
        ) : (
          <p>
            <span className={estilos.numero}>{Math.round(tiempo.datos.avgDaysOnMarket)} días</span> entre Publicada y
            Vendida/Alquilada ({tiempo.datos.samplesCount} propiedades)
          </p>
        )}
      </section>
    </>
  );
}
