/**
 * src/components/TarjetaPropiedad.tsx
 *
 * Tarjeta de un resultado del listado: lleva al detalle de la propiedad.
 */
import { Link } from "react-router";
import type { Property } from "../api/types";
import { formatM2, formatPrice } from "../utils/format";
import { OPERATION_LABELS, TYPE_LABELS } from "../utils/labels";
import estilos from "./TarjetaPropiedad.module.css";

export function TarjetaPropiedad({ propiedad: p }: { propiedad: Property }) {
  return (
    <Link to={`/propiedades/${p.id}`} className={estilos.tarjeta}>
      <div className={estilos.foto}>
        {p.coverImageUrl ? (
          <img src={p.coverImageUrl} alt={p.title} loading="lazy" />
        ) : (
          <div className={estilos.sinFoto}>Sin foto</div>
        )}
        <span className={`${estilos.operacion} ${p.operation === "RENT" ? estilos.alquiler : ""}`}>
          {OPERATION_LABELS[p.operation]}
        </span>
      </div>
      <div className={estilos.cuerpo}>
        <span className={estilos.precio}>{formatPrice(p.price, p.currency, p.operation)}</span>
        <h3 className={estilos.titulo}>{p.title}</h3>
        <p className={estilos.datos}>
          {TYPE_LABELS[p.type]} · {p.area} · {formatM2(p.totalAreaM2)}
          {p.rooms ? ` · ${p.rooms} amb.` : ""}
        </p>
        {p.tags.length > 0 && (
          <div className={estilos.tags}>
            {p.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={estilos.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}