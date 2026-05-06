import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { useScrollReveal } from "../../shared/utils/useScrollReveal";
import {
  getSorteoConfig,
  registrarParticipante,
} from "../../services/firebase/sorteosService";
import PageHero from "../../shared/layout/PageHero";
import trophyGold from "../../app/assets/images/trophy-gold.png";
import trophySilver from "../../app/assets/images/trophy-silver.png";
import trophyBronze from "../../app/assets/images/trophy-bronze.png";
import "./Sorteos.css";

const TROPHY_BY_LUGAR = { 1: trophyGold, 2: trophySilver, 3: trophyBronze };

/* ─── RoadmapRow ────────────────────────────────────────── */
function RoadmapRow({ number, title, desc, side, delay, link, linkLabel }) {
  const [ref, visible] = useScrollReveal();
  const isRight = side === "right";

  const card = (
    <div className="srt-rm-card" style={{ transitionDelay: `${delay}ms` }}>
      <span className="srt-rm-card__num">Paso {String(number).padStart(2, "0")}</span>
      <p className="srt-rm-card__title">{title}</p>
      <p className="srt-rm-card__desc">{desc}</p>
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" className="srt-rm-card__link">
          {linkLabel || link}
        </a>
      )}
    </div>
  );

  const node = (
    <div className="srt-rm-node-wrap">
      <div className="srt-rm-node" style={{ transitionDelay: `${delay + 120}ms` }}>
        {number}
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className={`srt-rm-row srt-rm-row--${side}${visible ? " visible" : ""}`}
    >
      {isRight ? (
        <>
          <div className="srt-rm-spacer" />
          {node}
          {card}
        </>
      ) : (
        <>
          {card}
          {node}
          <div className="srt-rm-spacer" />
        </>
      )}
    </div>
  );
}

/* ─── PodiumSection ──────────────────────────────────── */
const MEDAL = {
  1: { label: "Oro",    colors: ["#F9E04B", "#C8960C"], glow: "rgba(200,150,12,0.45)",  step: 180 },
  2: { label: "Plata",  colors: ["#E8E8E8", "#9E9E9E"], glow: "rgba(158,158,158,0.35)", step: 130 },
  3: { label: "Bronce", colors: ["#E8A96A", "#8B5E27"], glow: "rgba(139,94,39,0.35)",   step: 96  },
};

