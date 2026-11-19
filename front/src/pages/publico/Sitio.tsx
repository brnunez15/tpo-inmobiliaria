import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import { apiFetch, fieldErrors, toApiError, toQuery } from "../../api/client";
import type { AgencyProfile, Page, Property, Review } from "../../api/types";
import { Alerta } from "../../components/Alerta";
import { Campo } from "../../components/Campo";
import { Cargando, ErrorCarga, Vacio } from "../../components/Estados";
import { Estrellas, SelectorEstrellas } from "../../components/Estrellas";
import { Paginacion } from "../../components/Paginacion";
import { TarjetaPropiedad } from "../../components/TarjetaPropiedad";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { formatDate } from "../../utils/format";
import estilos from "./Sitio.module.css";

function FormResena({ agencyId, onCreada }: { agencyId: number; onCreada: () => void }) {
  const [nombre, setNombre] = useLocalStorage("tpo_interesado_nombre", "");
  const [rating, setRating] = useState(0);
  const [contenido, setContenido] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviado(false);
    setErrorGeneral(null);

    const nuevos: Record<string, string> = {};
    if (!nombre.trim()) nuevos.authorName = "Escribí tu nombre.";
    if (rating < 1) nuevos.rating = "Elegí una calificación de 1 a 5 estrellas.";
    if (!contenido.trim()) nuevos.content = "Contanos tu experiencia.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setEnviando(true);
    try {
      await apiFetch(`/agencies/${agencyId}/reviews`, {
        method: "POST",
        body: { authorName: nombre.trim(), rating, content: contenido.trim() },
      });
      setRating(0);
      setContenido("");
      setEnviado(true);
      onCreada();
    } catch (err) {
      const apiError = toApiError(err);
      const porCampo = fieldErrors(apiError);
      if (Object.keys(porCampo).length > 0) setErrores(porCampo);
      else setErrorGeneral(apiError.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className={estilos.formulario} onSubmit={handleSubmit} noValidate>
      <h3>Dejá tu reseña</h3>
      {enviado && <Alerta tipo="exito">{"¡Gracias! Tu reseña ya está publicada."}</Alerta>}
      {errorGeneral && <Alerta>{errorGeneral}</Alerta>}
      <Campo etiqueta="Tu nombre" htmlFor="resena-nombre" error={errores.authorName}>
        <input
          id="resena-nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={120}
          aria-invalid={!!errores.authorName}
        />
      </Campo>
      <div>
        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Calificación</span>
        <SelectorEstrellas valor={rating} onChange={setRating} />
        {errores.rating && (
          <p style={{ color: "var(--error)", fontSize: "0.85rem", margin: "0.2rem 0 0" }}>{errores.rating}</p>
        )}
      </div>
      <Campo etiqueta="Tu opinión" htmlFor="resena-texto" error={errores.content}>
        <textarea
          id="resena-texto"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          aria-invalid={!!errores.content}
        />
      </Campo>
      <div>
        <button type="submit" className="boton primario" disabled={enviando}>
          {enviando ? "Enviando…" : "Publicar reseña"}
        </button>
      </div>
    </form>
  );
}

export default function Sitio() {
  const { id } = useParams();
  const [pagina, setPagina] = useState(1);

  const perfil = useFetch<AgencyProfile>(`/agencies/${id}`);
  const propiedades = useFetch<Page<Property>>(`/agencies/${id}/properties${toQuery({ page: pagina, limit: 6 })}`);
  const resenas = useFetch<Review[]>(`/agencies/${id}/reviews`);
  useDocumentTitle(perfil.datos ? perfil.datos.name : "Inmobiliaria");

  if (perfil.cargando && !perfil.datos) return <Cargando texto="Cargando inmobiliaria…" />;

  if (perfil.error) {
    return <ErrorCarga error={perfil.error} onReintentar={perfil.recargar} />;
  }

  // useFetch deja datos en null cuando el back responde 404
  const a = perfil.datos;
  if (!a) {
    return (
      <>
        <Vacio texto="No encontramos esta inmobiliaria." />
        <Link to="/" className="boton primario">
          Ver propiedades
        </Link>
      </>
    );
  }

  return (
    <>
      <header className={estilos.cabecera}>
        {a.logoUrl ? (
          <img className={estilos.logo} src={a.logoUrl} alt={`Logo de ${a.name}`} />
        ) : (
          <span className={estilos.logo} aria-hidden="true">
            {a.name.charAt(0)}
          </span>
        )}
        <div className={estilos.info}>
          <h1>{a.name}</h1>
          <div className={estilos.valoracion}>
            {a.rating.average !== null ? (
              <>
                <Estrellas valor={a.rating.average} />
                <span className="suave">
                  {a.rating.average.toFixed(1)} ({a.rating.count} {a.rating.count === 1 ? "reseña" : "reseñas"})
                </span>
              </>
            ) : (
              <span className="suave">Todavía sin reseñas</span>
            )}
          </div>
          <p style={{ margin: 0 }}>{a.description}</p>
          <p className={estilos.contacto}>
            <a href={`tel:${a.contactPhone}`}>📞 {a.contactPhone}</a>
            <a href={`mailto:${a.contactEmail}`}>✉️ {a.contactEmail}</a>
            {a.officeAddress && <span>📍 {a.officeAddress}</span>}
          </p>
        </div>
      </header>

      <section className={estilos.seccion} aria-labelledby="sus-propiedades">
        <h2 id="sus-propiedades">Sus propiedades</h2>
        {propiedades.error ? (
          <ErrorCarga error={propiedades.error} onReintentar={propiedades.recargar} />
        ) : !propiedades.datos && propiedades.cargando ? (
          <Cargando texto="Cargando propiedades…" />
        ) : propiedades.datos && propiedades.datos.data.length === 0 ? (
          <Vacio texto="Esta inmobiliaria no tiene propiedades publicadas por ahora." />
        ) : (
          propiedades.datos && (
            <>
              <div className={estilos.grilla}>
                {propiedades.datos.data.map((p) => (
                  <TarjetaPropiedad key={p.id} propiedad={p} />
                ))}
              </div>
              <Paginacion meta={propiedades.datos.meta} onCambiar={setPagina} />
            </>
          )
        )}
      </section>

      <section className={estilos.seccion} aria-labelledby="resenas-titulo">
        <h2 id="resenas-titulo">Reseñas</h2>
        <div className={estilos.resenas}>
          <div>
            {resenas.error ? (
              <ErrorCarga error={resenas.error} onReintentar={resenas.recargar} />
            ) : !resenas.datos && resenas.cargando ? (
              <Cargando texto="Cargando reseñas…" />
            ) : resenas.datos && resenas.datos.length > 0 ? (
              resenas.datos.map((r) => (
                <article key={r.id} className={estilos.resena}>
                  <p style={{ margin: 0 }}>
                    <strong>@{r.authorName}</strong> <Estrellas valor={r.rating} />{" "}
                    <span className="suave">· {formatDate(r.createdAt)}</span>
                  </p>
                  <p style={{ margin: "0.25rem 0 0" }}>{r.content}</p>
                </article>
              ))
            ) : (
              <p className="suave">Todavía no hay reseñas. ¡Sé el primero en dejar una!</p>
            )}
          </div>
          <FormResena
            agencyId={a.id}
            onCreada={() => {
              resenas.recargar();
              perfil.recargar(); // el promedio cambia
            }}
          />
        </div>
      </section>
    </>
  );
}
