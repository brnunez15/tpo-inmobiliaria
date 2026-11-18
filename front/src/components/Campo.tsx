import type { ReactNode } from "react";
import estilos from "./Campo.module.css";

/** Etiqueta + control + mensaje de error de un campo de formulario. */
export function Campo({
  etiqueta,
  htmlFor,
  error,
  ayuda,
  children,
}: {
  etiqueta: string;
  htmlFor: string;
  error?: string;
  ayuda?: string;
  children: ReactNode;
}) {
  return (
    <div className={estilos.campo}>
      <label htmlFor={htmlFor}>{etiqueta}</label>
      {children}
      {ayuda && !error && <span className={estilos.ayuda}>{ayuda}</span>}
      {error && (
        <p className={estilos.error} id={`${htmlFor}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
