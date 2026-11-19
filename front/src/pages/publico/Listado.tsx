/**
 * src/pages/publico/Listado.tsx — ruta "/"
 *
 * Propiedades publicadas en tarjetas, con filtros, orden y paginación.
 * Todo el estado (filtros, orden, página) vive en la URL: se puede compartir
 * el link y el botón "Atrás" deshace un filtro.
 */
import { useSearchParams } from "react-router";
import { toQuery } from "../../api/client";
import type { Page, Property } from "../../api/types";
import { Cargando, ErrorCarga, Vacio } from "../../components/Estados";
import { InputDemorado } from "../../components/InputDemorado";
import { Paginacion } from "../../components/Paginacion";
import { TarjetaPropiedad } from "../../components/TarjetaPropiedad";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { AMENITIES, OPERATION_LABELS, PAGE_SIZE, TYPE_LABELS } from "../../utils/labels";
import estilos from "./Listado.module.css";

// Cada opción de orden traduce a los parámetros que entiende el back (sortBy y order).
const ORDENES = {
  recientes: { sortBy: "createdAt", order: "desc", etiqueta: "Más recientes" },
  "precio-asc": { sortBy: "price", order: "asc", etiqueta: "Precio: menor a mayor" },
  "precio-desc": { sortBy: "price", order: "desc", etiqueta: "Precio: mayor a menor" },
  "superficie-desc": { sortBy: "totalAreaM2", order: "desc", etiqueta: "Mayor superficie" },
} as const;

type ClaveOrden = keyof typeof ORDENES;

// Parámetros de la URL que cuentan como "filtro activo" (page y sort no cuentan).
const FILTROS = ["type", "operation", "q", "currency", "minPrice", "maxPrice", "area", "rooms", "tags"];

