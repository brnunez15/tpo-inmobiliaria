import estilos from "./Estrellas.module.css";

/** ★★★★☆ de solo lectura. `valor` puede tener decimales (se redondea). */
export function Estrellas({ valor }: { valor: number }) {
  const llenas = Math.round(valor);
  return (
    <span className={estilos.estrellas} role="img" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= llenas ? estilos.llena : undefined} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

/** Selector de 1 a 5 estrellas para el formulario de reseña. */
export function SelectorEstrellas({
  valor,
  onChange,
}: {
  valor: number;
  onChange: (valor: number) => void;
}) {
  return (
    <div className={estilos.selector} role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
          className={`${estilos.boton} ${n <= valor ? estilos.llena : ""}`}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
