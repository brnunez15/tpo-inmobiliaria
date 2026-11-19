/**
 * src/layouts/LayoutPublico.tsx
 *
 * Marco de las pantallas del Interesado: cabecera + contenido + pie.
 * <Outlet /> es donde se dibuja la ruta hija (Listado, Detalle o Sitio).
 */
import { Link, Outlet } from "react-router";
import { haySesion } from "../auth/sesion";
import estilos from "./LayoutPublico.module.css";

export default function LayoutPublico() {
  return (
    <>
      <header className={estilos.header}>
        <div className={`contenedor ${estilos.barra}`}>
          <Link to="/" className={estilos.marca}>
            <span className={estilos.logo} aria-hidden="true">
              ⌂
            </span>
            Casa a Casa
          </Link>
          {haySesion() ? (
            <Link to="/panel" className="boton primario chico">
              Ir a mi panel
            </Link>
          ) : (
            <Link to="/ingresar" className="boton chico">
              Ingresar <span className={estilos.textoBoton}>como vendedor</span>
            </Link>
          )}
        </div>
      </header>
      <main className="contenedor pagina">
        <Outlet />
      </main>
      <footer className={estilos.pie}>Marketplace inmobiliario · TPO Aplicaciones Interactivas 2026</footer>
    </>
  );
}