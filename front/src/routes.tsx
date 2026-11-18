/**
 * src/routes.tsx
 *
 * El árbol de rutas (Clase 13): un RouteObject[] con layouts y rutas hijas.
 * Cada layout dibuja la ruta hija que coincide en su <Outlet />.
 */
import { Navigate, type RouteObject } from "react-router";
import LayoutPanel from "./layouts/LayoutPanel";
import RequireAuth from "./layouts/RequireAuth";
import NoEncontrado from "./pages/NoEncontrado";
import Actividad from "./pages/panel/Actividad";
import Consultas from "./pages/panel/Consultas";
import FormPropiedad from "./pages/panel/FormPropiedad";
import MiInmobiliaria from "./pages/panel/MiInmobiliaria";
import MisPropiedades from "./pages/panel/MisPropiedades";
import Reportes from "./pages/panel/Reportes";
import Visitas from "./pages/panel/Visitas";

export const rutas: RouteObject[] = [
  // ── Zona pública (Interesado) y autenticación ── (Brisa)
  // TODO Brisa: element LayoutPublico con "/" Listado, "/propiedades/:id" Detalle, "/inmobiliarias/:id" Sitio,
  //             y sin layout "/ingresar" Login y "/registro" Registro.

  // ── Zona del vendedor ── (Néstor)
  // La guardia va arriba: si no hay sesión, ninguna ruta del panel se dibuja
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/panel",
        element: <LayoutPanel />,
        children: [
          { index: true, element: <Navigate to="propiedades" replace /> },
          { path: "propiedades", element: <MisPropiedades /> },
          { path: "propiedades/nueva", element: <FormPropiedad /> },
          // El mismo formulario, en modo edición (useParams trae el id)
          { path: "propiedades/:id/editar", element: <FormPropiedad /> },
          { path: "visitas", element: <Visitas /> },
          { path: "consultas", element: <Consultas /> },
          { path: "actividad", element: <Actividad /> },
          { path: "reportes", element: <Reportes /> },
          { path: "inmobiliaria", element: <MiInmobiliaria /> },
        ],
      },
    ],
  },

  // Cualquier otra URL
  { path: "*", element: <NoEncontrado /> },
];
