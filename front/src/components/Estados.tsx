/**
 * src/components/Estados.tsx
 *
 * Los tres estados de cualquier pantalla que pide datos (Clase 14):
 * cargando, error al cargar y listado vacío.
 */
export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return <p className="cargando">{texto}</p>;
}

export function ErrorCarga({ error, onReintentar }: { error: string; onReintentar?: () => void }) {
  return (
    <div className="mensaje error">
      <p>{error}</p>
      {onReintentar && (
        <button type="button" className="boton" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Vacio({ texto }: { texto: string }) {
  return <p className="mensaje">{texto}</p>;
}
