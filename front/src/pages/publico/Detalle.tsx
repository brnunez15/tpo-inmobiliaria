import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import type { PropertyDetail, PropertyImage } from "../../api/types";
import { Alerta } from "../../components/Alerta";
import { BadgeEstadoPropiedad } from "../../components/Badge";
import { Cargando, ErrorCarga, Vacio } from "../../components/Estados";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { formatM2, formatPrice } from "../../utils/format";
import { OPERATION_LABELS, TYPE_LABELS } from "../../utils/labels";
import ConsultasPropiedad from "./ConsultasPropiedad";
import estilos from "./Detalle.module.css";
import ModalVisita from "./ModalVisita";

/** Foto principal + miniaturas: al hacer clic en una miniatura cambia la principal. */
function Galeria({ imagenes, titulo }: { imagenes: PropertyImage[]; titulo: string }) {
  const [indice, setIndice] = useState(0);
  const actual = imagenes[indice];

  return (
    <div className={estilos.galeria}>
      <div className={estilos.principal}>
        {actual ? <img src={actual.url} alt={titulo} /> : <div className={estilos.sinFoto}>Sin fotos</div>}
      </div>
      {imagenes.length > 1 && (
        <div className={estilos.miniaturas}>
          {imagenes.map((img, i) => (
            <button
              key={img.id}
              type="button"
              className={`${estilos.mini} ${i === indice ? estilos.miniActiva : ""}`}
              onClick={() => setIndice(i)}
              aria-label={`Ver foto ${i + 1} de ${imagenes.length}`}
              aria-current={i === indice}
            >
              <img src={img.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | number | null }) {
  if (valor === null || valor === "") return null;
  return (
    <div className={estilos.dato}>
      <dt>{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  );
}

export default function Detalle() {
  const { id } = useParams();
  const { datos: p, cargando, error, recargar } = useFetch<PropertyDetail>(`/properties/${id}`);
  const [pidiendoVisita, setPidiendoVisita] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle(p ? p.title : "Propiedad");

  /** Si se llegó desde la app, Atrás conserva los filtros del listado; si se abrió el link directo, va al inicio. */
  function volver() {
    if (location.key !== "default") navigate(-1);
    else navigate("/");
  }

  if (cargando && !p) return <Cargando texto="Cargando propiedad…" />;

  
    if (error) {
    return <ErrorCarga error={error} onReintentar={recargar} />;
  }

  if (!p) {
    return (
      <>
        <Vacio texto="No encontramos esta propiedad. Puede que ya no esté publicada o que el link sea incorrecto." />
        <Link to="/" className="boton primario">
          Ver todas las propiedades
        </Link>
      </>
    );
  }

  const admiteVisitas = p.status === "PUBLISHED";

  return (
    <>
      <button type="button" className={`boton enlace ${estilos.volver}`} onClick={volver}>
        ← Volver
      </button>

      <div className={estilos.encabezado}>
        <div>
          <div className={estilos.etiquetas}>
            <span className="suave">
              {TYPE_LABELS[p.type]} en {OPERATION_LABELS[p.operation].toLowerCase()}
            </span>
            {p.status !== "PUBLISHED" && <BadgeEstadoPropiedad status={p.status} />}
          </div>
          <h1>{p.title}</h1>
          <p className={estilos.direccion}>
            {p.address} · {p.area}
          </p>
        </div>
      </div>

      <div className={estilos.layout}>
        <div>
          <Galeria key={p.id} imagenes={p.images} titulo={p.title} />

          <section className={estilos.panel} aria-label="Características">
            <h2>Características</h2>
            <dl className={estilos.datos}>
              <Dato etiqueta="Superficie total" valor={formatM2(p.totalAreaM2)} />
              <Dato etiqueta="Superficie cubierta" valor={p.coveredAreaM2 !== null ? formatM2(p.coveredAreaM2) : null} />
              <Dato etiqueta="Ambientes" valor={p.rooms} />
              <Dato etiqueta="Dormitorios" valor={p.bedrooms} />
              <Dato etiqueta="Baños" valor={p.bathrooms} />
              <Dato etiqueta="Antigüedad" valor={p.ageYears !== null ? (p.ageYears === 0 ? "A estrenar" : `${p.ageYears} años`) : null} />
            </dl>
            {p.tags.length > 0 && (
              <div className={estilos.tags}>
                {p.tags.map((tag) => (
                  <span key={tag} className={estilos.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h3>Descripción</h3>
            <p className={estilos.descripcion}>{p.description}</p>
          </section>

          <ConsultasPropiedad propertyId={p.id} />
        </div>

        <aside className={estilos.lateral}>
          <div className={estilos.panel}>
            <p className={estilos.precio}>{formatPrice(p.price, p.currency, p.operation)}</p>
            {admiteVisitas ? (
              <button type="button" className="boton primario" style={{ width: "100%" }} onClick={() => setPidiendoVisita(true)}>
                Pedir visita
              </button>
            ) : (
              <p className="suave" style={{ margin: 0 }}>
                Esta propiedad no admite visitas en este momento.
              </p>
            )}
          </div>

          <div className={estilos.panel}>
            <div className={estilos.inmo}>
              {p.agency.logoUrl ? (
                <img src={p.agency.logoUrl} alt="" />
              ) : (
                <span className={estilos.inmoLogo} aria-hidden="true">
                  {p.agency.name.charAt(0)}
                </span>
              )}
              <h3>{p.agency.name}</h3>
            </div>
            <p className={estilos.contacto}>
              <span>📞 {p.agency.contactPhone}</span>
              <span>✉️ {p.agency.contactEmail}</span>
              {p.agency.officeAddress && <span>📍 {p.agency.officeAddress}</span>}
            </p>
            <Link to={`/inmobiliarias/${p.agency.id}`} className="boton" style={{ width: "100%" }}>
              Ver inmobiliaria
            </Link>
          </div>
        </aside>
      </div>

      <ModalVisita
        abierto={pidiendoVisita}
        propertyId={p.id}
        propertyTitle={p.title}
        onCerrar={() => setPidiendoVisita(false)}
      />
    </>
  );
}
