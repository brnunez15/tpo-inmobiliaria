/**
 * src/pages/NoEncontrado.tsx
 *
 * La ruta "*" (Clase 13): cualquier URL que no coincide con otra ruta.
 */
import { Link } from "react-router";

export default function NoEncontrado() {
  return (
    <div className="mensaje">
      <h1>No encontramos esa página</h1>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
}
