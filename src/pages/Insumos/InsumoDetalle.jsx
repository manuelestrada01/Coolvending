import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import { useAuth } from "../../shared/utils/AuthContext";
import { getInsumoById } from "../../services/firebase/insumosService";
import PageHero from "../../shared/layout/PageHero";
import "./InsumoDetalle.css";

const TAG_STYLES = {
  "Algodón de azúcar": { color: "#d63384", softBg: "rgba(214,51,132,0.12)", icon: "🍬" },
  "Pochoclos":         { color: "#f5a524", softBg: "rgba(245,165,36,0.12)",  icon: "🍿" },
  "Ambas":             { color: "#8b5cf6", softBg: "rgba(139,92,246,0.12)",  icon: "✨" },
};

function formatPrice(value) {
  const n = Number(value);
  if (!n && n !== 0) return null;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function InsumoDetalle() {
  const { id } = useParams();
  const { puedeVerPrecios, isAdmin } = useAuth();
  const canSeePrice = isAdmin || puedeVerPrecios;

  const [insumo, setInsumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getInsumoById(id)
      .then((data) => {
        if (!data) setNotFound(true);
        else setInsumo(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const tagStyle = insumo ? (TAG_STYLES[insumo.maquina] ?? TAG_STYLES["Ambas"]) : null;
  const price = insumo ? formatPrice(insumo.precio) : null;

  return (
    <>
      <PageHero
        title={<>Detalle del <span className="ph-gradient-text">insumo</span></>}
        description="Información completa del producto seleccionado."
      />

      <section className="insd-section">
        <Container>
          {/* Back link */}
          <Link to="/insumos" className="insd-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver a insumos
          </Link>

          {loading && (
            <div className="text-center py-5">
              <Spinner style={{ color: "var(--cv-gold)" }} />
            </div>
          )}

          {!loading && notFound && (
            <div className="insd-not-found">
              <p className="insd-not-found-text">Insumo no encontrado.</p>
              <Link to="/insumos" className="insd-back insd-back--standalone">
                Ver todos los insumos
              </Link>
            </div>
          )}

          {!loading && insumo && (
            <div className="insd-card">
              {/* Image */}
              <div className="insd-img-wrap">
                {insumo.imagenURL ? (
                  <img src={insumo.imagenURL} alt={insumo.nombre} className="insd-img" />
                ) : (
                  <div className="insd-img-placeholder">
                    <span aria-hidden="true">{tagStyle.icon}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="insd-info">
                {/* Tag */}
                <span
                  className="insd-tag"
                  style={{ color: tagStyle.color, background: tagStyle.softBg, borderColor: tagStyle.color }}
                >
                  {tagStyle.icon} {insumo.maquina}
                </span>

                {/* Name */}
                <h1 className="insd-name">{insumo.nombre}</h1>

                {/* Description */}
                {insumo.descripcion && (
                  <p className="insd-desc">{insumo.descripcion}</p>
                )}

                <div className="insd-divider" />

                {/* Quantity */}
                {insumo.cantidad && (
                  <div className="insd-meta-row">
                    <span className="insd-meta-label">Presentación</span>
                    <span className="insd-meta-value">{insumo.cantidad}</span>
                  </div>
                )}

                {/* Price */}
                {price && (
                  <div className="insd-meta-row">
                    <span className="insd-meta-label">Precio</span>
                    {canSeePrice ? (
                      <span className="insd-price">{price}</span>
                    ) : (
                      <span className="insd-price-lock">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <Link to="/login" className="insd-price-lock-link">Iniciá sesión para ver el precio</Link>
                      </span>
                    )}
                  </div>
                )}

                <div className="insd-divider" />

                {/* CTA */}
                <Link to="/contacto" className="insd-cta-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Consultar disponibilidad
                </Link>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
