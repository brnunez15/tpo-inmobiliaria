import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { apiFetch, fieldErrors, toApiError } from "../../api/client";
import type { AuthSession } from "../../api/types";
import { haySesion, iniciarSesion } from "../../auth/sesion";
import { Alerta } from "../../components/Alerta";
import { Campo } from "../../components/Campo";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import estilos from "./AuthPagina.module.css";

const VACIO = {
  fullName: "",
  email: "",
  password: "",
  agencyName: "",
  contactPhone: "",
  contactEmail: "",
  description: "",
  officeAddress: "",
};

type Formulario = typeof VACIO;
type Errores = Partial<Record<keyof Formulario, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(f: Formulario): Errores {
  const errores: Errores = {};
  if (!f.fullName.trim()) errores.fullName = "Ingresá tu nombre.";
  if (!EMAIL.test(f.email.trim())) errores.email = "Ingresá un email válido.";
  if (f.password.length < 6) errores.password = "La contraseña debe tener al menos 6 caracteres.";
  if (!f.agencyName.trim()) errores.agencyName = "Ingresá el nombre de tu inmobiliaria.";
  if (!f.contactPhone.trim()) errores.contactPhone = "Ingresá un teléfono de contacto.";
  if (!EMAIL.test(f.contactEmail.trim())) errores.contactEmail = "Ingresá un email de contacto válido.";
  if (!f.description.trim()) errores.description = "Contá brevemente de qué se trata tu inmobiliaria.";
  return errores;
}

export default function Registro() {
  const navigate = useNavigate();

  const [form, setForm] = useState<Formulario>(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useDocumentTitle("Crear cuenta");

  if (haySesion()) return <Navigate to="/panel" replace />;

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
    // Al corregir un campo, su error desaparece
    setErrores((anterior) => ({ ...anterior, [name]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorGeneral(null);

    const encontrados = validar(form);
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados);
      return;
    }

    setEnviando(true);
    try {
      const datos = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        agencyName: form.agencyName.trim(),
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim(),
        description: form.description.trim(),
        ...(form.officeAddress.trim() ? { officeAddress: form.officeAddress.trim() } : {}),
      };
      // POST /auth/register crea el vendedor y su inmobiliaria, y devuelve { token, sellerId, agencyId }
      const sesion = await apiFetch<AuthSession>("/auth/register", { method: "POST", body: datos });
      iniciarSesion(sesion.token, sesion.agencyId);
      navigate("/panel", { replace: true });
    } catch (err) {
      const apiError = toApiError(err);
      // 400: errores por campo; 409: email o nombre de fantasía repetidos
      const porCampo = fieldErrors(apiError);
      if (Object.keys(porCampo).length > 0) setErrores(porCampo as Errores);
      else setErrorGeneral(apiError.message);
      setEnviando(false);
    }
  }

  return (
    <div className={estilos.fondo}>
      <div className={`${estilos.tarjeta} ${estilos.tarjetaAncha}`}>
        <Link to="/" className={estilos.marca}>
          ⌂ Casa a Casa
        </Link>
        <h1>Creá tu cuenta</h1>
        <p className="suave">Se crea tu usuario y tu inmobiliaria en un solo paso.</p>

        <form className={estilos.formulario} onSubmit={handleSubmit} noValidate>
          {errorGeneral && <Alerta>{errorGeneral}</Alerta>}

          <h2>Tus datos</h2>
          <div className="fila-form">
            <Campo etiqueta="Nombre y apellido" htmlFor="fullName" error={errores.fullName}>
              <input
                id="fullName"
                name="fullName"
                autoComplete="name"
                value={form.fullName}
                onChange={handleChange}
                aria-invalid={!!errores.fullName}
              />
            </Campo>
            <Campo etiqueta="Email" htmlFor="email" error={errores.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                aria-invalid={!!errores.email}
              />
            </Campo>
          </div>
          <Campo etiqueta="Contraseña" htmlFor="password" error={errores.password} ayuda="Mínimo 6 caracteres.">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              aria-invalid={!!errores.password}
            />
          </Campo>

          <h2>Tu inmobiliaria</h2>
          <Campo
            etiqueta="Nombre de fantasía"
            htmlFor="agencyName"
            error={errores.agencyName}
            ayuda="Tiene que ser único en la plataforma."
          >
            <input
              id="agencyName"
              name="agencyName"
              value={form.agencyName}
              onChange={handleChange}
              aria-invalid={!!errores.agencyName}
            />
          </Campo>
          <div className="fila-form">
            <Campo etiqueta="Teléfono de contacto" htmlFor="contactPhone" error={errores.contactPhone}>
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={form.contactPhone}
                onChange={handleChange}
                aria-invalid={!!errores.contactPhone}
              />
            </Campo>
            <Campo etiqueta="Email de contacto" htmlFor="contactEmail" error={errores.contactEmail}>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={handleChange}
                aria-invalid={!!errores.contactEmail}
              />
            </Campo>
          </div>
          <Campo etiqueta="Dirección de la oficina (opcional)" htmlFor="officeAddress">
            <input id="officeAddress" name="officeAddress" value={form.officeAddress} onChange={handleChange} />
          </Campo>
          <Campo etiqueta="Descripción" htmlFor="description" error={errores.description}>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              aria-invalid={!!errores.description}
            />
          </Campo>

          <button type="submit" className="boton primario" disabled={enviando}>
            {enviando ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className={estilos.pie}>
          ¿Ya tenés cuenta? <Link to="/ingresar">Ingresá</Link>
        </p>
      </div>
    </div>
  );
}
