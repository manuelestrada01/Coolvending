import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import PageHero from "../../shared/layout/PageHero";
import { getMaquinas } from "../../services/firebase/maquinas";
import { useScrollReveal } from "../../shared/utils/useScrollReveal";
import "./Equipos.css";

const GRADIENTS = [
  { gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", orb: "rgba(124, 58, 237, 0.4)"  },
  { gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)", orb: "rgba(236, 72, 153, 0.38)" },
  { gradient: "linear-gradient(135deg, #f9d976 0%, #f39f86 100%)", orb: "rgba(251, 146, 60, 0.42)" },
  { gradient: "linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)", orb: "rgba(16, 185, 129, 0.38)" },
  { gradient: "linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)", orb: "rgba(245, 158, 11, 0.38)" },
  { gradient: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #ffecd2 100%)", orb: "rgba(239, 68, 68, 0.35)" },
];

const BADGE_COLORS = {
  "oferta":      { bg: "#f5a524", color: "#fff" },
  "nuevo":       { bg: "#10b981", color: "#fff" },
  "mas vendido": { bg: "#d63384", color: "#fff" },
};

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

/* ── MachineRow: own scroll-reveal so each row animates independently ── */
function MachineRow({ machine, index, palette, badgeStyle }) {
  const [wrapRef, isVisible] = useScrollReveal({ rootMargin: "0px 0px -80px 0px" });
  const isRight = index % 2 !== 0;
  const num     = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={wrapRef}
      className={[
        "eq-row",
        isRight   ? "eq-row--right"   : "eq-row--left",
        isVisible ? "eq-row--visible" : "",
      ].join(" ")}
    >
      <Link
        to={`/equipos/${machine.id}`}
        className="eq-row-inner"
        aria-label={`Ver detalle: ${machine.nombre}`}
      >
        {/* ── Image panel ── */}
        <div className="eq-row-img-panel" style={{ background: palette.gradient }}>
          <div className="eq-row-orb" style={{ background: palette.orb }} />
          <span className="eq-row-num-bg" aria-hidden="true">{num}</span>
          {machine.imagenURL ? (
            <img src={machine.imagenURL} alt={machine.nombre} className="eq-row-img" />
          ) : (
            <span className="eq-row-placeholder" aria-hidden="true">🤖</span>
          )}
          {badgeStyle && machine.badge && (
            <span
              className="eq-row-badge"
              style={{ background: badgeStyle.bg, color: badgeStyle.color }}
            >
              {machine.badge}
            </span>
          )}
        </div>

        {/* ── Info panel ── */}
        <div className="eq-row-info">
          <span className="eq-row-index" aria-hidden="true">{num}</span>
          {machine.categoria && (
            <span className="eq-row-cat">{machine.categoria}</span>
          )}
          <h2 className="eq-row-name">{machine.nombre}</h2>
          <div className="eq-row-divider" />
          {machine.descripcion && (
            <p className="eq-row-desc">{machine.descripcion}</p>
          )}
          {machine.tags?.length > 0 && (
            <div className="eq-row-tags">
              {machine.tags.map((tag) => (
                <span key={tag} className="eq-row-tag">{tag}</span>
              ))}
            </div>
          )}
          <span className="eq-row-cta">
            Ver modelo completo <ArrowIcon />
          </span>
        </div>
      </Link>
    </div>
  );
}

/* ── Page ── */
export default function Equipos() {
  const [machines, setMachines]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [ctaRef, ctaVisible]                = useScrollReveal({ rootMargin: "0px 0px -40px 0px" });

  useEffect(() => {
    getMaquinas()
      .then(setMachines)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ["Todos", ...new Set(machines.map((m) => m.categoria).filter(Boolean))];
  const filtered   = activeCategory === "Todos"
    ? machines
    : machines.filter((m) => m.categoria === activeCategory);

  return (
    <>
      <PageHero
        badge="CATÁLOGO"
        title={<>Nuestros <span className="ph-gradient-text">Equipos</span></>}
        description="Máquinas de última generación para emprendedores y eventos. Elegí el modelo que mejor se adapta a tu negocio."
      />

      <section className="eq-section">
        <Container>

          {/* Filter tabs */}
          {categories.length > 2 && (
            <div className="eq-filters" role="group" aria-label="Filtrar por categoría">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`eq-filter-btn${activeCategory === cat ? " active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="text-center py-5">
              <Spinner style={{ color: "var(--cv-gold)" }} />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <p className="eq-empty">No hay equipos disponibles todavía.</p>
          )}

          {!loading && filtered.length > 0 && (
            <div className="eq-list">
              {filtered.map((m, idx) => {
                const palette    = GRADIENTS[idx % GRADIENTS.length];
                const badgeKey   = m.badge?.toLowerCase();
                const badgeStyle = badgeKey
                  ? (BADGE_COLORS[badgeKey] ?? { bg: "rgba(0,0,0,0.55)", color: "#fff" })
                  : null;

                return (
                  <MachineRow
                    key={m.id}
                    machine={m}
                    index={idx}
                    palette={palette}
                    badgeStyle={badgeStyle}
                  />
                );
              })}
            </div>
          )}

        </Container>
      </section>

      {/* ── Bottom CTA ── */}
      {!loading && (
        <section className="eq-cta-strip">
          <Container>
            <div
              ref={ctaRef}
              className={`eq-cta-inner${ctaVisible ? " eq-cta-inner--visible" : ""}`}
            >
              <div className="eq-cta-copy">
                <p className="eq-cta-title">¿No encontrás lo que buscás?</p>
                <p className="eq-cta-sub">Hablemos y te asesoramos para encontrar la solución ideal para tu negocio.</p>
              </div>
              <a
                href="https://wa.me/5492612318259"
                target="_blank"
                rel="noreferrer"
                className="eq-cta-btn"
              >
                <WhatsAppIcon />
                Consultar por WhatsApp
              </a>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
