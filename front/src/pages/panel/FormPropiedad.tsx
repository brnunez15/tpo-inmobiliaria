/**
 * src/pages/panel/FormPropiedad.tsx
 *
 * Alta (/panel/propiedades/nueva) y edición (/panel/propiedades/:id/editar)
 * comparten este formulario. Es un formulario controlado con un objeto y un
 * solo handler (Clase 12): así el Terreno puede ocultar al instante los
 * campos que no le aplican.
 *
 * Validación en dos lados (Clase 12): acá se valida para marcar el campo sin
 * viajar al servidor; el back valida igual y, si rechaza, se muestra su mensaje.
 *
 * PIDE A LA API:
 *   - GET /properties/:id   (edición: para precargar)
 *   - POST /properties
 *   - PUT /properties/:id
 */
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { apiFetch, fieldErrors, toApiError } from "../../api/client";
import type { PropertyDetail } from "../../api/types";
import { Alerta } from "../../components/Alerta";
import { Cargando, ErrorCarga } from "../../components/Estados";
import { useFetch } from "../../hooks/useFetch";
import { AMENITIES, STATUS_LABELS } from "../../utils/labels";

// Los valores tal cual los devuelven los inputs: todo string (Clase 15, propiedadForm.ts)
interface Formulario {
  title: string;
  description: string;
  type: string;
  operation: string;
  price: string;
  currency: string;
  address: string;
  area: string;
  coveredAreaM2: string;
  totalAreaM2: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  ageYears: string;
  tags: string[];
  images: string[]; // URLs; la primera es la portada
}

type Errores = Partial<Record<keyof Formulario, string>>;

const VACIO: Formulario = {
  title: "",
  description: "",
  type: "APARTMENT",
  operation: "SALE",
  price: "",
  currency: "USD",
  address: "",
  area: "",
  coveredAreaM2: "",
  totalAreaM2: "",
  rooms: "",
  bedrooms: "",
  bathrooms: "",
  ageYears: "",
  tags: [],
  images: [""],
};

// Para precargar la edición: los números pasan a texto, null pasa a ""
function desdePropiedad(p: PropertyDetail): Formulario {
  const texto = (valor: string | number | null) => (valor === null ? "" : String(Number(valor)));
  return {
    title: p.title,
    description: p.description,
    type: p.type,
    operation: p.operation,
    price: texto(p.price),
    currency: p.currency,
    address: p.address,
    area: p.area,
    coveredAreaM2: texto(p.coveredAreaM2),
    totalAreaM2: texto(p.totalAreaM2),
    rooms: texto(p.rooms),
    bedrooms: texto(p.bedrooms),
    bathrooms: texto(p.bathrooms),
    ageYears: texto(p.ageYears),
    tags: p.tags,
    images: p.images.length > 0 ? p.images.map((i) => i.url) : [""],
  };
}

// Mismas reglas que el back (que igual las valida): acá solo se evita el viaje y se marca el campo
function validar(f: Formulario): Errores {
  const errores: Errores = {};
  if (f.title.trim() === "") errores.title = "El título es obligatorio";
  if (f.description.trim() === "") errores.description = "La descripción es obligatoria";
  if (f.address.trim() === "") errores.address = "La dirección es obligatoria";
  if (f.area.trim() === "") errores.area = "La zona es obligatoria";
  if (!(Number(f.price) > 0)) errores.price = "El precio tiene que ser mayor a 0";
  if (!(Number(f.totalAreaM2) > 0)) errores.totalAreaM2 = "La superficie total tiene que ser mayor a 0";
  if (f.type !== "LAND" && f.coveredAreaM2 !== "") {
    if (!(Number(f.coveredAreaM2) > 0)) errores.coveredAreaM2 = "La superficie cubierta tiene que ser mayor a 0";
    else if (Number(f.coveredAreaM2) > Number(f.totalAreaM2))
      errores.coveredAreaM2 = "La superficie cubierta no puede superar a la total";
  }
  return errores;
}

