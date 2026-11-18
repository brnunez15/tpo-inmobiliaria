import { useEffect, useRef, type ReactNode } from "react";
import estilos from "./Modal.module.css";

/**
 * Ventana modal con el <dialog> nativo del navegador (maneja el foco y la tecla Esc).
 * Se muestra mientras `abierto` sea true; `onCerrar` se llama al cerrarla (Esc, ✕ o clic afuera).
 */
export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
}: {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className={estilos.dialogo}
      onClose={onCerrar}
      onClick={(e) => {
        // Un clic en el fondo (el propio <dialog>, no su contenido) cierra la ventana.
        if (e.target === ref.current) onCerrar();
      }}
    >
      {abierto && (
        <>
          <div className={estilos.cabecera}>
            <h2>{titulo}</h2>
            <button type="button" className={estilos.cerrar} onClick={onCerrar} aria-label="Cerrar">
              ×
            </button>
          </div>
          <div className={estilos.cuerpo}>{children}</div>
        </>
      )}
    </dialog>
  );
}
