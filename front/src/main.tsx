/**
 * src/main.tsx
 *
 * El punto de entrada: crea el router con las rutas y lo monta (Clase 13).
 * createBrowserRouter viene de "react-router" y RouterProvider de "react-router/dom".
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { rutas } from "./routes";
import "./index.css";

const router = createBrowserRouter(rutas);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
