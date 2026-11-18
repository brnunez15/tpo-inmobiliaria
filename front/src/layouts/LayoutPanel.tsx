/**
 * src/layouts/LayoutPanel.tsx
 *
 * El marco del panel del vendedor (Clases 13 y 15): una nav con un NavLink
 * por sección y, abajo, la sección actual en el <Outlet />. Muestra el
 * contador de novedades sin leer, que se actualiza solo (polling).
 */
import { NavLink, Outlet, useNavigate } from "react-router";
import { cerrarSesion, getAgencyId } from "../auth/sesion";
import { useNovedadesSinLeer } from "../hooks/useNovedadesSinLeer";
import estilos from "./LayoutPanel.module.css";

// Cada cuánto se vuelve a preguntar por las novedades sin leer
const POLLING_MS = 10000;

const SECCIONES = [
  { ruta: "/panel/propiedades", icono: "📋", texto: "Mis propiedades" },
  { ruta: "/panel/visitas", icono: "📅", texto: "Visitas" },
  { ruta: "/panel/consultas", icono: "💬", texto: "Consultas" },
  { ruta: "/panel/actividad", icono: "🔔", texto: "Actividad" },
  { ruta: "/panel/reportes", icono: "📊", texto: "Reportes" },
  { ruta: "/panel/inmobiliaria", icono: "🏢", texto: "Mi inmobiliaria" },
];

// NavLink con className como función: recibe si la ruta está activa (Clase 15)
function claseLink({ isActive }: { isActive: boolean }) {
  return isActive ? `${estilos.seccion} ${estilos.actual}` : estilos.seccion;
}

export default function LayoutPanel() {
  const navigate = useNavigate();
  const agencyId = getAgencyId();
  const sinLeer = useNovedadesSinLeer(agencyId, POLLING_MS);

  function salir() {
    cerrarSesion();
    navigate("/", { replace: true });
  }

  return (
    <>
      <nav className={estilos.nav}>
        <strong className={estilos.marca}>🏠 Panel del vendedor</strong>
        {agencyId !== null &&
          SECCIONES.map((s) => (
            <NavLink key={s.ruta} to={s.ruta} className={claseLink}>
              {s.icono}
              <span className={estilos.texto}>{s.texto}</span>
              {s.ruta === "/panel/actividad" && sinLeer > 0 && <span className={estilos.contador}>{sinLeer}</span>}
            </NavLink>
          ))}
        <button type="button" className={estilos.salir} onClick={salir}>
          Salir
        </button>
      </nav>
      <main className="contenido">
        {agencyId === null ? (
          // Un vendedor puede quedarse sin inmobiliaria (la eliminó): el enunciado dice "como máximo una"
          <p className="mensaje">Ya no tenés una inmobiliaria: no hay nada para administrar en el panel.</p>
        ) : (
          <Outlet />
        )}
      </main>
    </>
  );
}
