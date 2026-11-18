import { useState, type FormEvent } from "react";
import { apiFetch, fieldErrors, toApiError } from "../../api/client";
import { Alerta } from "../../components/Alerta";
import { Campo } from "../../components/Campo";
import { Modal } from "../../components/Modal";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { nowForDateTimeInput } from "../../utils/format";

interface Props {
  abierto: boolean;
  propertyId: number;
  propertyTitle: string;
  onCerrar: () => void;
}

/** Formulario para pedir una visita: nombre, teléfono, fecha y hora futuras y un mensaje opcional. */
export default function ModalVisita({ abierto, propertyId, propertyTitle, onCerrar }: Props) {
  const [nombre, setNombre] = useLocalStorage("tpo_interesado_nombre", "");
  const [telefono, setTelefono] = useLocalStorage("tpo_interesado_telefono", "");
  const [fecha, setFecha] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmada, setConfirmada] = useState(false);

  function cerrar() {
    onCerrar();
    // Al volver a abrirla se empieza de cero (el nombre y teléfono quedan recordados)
    setConfirmada(false);
    setErrores({});
    setErrorGeneral(null);
    setFecha("");
    setMensaje("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorGeneral(null);

    const nuevos: Record<string, string> = {};
    if (!nombre.trim()) nuevos.requesterName = "Escribí tu nombre.";
    if (!telefono.trim()) nuevos.requesterPhone = "Dejá un teléfono para que te contacten.";
    if (!fecha) nuevos.proposedDate = "Elegí una fecha y hora.";
    else if (new Date(fecha).getTime() <= Date.now()) nuevos.proposedDate = "La fecha tiene que ser futura.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setEnviando(true);
    try {
      await apiFetch(`/properties/${propertyId}/visit-requests`, {
        method: "POST",
        body: {
          requesterName: nombre.trim(),
          requesterPhone: telefono.trim(),
          proposedDate: new Date(fecha).toISOString(),
          ...(mensaje.trim() ? { message: mensaje.trim() } : {}),
        },
      });
      setConfirmada(true);
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
    <Modal abierto={abierto} titulo="Pedir una visita" onCerrar={cerrar}>
      {confirmada ? (
        <>
          <Alerta tipo="exito">
            {`¡Solicitud enviada! La inmobiliaria te va a contactar al ${telefono} para coordinar.`}
          </Alerta>
          <button type="button" className="boton primario" onClick={cerrar}>
            Listo
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} noValidate style={{ display: "grid", gap: "0.9rem" }}>
          <p className="suave" style={{ margin: 0 }}>
            {propertyTitle}
          </p>
          {errorGeneral && <Alerta>{errorGeneral}</Alerta>}
          <Campo etiqueta="Tu nombre" htmlFor="visita-nombre" error={errores.requesterName}>
            <input
              id="visita-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={120}
              autoComplete="name"
              aria-invalid={!!errores.requesterName}
            />
          </Campo>
          <Campo etiqueta="Teléfono" htmlFor="visita-telefono" error={errores.requesterPhone}>
            <input
              id="visita-telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              maxLength={40}
              autoComplete="tel"
              aria-invalid={!!errores.requesterPhone}
            />
          </Campo>
          <Campo etiqueta="Fecha y hora propuestas" htmlFor="visita-fecha" error={errores.proposedDate}>
            <input
              id="visita-fecha"
              type="datetime-local"
              min={nowForDateTimeInput()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              aria-invalid={!!errores.proposedDate}
            />
          </Campo>
          <Campo etiqueta="Mensaje (opcional)" htmlFor="visita-mensaje" error={errores.message}>
            <textarea
              id="visita-mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              maxLength={1000}
              placeholder="Ej.: puedo solo por la tarde"
            />
          </Campo>
          <div className="acciones" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="boton" onClick={cerrar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="boton primario" disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar solicitud"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
