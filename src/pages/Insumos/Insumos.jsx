import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useScrollReveal } from "../../shared/utils/useScrollReveal";
import { useAuth } from "../../shared/utils/AuthContext";
import { getInsumos } from "../../services/firebase/insumosService";
import PageHero from "../../shared/layout/PageHero";
import "./Insumos.css";

const TAG_STYLES = {
  "Algodón de azúcar": { color: "#d63384", softBg: "#fdf0f7", icon: "🍬" },
  "Pochoclos":         { color: "#f5a524", softBg: "#fffbf0", icon: "🍿" },
  "Ambas":             { color: "#8b5cf6", softBg: "#f5f0ff", icon: "✨" },
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

export default function Insumos() {
  const { puedeVerPrecios, isAdmin } = useAuth();
  const canSeePrice = isAdmin || puedeVerPrecios;

  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [gridRef, gridVisibleRaw] = useScrollReveal({ rootMargin: "0px 0px -60px 0px" });
  const [ctaRef, ctaVisibleRaw] = useScrollReveal({ rootMargin: "0px 0px -40px 0px" });

  // Latch: once visible, never go back to hidden
  const [gridVisible, setGridVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  useEffect(() => { if (gridVisibleRaw) setGridVisible(true); }, [gridVisibleRaw]);
  useEffect(() => { if (ctaVisibleRaw) setCtaVisible(true); }, [ctaVisibleRaw]);

  useEffect(() => {
    getInsumos()
      .then(setInsumos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <PageHero
        title={<>Todo lo que necesitás<br /><span className="ph-gradient-text">para operar sin parar</span></>}
        description="Proveemos los insumos específicos para cada máquina: calidad garantizada, stock constante y entrega ágil para que tu negocio nunca se detenga."
      />

      {/* ── Cards grid ── */}
      <section className="ins-section">
        <Container>
          <div className="text-center ins-reveal ins-reveal--visible" ref={gridRef}>
            <h2 className="ins-section-title">Nuestros insumos</h2>
            <p className="ins-section-sub">
              Seleccionados y probados en nuestras propias máquinas.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner style={{ color: "var(--cv-gold)" }} />
            </div>
          ) : insumos.length === 0 ? (
            <p className="text-center" style={{ color: "var(--cv-text-secondary)" }}>
              Próximamente disponible.
            </p>
          ) : (
            <div className="ins-cards-grid">
              {insumos.map((item, i) => {
                const tagStyle = TAG_STYLES[item.maquina] ?? TAG_STYLES["Ambas"];
                const price = formatPrice(item.precio);
                return (
                  <Link
                    key={item.id}
                    to={`/insumos/${item.id}`}
                    className={`ins-card ins-card-reveal${gridVisible ? " ins-reveal--visible" : ""}`}
                    style={{ "--accent": tagStyle.color, animationDelay: gridVisible ? `${i * 0.08}s` : "0s" }}
                  >
                    {item.imagenURL ? (
                      <img src={item.imagenURL} alt={item.nombre} className="ins-card-img" loading="lazy" />
                    ) : (
                      <div className="ins-card-img ins-card-img--placeholder">
                        <span aria-hidden="true">{tagStyle.icon}</span>
                      </div>
                    )}
                    <div className="ins-card-overlay">
                      <span
                        className="ins-card-tag"
                        style={{ color: tagStyle.color, borderColor: tagStyle.color, background: tagStyle.softBg }}
                      >
                        {item.maquina}
                      </span>
                      <p className="ins-card-name">{item.nombre}</p>
                      {price && (
                        canSeePrice
                          ? <p className="ins-card-price">{price}</p>
                          : <span className="ins-price-lock">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                              Ver precio
                            </span>
                      )}
                    </div>
                    <div className="ins-card-cta" aria-hidden="true">Ver detalle →</div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── CTA ── */}
          <div
            className={`ins-cta ins-reveal${ctaVisible ? " ins-reveal--visible" : ""}`}
            ref={ctaRef}
          >
            <p className="ins-cta-title">¿Necesitás reponer insumos?</p>
            <p className="ins-cta-desc">
              Contactanos y te asesoramos sobre cantidades, precios y tiempos de entrega.
            </p>
            <a href="/contacto" className="ins-cta-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Contactar
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
