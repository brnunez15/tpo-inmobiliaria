/**
 * src/layouts/RequireAuth.tsx
 *
 * La guardia del panel, como RequiereSesion de la Clase 13 (3.3-protegidas):
 * si no hay sesión, en vez de las rutas hijas dibuja un <Navigate> al login
 * y recuerda a dónde se quería ir (state.desde), para volver después.
 * Es solo UX: los datos los protege la API, que responde 401/403 sin un token válido.
 */
import { Navigate, Outlet, useLocation } from "react-router";
import { haySesion } from "../auth/sesion";

export default function RequireAuth() {
  const location = useLocation();

  if (!haySesion()) {
    // replace: el panel no queda en el historial
    return <Navigate to="/ingresar" replace state={{ desde: location.pathname }} />;
  }

  return <Outlet />;
}
