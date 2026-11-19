/**
 * src/pages/panel/MiInmobiliaria.tsx
 *
 * Editar los datos de la inmobiliaria y eliminarla (enunciado). Se elimina
 * solo si no tiene propiedades Publicadas ni Reservadas: si las tiene, el
 * back responde 409 y se muestra su mensaje.
 *
 * PIDE A LA API:
 *   - GET /agencies/:agencyId
 *   - PUT /agencies/:agencyId
 *   - DELETE /agencies/:agencyId
 */
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch, fieldErrors, toApiError } from "../../api/client";
import type { AgencyProfile } from "../../api/types";
import { getAgencyId, getToken, iniciarSesion } from "../../auth/sesion";
import { Alerta } from "../../components/Alerta";
import { Cargando, ErrorCarga } from "../../components/Estados";
import { useFetch } from "../../hooks/useFetch";

// Un email con algo antes y después de la @ (la validación fuerte la hace el back)
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Formulario {
  name: string;
  description: string;
  logoUrl: string;
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
}

export default function MiInmobiliaria() {
  const agencyId = getAgencyId();
  const { datos: inmobiliaria, cargando, error, recargar } = useFetch<AgencyProfile>(`/agencies/${agencyId}`);

  if (cargando) return <Cargando texto="Cargando inmobiliaria…" />;
  if (error || !inmobiliaria) return <ErrorCarga error={`No se pudo cargar la inmobiliaria: ${error}`} onReintentar={recargar} />;

  // El formulario se monta recién con los datos cargados
  return <FormInmobiliaria inmobiliaria={inmobiliaria} />;
}

function FormInmobiliaria({ inmobiliaria }: { inmobiliaria: AgencyProfile }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<Formulario>({
    name: inmobiliaria.name,
    description: inmobiliaria.description,
    logoUrl: inmobiliaria.logoUrl ?? "",
    contactPhone: inmobiliaria.contactPhone,
    contactEmail: inmobiliaria.contactEmail,
    officeAddress: inmobiliaria.officeAddress ?? "",
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function cambiar(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje(null);
    setErrorGeneral(null);

    const nuevos: Record<string, string> = {};
    if (form.name.trim() === "") nuevos.name = "El nombre de fantasía es obligatorio";
    if (form.description.trim() === "") nuevos.description = "La descripción es obligatoria";
    if (form.contactPhone.trim() === "") nuevos.contactPhone = "El teléfono es obligatorio";
    if (!EMAIL.test(form.contactEmail)) nuevos.contactEmail = "El email no es válido";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setGuardando(true);
    try {
      await apiFetch(`/agencies/${inmobiliaria.id}`, {
        method: "PUT",
        body: {
          name: form.name.trim(),
          description: form.description.trim(),
          logoUrl: form.logoUrl.trim() === "" ? null : form.logoUrl.trim(),
          contactPhone: form.contactPhone.trim(),
          contactEmail: form.contactEmail.trim(),
          officeAddress: form.officeAddress.trim() === "" ? null : form.officeAddress.trim(),
        },
      });
      setMensaje("Datos guardados.");
    } catch (err) {
      const apiError = toApiError(err);
      setErrores(fieldErrors(apiError));
      setErrorGeneral(apiError.message);
    }
    setGuardando(false);
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar "${inmobiliaria.name}"? Se borran también sus propiedades inactivas. No se puede deshacer.`)) {
      return;
    }
    setErrorGeneral(null);
    try {
      await apiFetch(`/agencies/${inmobiliaria.id}`, { method: "DELETE" });
      // El vendedor sigue existiendo, pero ya no tiene inmobiliaria ("como máximo una")
      iniciarSesion(getToken()!, null);
      navigate("/", { replace: true });
    } catch (err) {
      // Por ej. 409: tiene propiedades Publicadas o Reservadas
      setErrorGeneral(toApiError(err).message);
    }
  }

  return (
    <>
      <form className="formulario" onSubmit={handleSubmit} noValidate>
        <div className="titulo-con-accion">
          <h1>Mi inmobiliaria</h1>
          <Link to={`/inmobiliarias/${inmobiliaria.id}`} className="boton">
            Ver sitio público
          </Link>
        </div>
        <p>
          Calificación:{" "}
          {inmobiliaria.rating.average === null ? "sin reseñas" : `${inmobiliaria.rating.average.toFixed(1)} de 5 (${inmobiliaria.rating.count} reseñas)`}
        </p>
        <Alerta>{errorGeneral}</Alerta>
        <Alerta tipo="exito">{mensaje}</Alerta>

        <label>
          Nombre de fantasía
          <input name="name" value={form.name} onChange={cambiar} />
        </label>
        {errores.name && <p className="error">{errores.name}</p>}

        <label>
          Descripción
          <textarea name="description" rows={3} value={form.description} onChange={cambiar} />
        </label>
        {errores.description && <p className="error">{errores.description}</p>}

        <div className="fila-campos">
          <label>
            Teléfono de contacto
            <input name="contactPhone" value={form.contactPhone} onChange={cambiar} />
          </label>
          <label>
            Email de contacto
            <input name="contactEmail" type="email" value={form.contactEmail} onChange={cambiar} />
          </label>
        </div>
        {errores.contactPhone && <p className="error">{errores.contactPhone}</p>}
        {errores.contactEmail && <p className="error">{errores.contactEmail}</p>}

        <label>
          Dirección de la oficina (opcional)
          <input name="officeAddress" value={form.officeAddress} onChange={cambiar} />
        </label>
        <label>
          Logo (URL, opcional)
          <input name="logoUrl" type="url" value={form.logoUrl} onChange={cambiar} />
        </label>
        {errores.logoUrl && <p className="error">{errores.logoUrl}</p>}

        <div className="botones">
          <button type="submit" className="boton primario" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>

      <section className="zona-peligro">
        <h2>Eliminar inmobiliaria</h2>
        <p>Solo se puede si no tiene propiedades Publicadas ni Reservadas.</p>
        <button type="button" className="boton peligro" onClick={eliminar}>
          Eliminar inmobiliaria
        </button>
      </section>
    </>
  );
}
