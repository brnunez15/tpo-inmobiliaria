import { useState, type FormEvent } from "react";
import { apiFetch, fieldErrors, toApiError } from "../../api/client";
import type { Comment } from "../../api/types";
import { Alerta } from "../../components/Alerta";
import { Campo } from "../../components/Campo";
import { Cargando, ErrorCarga } from "../../components/Estados";
import { useFetch } from "../../hooks/useFetch";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { timeAgo } from "../../utils/format";
import estilos from "./Detalle.module.css";

/** Consultas de una propiedad con la respuesta del vendedor, y el formulario para preguntar. */
export default function ConsultasPropiedad({ propertyId }: { propertyId: number }) {
  const { datos: comentarios, cargando, error, recargar } = useFetch<Comment[]>(
    `/properties/${propertyId}/comments`
  );

  // El nombre se recuerda para no escribirlo cada vez
  const [nombre, setNombre] = useLocalStorage("tpo_interesado_nombre", "");
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
    if (!contenido.trim()) nuevos.content = "Escribí tu consulta.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setEnviando(true);
    try {
      await apiFetch(`/properties/${propertyId}/comments`, {
        method: "POST",
        body: { authorName: nombre.trim(), content: contenido.trim() },
      });
      setContenido("");
      setEnviado(true);
      recargar();
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
    <section className={`${estilos.panel} ${estilos.consultas}`} aria-labelledby="consultas-titulo">
      <h2 id="consultas-titulo">Consultas</h2>

      {cargando && !comentarios ? (
        <Cargando texto="Cargando consultas…" />
      ) : error ? (
        <ErrorCarga error={error} onReintentar={recargar} />
      ) : comentarios && comentarios.length > 0 ? (
        <div>
          {comentarios.map((c) => (
            <article key={c.id} className={estilos.consulta}>
              <p style={{ margin: 0 }}>
                <span className={estilos.autor}>@{c.authorName}</span>{" "}
                <span className="suave">· {timeAgo(c.createdAt)}</span>
              </p>
              <p style={{ margin: "0.2rem 0 0" }}>{c.content}</p>
              {c.response && (
                <p className={estilos.respuesta}>
                  <strong>Vendedor:</strong> {c.response}
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="suave">Todavía no hay consultas. ¡Hacé la primera!</p>
      )}

      <form className={estilos.formConsulta} onSubmit={handleSubmit} noValidate>
        <h3>Hacer una consulta</h3>
        {enviado && <Alerta tipo="exito">¡Listo! Tu consulta ya está publicada y el vendedor fue avisado.</Alerta>}
        {errorGeneral && <Alerta>{errorGeneral}</Alerta>}
        <Campo etiqueta="Tu nombre" htmlFor="consulta-nombre" error={errores.authorName}>
          <input
            id="consulta-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={120}
            autoComplete="given-name"
            aria-invalid={!!errores.authorName}
          />
        </Campo>
        <Campo etiqueta="Tu consulta" htmlFor="consulta-texto" error={errores.content}>
          <textarea
            id="consulta-texto"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            maxLength={1000}
            placeholder="Ej.: ¿Admite mascotas?"
            aria-invalid={!!errores.content}
          />
        </Campo>
        <div>
          <button type="submit" className="boton primario" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar consulta"}
          </button>
        </div>
      </form>
    </section>
  );
}
