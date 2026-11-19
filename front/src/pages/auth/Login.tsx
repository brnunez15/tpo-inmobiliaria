import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { apiFetch, toApiError } from "../../api/client";
import { haySesion, iniciarSesion } from "../../auth/sesion";
import type { AuthSession } from "../../api/types";
import { Alerta } from "../../components/Alerta";
import { Campo } from "../../components/Campo";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import estilos from "./AuthPagina.module.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useDocumentTitle("Ingresar");

  // Si ya hay sesión, no tiene sentido mostrar el login.
  if (haySesion()) return <Navigate to="/panel" replace />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      // POST /auth/login devuelve { token, sellerId, agencyId }
      const sesion = await apiFetch<AuthSession>("/auth/login", {
        method: "POST",
        body: { email: email.trim(), password },
      });
      iniciarSesion(sesion.token, sesion.agencyId);
      navigate("/panel", { replace: true });
    } catch (err) {
      setError(toApiError(err).message);
      setEnviando(false);
    }
  }

  return (
    <div className={estilos.fondo}>
      <div className={estilos.tarjeta}>
        <Link to="/" className={estilos.marca}>
          ⌂ Casa a Casa
        </Link>
        <h1>Ingresar como vendedor</h1>
        <p className="suave">Administrá tus propiedades, visitas y consultas.</p>

        <form className={estilos.formulario} onSubmit={handleSubmit} noValidate>
          {error && <Alerta>{error}</Alerta>}

          <Campo etiqueta="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Campo>

          <Campo etiqueta="Contraseña" htmlFor="password">
            <div className={estilos.conOjo}>
              <input
                id="password"
                type={verPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={`boton enlace chico ${estilos.ojo}`}
                onClick={() => setVerPassword((v) => !v)}
                aria-pressed={verPassword}
              >
                {verPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </Campo>

          <button type="submit" className="boton primario" disabled={enviando || !email || !password}>
            {enviando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className={estilos.pie}>
          ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </div>
    </div>
  );
}