function aNumeroONull(texto: string): number | null {
  return texto === "" ? null : Number(texto);
}

// Lo que se manda en el body. Al Terreno no le aplican cubierta, ambientes, dormitorios ni baños.
function aDatos(f: Formulario) {
  const esTerreno = f.type === "LAND";
  return {
    title: f.title.trim(),
    description: f.description.trim(),
    type: f.type,
    operation: f.operation,
    price: Number(f.price),
    currency: f.currency,
    address: f.address.trim(),
    area: f.area.trim(),
    totalAreaM2: Number(f.totalAreaM2),
    coveredAreaM2: esTerreno ? null : aNumeroONull(f.coveredAreaM2),
    rooms: esTerreno ? null : aNumeroONull(f.rooms),
    bedrooms: esTerreno ? null : aNumeroONull(f.bedrooms),
    bathrooms: esTerreno ? null : aNumeroONull(f.bathrooms),
    ageYears: aNumeroONull(f.ageYears),
    tags: f.tags,
    images: f.images.map((url) => url.trim()).filter((url) => url !== ""),
  };
}

export default function FormPropiedad() {
  const { id } = useParams();

  // Alta: no hay nada que cargar
  if (id === undefined) return <FormularioPropiedad inicial={VACIO} />;

  return <EditarPropiedad id={id} />;
}

function EditarPropiedad({ id }: { id: string }) {
  const { datos: propiedad, cargando, error, recargar } = useFetch<PropertyDetail>(`/properties/${id}`);

  if (cargando) return <Cargando texto="Cargando propiedad…" />;
  if (error) return <ErrorCarga error={`No se pudo cargar la propiedad: ${error}`} onReintentar={recargar} />;
  if (!propiedad) return <p className="mensaje">No existe la propiedad {id}.</p>;

  if (propiedad.status === "SOLD" || propiedad.status === "RENTED" || propiedad.status === "CANCELLED") {
    return (
      <div className="mensaje">
        <p>Una propiedad {STATUS_LABELS[propiedad.status].toLowerCase()} ya no se puede editar.</p>
        <Link to="/panel/propiedades">Volver a Mis propiedades</Link>
      </div>
    );
  }

  // El formulario se monta recién con los datos: su useState arranca con la propiedad cargada
  return <FormularioPropiedad inicial={desdePropiedad(propiedad)} propiedadId={propiedad.id} />;
}

