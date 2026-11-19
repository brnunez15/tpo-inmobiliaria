/**
 * src/routes.tsx
 *
 * El árbol de rutas (Clase 13): un RouteObject[] con layouts y rutas hijas.
 * Cada layout dibuja la ruta hija que coincide en su <Outlet />.
 */
import { Navigate, type RouteObject } from "react-router";
import LayoutPanel from "./layouts/LayoutPanel";
import RequireAuth from "./layouts/RequireAuth";
import LayoutPublico from "./layouts/LayoutPublico";
import Listado from "./pages/publico/Listado";
import NoEncontrado from "./pages/NoEncontrado";
import Actividad from "./pages/panel/Actividad";
import Consultas from "./pages/panel/Consultas";
import FormPropiedad from "./pages/panel/FormPropiedad";
import MiInmobiliaria from "./pages/panel/MiInmobiliaria";
import MisPropiedades from "./pages/panel/MisPropiedades";
import Reportes from "./pages/panel/Reportes";
import Visitas from "./pages/panel/Visitas";
import Login from "./pages/auth/Login";
import Registro from "./pages/auth/Registro";
import Detalle from "./pages/publico/Detalle";
import Sitio from "./pages/publico/Sitio";

export const rutas: RouteObject[] = [
    {
    element: <LayoutPublico />,
    children: [
      { path: "/", element: <Listado /> },
      { path: "/propiedades/:id", element: <Detalle /> },
      { path: "/inmobiliarias/:id", element: <Sitio /> },
    ],
    
  },

  { path: "/ingresar", element: <Login /> },
  { path: "/registro", element: <Registro /> },

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