export default function Listado() {
  // ── El estado vive en la URL: cada filtro es un parámetro (?type=HOUSE&rooms=3…) ──
  const [searchParams, setSearchParams] = useSearchParams();

  // Valor de un parámetro de la URL, o "" si no está
  const get = (clave: string): string => searchParams.get(clave) ?? "";

  // "pileta,cochera" en la URL → ["pileta", "cochera"] (y [] si no hay ninguno)
  const tags: string[] = get("tags") === "" ? [] : get("tags").split(",");

  // Orden elegido; si el parámetro no existe o es inválido, el de por defecto
  const sort = get("sort");
  const ordenActual: ClaveOrden = sort in ORDENES ? (sort as ClaveOrden) : "recientes";

  // Página actual: entero ≥ 1 (si falta o es texto raro, 1)
  const numero = Number(get("page"));
  const pagina = Number.isInteger(numero) && numero >= 1 ? numero : 1;

  // Cambia (o borra) un parámetro de la URL. Al cambiar un filtro se vuelve a la
  // página 1: la página 5 de una búsqueda nueva podría ni existir.
  // `reemplazar` evita llenar el historial letra por letra en los inputs de texto.
  function cambiar(clave: string, valor: string, reemplazar = false) {
    setSearchParams(
      (anteriores) => {
        const nuevos = new URLSearchParams(anteriores);
        if (valor === "") nuevos.delete(clave);
        else nuevos.set(clave, valor);
        if (clave !== "page") nuevos.delete("page");
        return nuevos;
      },
      { replace: reemplazar },
    );
  }

  // Agrega o saca un amenity de la lista y la guarda en la URL separada por comas
  function alternarAmenity(amenity: string) {
    const nuevos = tags.includes(amenity) ? tags.filter((t) => t !== amenity) : [...tags, amenity];
    cambiar("tags", nuevos.join(","));
  }

  // ¿Hay al menos un filtro activo? (para mostrar "Limpiar filtros")
  const hayFiltros = FILTROS.some((clave) => get(clave) !== "");

  // ── La consulta a la API: los parámetros de la URL se traducen a los del back ──
  const path =
    "/properties" +
    toQuery({
      type: get("type"),
      operation: get("operation"),
      currency: get("currency"),
      minPrice: get("minPrice"),
      maxPrice: get("maxPrice"),
      area: get("area"),
      rooms: get("rooms"),
      tags: get("tags"),
      search: get("q"), // en la URL se llama "q", el back espera "search"
      sortBy: ORDENES[ordenActual].sortBy,
      order: ORDENES[ordenActual].order,
      page: pagina,
      limit: PAGE_SIZE,
    });

  // Cuando cambia `path` se vuelve a pedir (y se cancela el pedido anterior)
  const { datos, cargando, error, recargar } = useFetch<Page<Property>>(path);

  useDocumentTitle("Propiedades en venta y alquiler");

  // ── Qué se muestra según el estado ──
  let resultados;
  if (error) {
    resultados = <ErrorCarga error={error} onReintentar={recargar} />;
  } else if (datos === null && cargando) {
    resultados = <Cargando texto="Buscando propiedades…" />;
  } else if (datos !== null && datos.data.length === 0) {
    resultados = (
      <>
        <Vacio
          texto={
            hayFiltros
              ? "No encontramos propiedades con esos filtros. Probá con otros."
              : "Todavía no hay propiedades publicadas."
          }
        />
        {hayFiltros && (
          <button type="button" className="boton" onClick={() => setSearchParams({})}>
            Limpiar filtros
          </button>
        )}
      </>
    );
  } else if (datos !== null) {
    resultados = (
      <>
        <div className={`${estilos.grilla} ${cargando ? estilos.cargandoMas : ""}`}>
          {datos.data.map((p) => (
            <TarjetaPropiedad key={p.id} propiedad={p} />
          ))}
        </div>
        <Paginacion
          meta={datos.meta}
          onCambiar={(p) => {
            cambiar("page", String(p));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </>
    );
  }

  return (
    <>
      <section className={estilos.portada}>
        <h1>Encontrá tu próximo lugar</h1>
        <p className="suave">Casas, departamentos, terrenos y locales de inmobiliarias de toda la zona.</p>
      </section>

      <section className={estilos.filtros} aria-label="Filtros de búsqueda">
        <div className={estilos.fila}>
          <div className={estilos.campo}>
            <label htmlFor="f-tipo">Tipo</label>
            <select id="f-tipo" value={get("type")} onChange={(e) => cambiar("type", e.target.value)}>
              <option value="">Todos</option>
              {Object.entries(TYPE_LABELS).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
          </div>
          <div className={estilos.campo}>
            <label htmlFor="f-operacion">Operación</label>
            <select
              id="f-operacion"
              value={get("operation")}
              onChange={(e) => cambiar("operation", e.target.value)}
            >
              <option value="">Venta y alquiler</option>
              {Object.entries(OPERATION_LABELS).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
          </div>
          <div className={`${estilos.campo} ${estilos.buscador}`}>
            <label htmlFor="f-q">Buscar</label>
            <InputDemorado
              id="f-q"
              type="search"
              placeholder="Título o descripción…"
              value={get("q")}
              onConfirmar={(v) => cambiar("q", v, true)}
            />
          </div>
        </div>

        <div className={estilos.fila}>
          <div className={estilos.campo}>
            <label htmlFor="f-zona">Zona</label>
            <InputDemorado
              id="f-zona"
              placeholder="Barrio o localidad"
              value={get("area")}
              onConfirmar={(v) => cambiar("area", v, true)}
            />
          </div>
          <div className={estilos.campo}>
            <label htmlFor="f-ambientes">Ambientes</label>
            <select id="f-ambientes" value={get("rooms")} onChange={(e) => cambiar("rooms", e.target.value)}>
              <option value="">Cualquiera</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className={estilos.campo}>
            <label htmlFor="f-moneda">Moneda</label>
            <select id="f-moneda" value={get("currency")} onChange={(e) => cambiar("currency", e.target.value)}>
              <option value="">Todas</option>
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
            </select>
          </div>
          <div className={estilos.campo}>
            <span id="f-precio" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              Precio
            </span>
            <div className={estilos.rango} role="group" aria-labelledby="f-precio">
              <InputDemorado
                type="number"
                min={0}
                placeholder="Mín."
                aria-label="Precio mínimo"
                value={get("minPrice")}
                onConfirmar={(v) => cambiar("minPrice", v, true)}
              />
              <InputDemorado
                type="number"
                min={0}
                placeholder="Máx."
                aria-label="Precio máximo"
                value={get("maxPrice")}
                onConfirmar={(v) => cambiar("maxPrice", v, true)}
              />
            </div>
          </div>
        </div>

        <details className={estilos.amenities} open={tags.length > 0}>
          <summary>Amenities {tags.length > 0 && `(${tags.length})`}</summary>
          <div className={estilos.chips}>
            {AMENITIES.map((amenity) => (
              <label
                key={amenity}
                className={`${estilos.chip} ${tags.includes(amenity) ? estilos.chipActivo : ""}`}
              >
                <input
                  type="checkbox"
                  className="visualmente-oculto"
                  checked={tags.includes(amenity)}
                  onChange={() => alternarAmenity(amenity)}
                />
                {amenity}
              </label>
            ))}
          </div>
        </details>
      </section>


      {/* Barra de resultados: cantidad a la izquierda, orden a la derecha */}
      <div className={estilos.resultados}>
        <p aria-live="polite" className="suave">
          {datos === null
            ? "\u00a0"
            : `${datos.meta.total} ${datos.meta.total === 1 ? "propiedad" : "propiedades"}`}
        </p>
        <div>
          <label htmlFor="f-orden">Ordenar por </label>
          <select
            id="f-orden"
            value={ordenActual}
            onChange={(e) => cambiar("sort", e.target.value === "recientes" ? "" : e.target.value)}
          >
            {(Object.keys(ORDENES) as ClaveOrden[]).map((clave) => (
              <option key={clave} value={clave}>
                {ORDENES[clave].etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      {resultados}
    </>
  );
}