function FormularioPropiedad({ inicial, propiedadId }: { inicial: Formulario; propiedadId?: number }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<Formulario>(inicial);
  const [enviado, setEnviado] = useState(false); // los errores se muestran recién al intentar guardar
  const [erroresBack, setErroresBack] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const esTerreno = form.type === "LAND";
  // Validación calculada en cada render (Clase 12): no se guarda en el estado
  const errores: Errores = enviado ? { ...erroresBack, ...validar(form) } : erroresBack;

  // Un solo handler para todos los inputs: el name del input es la clave del objeto (Clase 12)
  function cambiar(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function alternarTag(tag: string) {
    const tags = form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag];
    setForm({ ...form, tags });
  }

  function cambiarImagen(indice: number, url: string) {
    setForm({ ...form, images: form.images.map((actual, i) => (i === indice ? url : actual)) });
  }

  function agregarImagen() {
    setForm({ ...form, images: [...form.images, ""] });
  }

  function quitarImagen(indice: number) {
    setForm({ ...form, images: form.images.filter((_, i) => i !== indice) });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviado(true);
    setErroresBack({});
    setErrorGeneral(null);
    if (Object.keys(validar(form)).length > 0) return;

    setGuardando(true);
    try {
      if (propiedadId === undefined) {
        await apiFetch("/properties", { method: "POST", body: aDatos(form) });
      } else {
        await apiFetch(`/properties/${propiedadId}`, { method: "PUT", body: aDatos(form) });
      }
      navigate("/panel/propiedades", { replace: true });
    } catch (error) {
      const apiError = toApiError(error);
      // Un 400 de zod trae el campo; una regla de negocio (por ej. visita confirmada) es un mensaje general
      setErroresBack(fieldErrors(apiError));
      setErrorGeneral(apiError.message);
      setGuardando(false);
    }
  }

  function error(campo: keyof Formulario) {
    return errores[campo] && <p className="error">{errores[campo]}</p>;
  }

  return (
    <form className="formulario" onSubmit={handleSubmit} noValidate>
      <h1>{propiedadId === undefined ? "Nueva propiedad" : "Editar propiedad"}</h1>
      <Alerta>{errorGeneral}</Alerta>

      <label>
        Título
        <input name="title" value={form.title} onChange={cambiar} />
      </label>
      {error("title")}

      <label>
        Descripción
        <textarea name="description" rows={4} value={form.description} onChange={cambiar} />
      </label>
      {error("description")}

      <div className="fila-campos">
        <label>
          Tipo
          <select name="type" value={form.type} onChange={cambiar}>
            <option value="HOUSE">Casa</option>
            <option value="APARTMENT">Departamento</option>
            <option value="LAND">Terreno</option>
            <option value="COMMERCIAL">Local</option>
          </select>
        </label>
        <label>
          Operación
          <select name="operation" value={form.operation} onChange={cambiar}>
            <option value="SALE">Venta</option>
            <option value="RENT">Alquiler</option>
          </select>
        </label>
        <label>
          Precio
          <input name="price" type="number" min="0" value={form.price} onChange={cambiar} />
        </label>
        <label>
          Moneda
          <select name="currency" value={form.currency} onChange={cambiar}>
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </label>
      </div>
      {error("price")}

      <div className="fila-campos">
        <label>
          Dirección (calle y altura)
          <input name="address" value={form.address} onChange={cambiar} />
        </label>
        <label>
          Zona o barrio
          <input name="area" value={form.area} onChange={cambiar} />
        </label>
      </div>
      {error("address")}
      {error("area")}

      <div className="fila-campos">
        {!esTerreno && (
          <label>
            Sup. cubierta (m²)
            <input name="coveredAreaM2" type="number" min="0" value={form.coveredAreaM2} onChange={cambiar} />
          </label>
        )}
        <label>
          Sup. total (m²)
          <input name="totalAreaM2" type="number" min="0" value={form.totalAreaM2} onChange={cambiar} />
        </label>
        <label>
          Antigüedad (años, opcional)
          <input name="ageYears" type="number" min="0" value={form.ageYears} onChange={cambiar} />
        </label>
      </div>
      {error("coveredAreaM2")}
      {error("totalAreaM2")}

      {/* Al Terreno no le aplican ambientes, dormitorios ni baños */}
      {!esTerreno && (
        <div className="fila-campos">
          <label>
            Ambientes (opcional)
            <input name="rooms" type="number" min="0" value={form.rooms} onChange={cambiar} />
          </label>
          <label>
            Dormitorios (opcional)
            <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={cambiar} />
          </label>
          <label>
            Baños (opcional)
            <input name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={cambiar} />
          </label>
        </div>
      )}

      <fieldset>
        <legend>Amenities</legend>
        <div className="checks">
          {AMENITIES.map((tag) => (
            <label key={tag}>
              <input type="checkbox" checked={form.tags.includes(tag)} onChange={() => alternarTag(tag)} /> {tag}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Fotos (URL). La primera es la portada; para publicar hace falta al menos una.</legend>
        {form.images.map((url, i) => (
          <div key={i} className="botones">
            <input
              type="url"
              placeholder="https://…"
              value={url}
              onChange={(e) => cambiarImagen(i, e.target.value)}
              style={{ flex: 1 }}
            />
            {form.images.length > 1 && (
              <button type="button" className="boton" onClick={() => quitarImagen(i)}>
                Quitar
              </button>
            )}
          </div>
        ))}
        <button type="button" className="boton" onClick={agregarImagen}>
          + Agregar foto
        </button>
      </fieldset>
      {error("images")}

      <div className="botones">
        <button type="submit" className="boton primario" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" className="boton" onClick={() => navigate(-1)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
