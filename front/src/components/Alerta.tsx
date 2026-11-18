/**
 * src/components/Alerta.tsx
 *
 * Mensaje visible dentro de una pantalla o formulario (error o éxito).
 * Si no hay mensaje, no dibuja nada (renderizado condicional, Clase 11).
 */
export function Alerta({ tipo = "error", children }: { tipo?: "error" | "exito"; children: string | null }) {
  if (!children) return null;
  return <p className={tipo === "error" ? "mensaje error" : "aviso"}>{children}</p>;
}
