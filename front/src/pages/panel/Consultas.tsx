/**
 * src/pages/panel/Consultas.tsx
 *
 * Las preguntas recibidas en todas las propiedades, para responder.
 * El filtro "sin responder" vive en la URL (?unanswered=true, Clase 13).
 * Una respuesta es de un solo nivel (enunciado): se responde una vez.
 *
 * PIDE A LA API:
 *   - GET /agencies/:agencyId/comments?unanswered=true
 *   - PATCH /comments/:id/reply
 */
import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { apiFetch, toApiError, toQuery } from "../../api/client";
import type { AgencyComment } from "../../api/types";
import { getAgencyId } from "../../auth/sesion";
import { Cargando, ErrorCarga, Vacio } from "../../components/Estados";
import { useFetch } from "../../hooks/useFetch";
import { timeAgo } from "../../utils/format";

// El formulario de respuesta de UNA consulta: cada uno con su propio texto y su error
function FormRespuesta({
  comentario,
  onRespondida,
}: {
  comentario: AgencyComment;
  onRespondida: (respuesta: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (texto.trim() === "") {
      setError("Escribí una respuesta");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await apiFetch(`/comments/${comentario.id}/reply`, { method: "PATCH", body: { reply: texto.trim() } });
      onRespondida(texto.trim());
    } catch (err) {
      setError(toApiError(err).message);
      setEnviando(false);
    }
  }

  return (
    <form className="botones" onSubmit={handleSubmit}>
      <input
        placeholder="Responder…"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        style={{ flex: 1, padding: "6px 10px" }}
      />
      <button type="submit" className="boton primario" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export default function Consultas() {
  const agencyId = getAgencyId();
  const [searchParams, setSearchParams] = useSearchParams();
  const soloSinResponder = searchParams.get("unanswered") === "true";

  const {
    datos: consultas,
    setDatos: setConsultas,
    cargando,
    error,
    recargar,
  } = useFetch<AgencyComment[]>(`/agencies/${agencyId}/comments${toQuery({ unanswered: soloSinResponder || undefined })}`);

  // Refleja la respuesta sin volver a pedir la lista
  function marcarRespondida(id: number, respuesta: string) {
    setConsultas((lista) => lista && lista.map((c) => (c.id === id ? { ...c, response: respuesta } : c)));
  }

  return (
    <>
      <h1>Consultas</h1>
      <nav className="chips">
        <button type="button" className={!soloSinResponder ? "chip activo" : "chip"} onClick={() => setSearchParams({})}>
          Todas
        </button>
        <button
          type="button"
          className={soloSinResponder ? "chip activo" : "chip"}
          onClick={() => setSearchParams({ unanswered: "true" })}
        >
          Sin responder
        </button>
      </nav>

      {cargando && <Cargando texto="Cargando consultas…" />}
      {error && <ErrorCarga error={`No se pudieron cargar las consultas: ${error}`} onReintentar={recargar} />}
      {!cargando && !error && consultas?.length === 0 && (
        <Vacio texto={soloSinResponder ? "No tenés consultas sin responder." : "Todavía no recibiste consultas."} />
      )}

      {!cargando &&
        consultas?.map((c) => (
          <div key={c.id} className={c.response ? "item respondida" : "item"}>
            <small>{c.property.title}</small>
            <p>
              <strong>{c.authorName}</strong>: “{c.content}” <small>({timeAgo(c.createdAt)})</small>
            </p>
            {c.response ? (
              <p>
                <strong>Tu respuesta:</strong> {c.response}
              </p>
            ) : (
              <FormRespuesta comentario={c} onRespondida={(r) => marcarRespondida(c.id, r)} />
            )}
          </div>
        ))}
    </>
  );
}
