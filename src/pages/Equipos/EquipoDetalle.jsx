import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import { getMaquinaById } from "../../services/firebase/maquinas";
import PageHero from "../../shared/layout/PageHero";
import "./EquipoDetalle.css";

const GRADIENTS = [
  { gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", orb: "rgba(124, 58, 237, 0.35)" },
  { gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)", orb: "rgba(236, 72, 153, 0.3)" },
  { gradient: "linear-gradient(135deg, #f9d976 0%, #f39f86 100%)", orb: "rgba(251, 146, 60, 0.35)" },
  { gradient: "linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)", orb: "rgba(16, 185, 129, 0.32)" },
  { gradient: "linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)", orb: "rgba(245, 158, 11, 0.3)" },
  { gradient: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #ffecd2 100%)", orb: "rgba(239, 68, 68, 0.3)" },
];

const BADGE_STYLES = {
  "oferta":      { bg: "#f5a524", color: "#fff" },
  "nuevo":       { bg: "#10b981", color: "#fff" },
  "mas vendido": { bg: "#d63384", color: "#fff" },
};

function idToGradient(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % GRADIENTS.length;
  return GRADIENTS[hash];
}

export default function EquipoDetalle() {
  const { id } = useParams();
  const [maquina, setMaquina] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getMaquinaById(id)
      .then((data) => {
        if (!data) setNotFound(true);
        else setMaquina(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const palette = maquina ? idToGradient(maquina.id) : null;
  const badgeKey = maquina?.badge?.toLowerCase();
  const badgeStyle = badgeKey
    ? (BADGE_STYLES[badgeKey] ?? { bg: "rgba(255,255,255,0.65)", color: "#1a1a1a" })
    : null;

  return (
    <>
      <PageHero
        badge="EQUIPOS"
        title={<>Detalle del <span className="ph-gradient-text">modelo</span></>}
        description="Información completa de la máquina seleccionada."
      />

      <section className="eqd-section">
        <Container>
          <Link to="/equipos" className="eqd-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver a equipos
          </Link>

          {loading && (
            <div className="text-center py-5">
              <Spinner style={{ color: "var(--cv-gold)" }} />
            </div>
          )}

          {!loading && notFound && (
            <div className="eqd-not-found">
              <p className="eqd-not-found-text">Máquina no encontrada.</p>
              <Link to="/equipos" className="eqd-back eqd-back--standalone">
                Ver todos los equipos
              </Link>
            </div>
          )}

          {!loading && maquina && (
            <div className="eqd-card">
              {/* Image panel */}
              <div className="eqd-img-wrap" style={{ background: palette.gradient }}>
                <div className="eqd-img-orb" style={{ background: palette.orb }} />
                {maquina.imagenURL ? (
                  <img src={maquina.imagenURL} alt={maquina.nombre} className="eqd-img" />
                ) : (
                  <div className="eqd-img-placeholder">🤖</div>
                )}
              </div>

              {/* Info panel */}
              <div className="eqd-info">
                <div className="eqd-pills-row">
                  {maquina.badge && (
                    <span
                      className="eqd-badge"
                      style={{ background: badgeStyle.bg, color: badgeStyle.color }}
                    >
                      {maquina.badge}
                    </span>
                  )}
                  {maquina.categoria && (
                    <span className="eqd-category">{maquina.categoria}</span>
                  )}
                </div>

                <h1 className="eqd-name">{maquina.nombre}</h1>

                {maquina.descripcion && (
                  <p className="eqd-desc">{maquina.descripcion}</p>
                )}

                {maquina.tags?.length > 0 && (
                  <>
                    <div className="eqd-divider" />
                    <div className="eqd-tags">
                      {maquina.tags.map((tag) => (
                        <span key={tag} className="eqd-tag">{tag}</span>
                      ))}
                    </div>
                  </>
                )}

                <div className="eqd-divider" />

                <div className="eqd-ctas">
                  <Link to="/presupuestos" className="eqd-cta-btn eqd-cta-btn--primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    Solicitar presupuesto
                  </Link>
                  <a
                    href="https://wa.me/5492612318259"
                    target="_blank"
                    rel="noreferrer"
                    className="eqd-cta-btn eqd-cta-btn--secondary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