function PodiumCard({ lugar, descripcion, detalle, imagen, delay, onClick }) {
  const [ref, visible] = useScrollReveal();
  const medal = MEDAL[lugar];
  const isFirst = lugar === 1;
  const clickable = !!(descripcion || imagen || detalle);
  const rankClass = lugar === 1 ? "first" : lugar === 2 ? "second" : "third";

  return (
    <div
      ref={ref}
      className={`srt-pod srt-pod--${rankClass}${visible ? " visible" : ""}${clickable ? " srt-pod--clickable" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {/* Trophy floating above card */}
      {TROPHY_BY_LUGAR[lugar] && (
        <img src={TROPHY_BY_LUGAR[lugar]} alt={medal.label} className="srt-pod__trophy" />
      )}

      {/* Card */}
      <div className={`srt-pod__card srt-pod__card--${rankClass}`}>

        {isFirst && (
          <div className="srt-pod__principal">
            <span>✦</span> Premio principal <span>✦</span>
          </div>
        )}

        {/* Image */}
        <div className="srt-pod__img-wrap">
          {imagen ? (
            <img src={imagen} alt={descripcion} className="srt-pod__img" />
          ) : (
            <div
              className="srt-pod__img-placeholder"
              style={{ background: `linear-gradient(135deg, ${medal.colors[0]}33, ${medal.colors[1]}66)` }}
            />
          )}
        </div>

        {/* Text */}
        <div className="srt-pod__desc">
          {descripcion || <span className="srt-pod__tbd">Por definir</span>}
        </div>
        {detalle && <div className="srt-pod__detalle">{detalle}</div>}
      </div>
    </div>
  );
}

function PodiumSection({ premios }) {
  const [ref, visible] = useScrollReveal();
  const [selected, setSelected] = useState(null);

  if (!premios?.some((p) => p.descripcion)) return null;

  const sorted = [...premios].sort((a, b) => a.lugar - b.lugar);
  const top3 = [
    sorted.find((p) => p.lugar === 2),
    sorted.find((p) => p.lugar === 1),
    sorted.find((p) => p.lugar === 3),
  ].filter(Boolean);
  const delays = { 1: 80, 2: 0, 3: 160 };

  return (
    <section className="srt-podium-section">
      <Container>
        <div ref={ref} className={`srt-podium-header${visible ? " visible" : ""}`}>
          <p className="srt-section-eyebrow text-center">Premios</p>
          <h2 className="srt-section-title text-center">Lo que te podés llevar</h2>
          <p className="srt-podium-subtitle text-center">Participá y llevate uno de estos increíbles premios.</p>
          {/* Sparkle decorations */}
          <span className="srt-spark srt-spark--1">✦</span>
          <span className="srt-spark srt-spark--2">✦</span>
          <span className="srt-spark srt-spark--3">✦</span>
          <span className="srt-spark srt-spark--4">✦</span>
        </div>

        <div className="srt-pod-row">
          {top3.map((p) => (
            <PodiumCard
              key={p.lugar}
              lugar={p.lugar}
              descripcion={p.descripcion}
              detalle={p.detalle}
              imagen={p.imagen}
              delay={delays[p.lugar] || 0}
              onClick={() => setSelected(p)}
            />
          ))}
        </div>
      </Container>

      {selected && (
        <div className="srt-prize-overlay" onClick={() => setSelected(null)}>
          <div className="srt-prize-modal" onClick={(e) => e.stopPropagation()}>
            <button className="srt-prize-close" onClick={() => setSelected(null)} aria-label="Cerrar">✕</button>

            {selected.imagen && (
              <div className="srt-prize-modal__imgwrap">
                <img src={selected.imagen} alt={selected.descripcion} className="srt-prize-modal__img" />
              </div>
            )}

            <div className="srt-prize-modal__body">
              {selected.descripcion && (
                <div className="srt-prize-modal__name">{selected.descripcion}</div>
              )}

              {selected.detalle && (
                <p className="srt-prize-modal__detalle">{selected.detalle}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Main ───────────────────────────────────────────── */
export default function Sorteos() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState("");
  const [operacionId, setOperacionId] = useState("");
  const [telefono, setTelefono] = useState("");
  const [instagram, setInstagram] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const cfg = await getSorteoConfig();
      setConfig(cfg);
    } catch {
      // config fetch failed
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registrarParticipante({ nombre, operacionId, telefono, instagram });
      setSuccess(operacionId.trim());
      setNombre("");
      setOperacionId("");
      setTelefono("");
      setInstagram("");
      cargar();
    } catch (err) {
      setError(err?.message || "Error al registrar. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <Spinner animation="border" style={{ color: "#d63384" }} />
      </div>
    );
  }

  const activo = config?.activo ?? false;
  const ganador = config?.ganador ?? null;
  const titulo = config?.titulo || "Sorteo CoolVending";

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("es-AR", {
          day: "2-digit", month: "long", year: "numeric",
        })
      : null;

  return (
    <>
      {/* ─── Hero ──────────────────────────────────────── */}
      <PageHero
        badge={activo ? "Sorteo activo" : "Próximamente"}
        title={<><span className="ph-gradient-text">{titulo}</span></>}
        description="Verificamos tu pago en MercadoPago automáticamente. Cada compra es un número de sorteo."
      />

      {/* ─── Roadmap + Form (two columns) ──────────────── */}
      <section className="srt-steps">
        <Container>
          <Row className="g-5 align-items-start">

            {/* LEFT — Roadmap */}
            <Col lg={6}>
              <div className="mb-4">
                <p className="srt-section-eyebrow">Participación</p>
                <h2 className="srt-section-title">¿Cómo participar?</h2>
              </div>
              <div className="srt-roadmap">
                <svg
                  className="srt-roadmap-snake"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="srtSnakeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d63384" />
                      <stop offset="100%" stopColor="#f5a524" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 50,0 C 50,8 39,8 39,17 C 39,26 61,41 61,50 C 61,59 39,74 39,83 C 39,92 50,100 50,100"
                    fill="none"
                    stroke="url(#srtSnakeGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <RoadmapRow number={1} title="Realizá una compra" desc="Hacé una transferencia por MercadoPago a Coolvending y guardá el comprobante." side="right" delay={0} />
                <RoadmapRow number={2} title="Ingresá tu número" desc="Copiá el número de operación de tu comprobante e ingresalo en el formulario." side="left" delay={150} />
                <RoadmapRow number={3} title="Seguinos en Instagram" desc="Seguí nuestra cuenta para no perderte el sorteo en vivo y enterarte del ganador." side="right" delay={300} link="https://www.instagram.com/coolvending.ar?igsh=azN0OTl5dDFpOHM2" linkLabel="@coolvending.ar" />
                <RoadmapRow number={4} title="¡Esperá el sorteo!" desc="Verificamos tu pago automáticamente. Podés participar múltiples veces con distintas compras." side="left" delay={450} />
              </div>
            </Col>

            {/* RIGHT — Form */}
            <Col lg={6}>
              {/* Winner banner */}
              {ganador && (
                <div className="srt-winner-card mb-4">
                  <span className="srt-winner-emoji">🎉</span>
                  <div className="srt-winner-label">Ganador del sorteo</div>
                  <div className="srt-winner-name">{ganador.nombre}</div>
                  <div className="srt-winner-op">Op. #{ganador.operacionId}</div>
                </div>
              )}
              {!activo ? (
                <div className="srt-closed">
                  <span className="srt-closed-icon">🔒</span>
                  <h2>Sorteo no disponible</h2>
                  <p>En este momento no hay un sorteo activo. ¡Seguinos para enterarte del próximo!</p>
                </div>
              ) : success ? (
                <div className="srt-form-card">
                  <div className="srt-success">
                    <div className="srt-success-ring">🎊</div>
                    <h4 className="srt-success-title">¡Estás participando!</h4>
                    <p className="srt-success-text">
                      Tu número de operación fue verificado y registrado correctamente.
                    </p>
                    <div className="srt-success-num">#{success}</div>
                    <button className="srt-success-back" onClick={() => setSuccess(null)}>
                      Registrar otra participación
                    </button>
                  </div>
                </div>
              ) : (
                <div className="srt-form-card">
                  <div className="srt-form-header">
                    <p className="srt-form-header-title">Registrá tu participación</p>
                    <p className="srt-form-header-sub">
                      Ingresá tu nombre y el número de operación del comprobante de MercadoPago.
                    </p>
                  </div>

                  {/* ─── Dates strip ─── */}
                  {(config?.fechaInicio || config?.fechaFin || config?.linkVivo) && (
                    <div className="srt-dates-strip">
                      {config.fechaInicio && (
                        <div className="srt-dates-item">
                          <span className="srt-dates-label">Inicio</span>
                          <span className="srt-dates-value">{fmtDate(config.fechaInicio)}</span>
                        </div>
                      )}
                      {config.fechaInicio && config.fechaFin && (
                        <div className="srt-dates-arrow">→</div>
                      )}
                      {config.fechaFin && (
                        <div className="srt-dates-item">
                          <span className="srt-dates-label">Cierre</span>
                          <span className="srt-dates-value">{fmtDate(config.fechaFin)}</span>
                        </div>
                      )}
                      {config.linkVivo && (
                        <a
                          href={config.linkVivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="srt-dates-live"
                        >
                          <span className="srt-dates-live-dot" />
                          Ver el vivo
                        </a>
                      )}
                    </div>
                  )}

                  <div className="srt-form-body">
                    {error && <div className="srt-alert-err">{error}</div>}
                    <form onSubmit={handleSubmit}>
                      <div className="srt-field mb-4">
                        <label className="srt-label">Tu nombre completo</label>
                        <input
                          type="text"
                          className="srt-input"
                          placeholder="Ej: Juan Pérez"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          required
                          maxLength={80}
                          disabled={submitting}
                        />
                      </div>
                      <div className="srt-field mb-4">
                        <label className="srt-label">Número de teléfono</label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          className="srt-input"
                          placeholder="Ej: 1123456789"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                          required
                          maxLength={20}
                          disabled={submitting}
                        />
                      </div>
                      <div className="srt-field mb-4">
                        <label className="srt-label">Usuario de Instagram</label>
                        <input
                          type="text"
                          className="srt-input"
                          placeholder="Ej: @coolvending.ar"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          required
                          maxLength={50}
                          disabled={submitting}
                        />
                      </div>
                      <div className="srt-field mb-5">
                        <label className="srt-label">Número de operación MercadoPago</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="srt-input"
                          placeholder="Ej: 156552343565"
                          value={operacionId}
                          onChange={(e) => setOperacionId(e.target.value.replace(/\D/g, ""))}
                          required
                          maxLength={20}
                          disabled={submitting}
                        />
                        <p className="srt-hint">
                          Lo encontrás en tu comprobante, bajo "Número de operación de Mercado Pago".
                        </p>
                      </div>
                      <button type="submit" className="srt-submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Spinner animation="border" size="sm" />
                            Verificando pago...
                          </>
                        ) : (
                          "Participar en el sorteo →"
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* ─── Premios (below) ───────────────────────────── */}
      <PodiumSection premios={config?.premios} />
    </>
  );
}
