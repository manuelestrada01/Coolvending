import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  getParticipantes,
  sortearGanadorPremio,
  guardarGanadoresPremios,
} from "../../services/firebase/sorteosService";
import "./SorteoVivo.css";

gsap.registerPlugin(useGSAP);

const TROPHY = ["🥇", "🥈", "🥉", "🏅", "🎖️"];
const ORDINALS = ["1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°"];
const CONFETTI_COLORS = ["#d63384", "#f5a524", "#e040fb", "#ffffff", "#ffd700", "#00e5ff"];

const CONFETTI_DATA = Array.from({ length: 44 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  w: 5 + (i % 10),
  h: i % 5 === 0 ? 14 + (i % 8) : 5 + (i % 10),
  round: i % 5 !== 0,
}));

export default function SorteoVivo({ config, onClose }) {
  const premios = (config.premios || []).filter((p) => p.descripcion);

  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [premioIdx, setPremioIdx] = useState(0);
  const [fase, setFase] = useState("idle"); // idle | sorteando | revelado | completo
  const [ganadorActual, setGanadorActual] = useState(null);
  const [confirmados, setConfirmados] = useState({});
  const [saltados, setSaltados] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const overlayRef = useRef(null);
  const stageRef = useRef(null);
  const drumRef = useRef(null);       // slot machine text — DOM-managed
  const winnerRef = useRef(null);     // winner name element — React-managed
  const ctasRef = useRef(null);
  const confettiRef = useRef(null);
  const drumTimerRef = useRef(null);
  const sidebarRef = useRef(null);

  // ─── Load participants ───────────────────────────────────────────
  useEffect(() => {
    getParticipantes("aprobado")
      .then((p) => {
        setParticipantes(p);
        if (drumRef.current) drumRef.current.textContent = "— — —";
      })
      .finally(() => setLoading(false));

    return () => {
      if (drumTimerRef.current) clearTimeout(drumTimerRef.current);
    };
  }, []);

  // ─── Entrance animation ──────────────────────────────────────────
  useGSAP(
    () => {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        stageRef.current,
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, delay: 0.2, ease: "back.out(1.3)" }
      );
      gsap.fromTo(
        sidebarRef.current,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, delay: 0.35, ease: "power3.out" }
      );
    },
    { scope: overlayRef, dependencies: [] }
  );

  // ─── Phase-change animations ─────────────────────────────────────
  useEffect(() => {
    if (fase === "revelado") {
      // Winner name reveal
      if (winnerRef.current) {
        gsap.fromTo(
          winnerRef.current,
          { scale: 0.4, opacity: 0, filter: "blur(20px)", y: 20 },
          { scale: 1, opacity: 1, filter: "blur(0px)", y: 0, duration: 0.9, ease: "back.out(1.8)" }
        );
      }
      // CTAs entrance
      if (ctasRef.current) {
        gsap.fromTo(
          ctasRef.current,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, delay: 0.55, ease: "power3.out" }
        );
      }
      // Confetti burst
      setTimeout(() => launchConfetti(), 350);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  // ─── Drum roll helpers ───────────────────────────────────────────
  const setDrumText = useCallback((text) => {
    if (!drumRef.current) return;
    drumRef.current.textContent = text;
    gsap.fromTo(
      drumRef.current,
      { y: 16, opacity: 0.3, filter: "blur(3px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.09, ease: "power2.out", overwrite: true }
    );
  }, []);

  const stopDrum = useCallback(() => {
    if (drumTimerRef.current) {
      clearTimeout(drumTimerRef.current);
      drumTimerRef.current = null;
    }
  }, []);

  // ─── Confetti ────────────────────────────────────────────────────
  const launchConfetti = useCallback(() => {
    if (!confettiRef.current) return;
    const particles = confettiRef.current.querySelectorAll(".sv-particle");
    gsap.set(particles, { x: 0, y: 0, opacity: 1, scale: 1, rotation: 0 });
    particles.forEach((p) => {
      const angle = Math.random() * 360;
      const dist = 90 + Math.random() * 200;
      const vx = Math.cos((angle * Math.PI) / 180) * dist;
      const vy = Math.sin((angle * Math.PI) / 180) * dist - 80;
      gsap.to(p, {
        x: vx,
        y: vy,
        opacity: 0,
        scale: 0.1,
        rotation: Math.random() * 720 - 360,
        duration: 1.1 + Math.random() * 0.7,
        ease: "power2.out",
        delay: Math.random() * 0.18,
      });
    });
  }, []);

  // ─── Core actions ────────────────────────────────────────────────
  const handleSortear = async () => {
    if (fase !== "idle" || loading) return;
    setError(null);

    const confirmedIds = Object.values(confirmados).map((g) => g.id);
    const excludedIds = [...confirmedIds, ...saltados];
    const elegibles = participantes.filter((p) => !excludedIds.includes(p.id));

    if (elegibles.length === 0) {
      setError("No hay participantes elegibles para este premio.");
      return;
    }

    setFase("sorteando");
    const names = participantes.map((p) => p.nombre);

    // Start drum roll
    let speed = 52;
    const cycle = () => {
      setDrumText(names[Math.floor(Math.random() * names.length)]);
      speed = Math.min(speed * 1.062, 400);
      drumTimerRef.current = setTimeout(cycle, speed);
    };
    cycle();

    try {
      const winner = await sortearGanadorPremio(excludedIds);

      // Let drum roll run 2.2s more, then reveal
      setTimeout(() => {
        stopDrum();
        // Fade out drum display
        gsap.to(drumRef.current, {
          opacity: 0,
          scale: 0.85,
          duration: 0.25,
          ease: "power2.in",
        });
        setGanadorActual(winner);
        setFase("revelado"); // triggers useEffect above
      }, 2200);
    } catch (err) {
      stopDrum();
      setFase("idle");
      setError(err.message || "Error al sortear.");
    }
  };

  const handleConfirmar = async () => {
    if (!ganadorActual || saving) return;
    const premio = premios[premioIdx];
    const nuevos = {
      ...confirmados,
      [premio.lugar]: { nombre: ganadorActual.nombre, id: ganadorActual.id },
    };
    setConfirmados(nuevos);
    setSaltados([]);
    setSaving(true);

    try {
      await guardarGanadoresPremios(
        Object.entries(nuevos).map(([lugar, g]) => ({
          lugar: Number(lugar),
          nombre: g.nombre,
        }))
      );
    } catch {
      // best effort
    } finally {
      setSaving(false);
    }

    const pendientes = premios.filter((p) => !nuevos[p.lugar]);
    if (pendientes.length === 0) {
      setFase("completo");
      setGanadorActual(null);
      return;
    }

    const nextIdx = premios.findIndex((p) => !nuevos[p.lugar]);
    setGanadorActual(null);
    setFase("idle");
    if (nextIdx >= 0) setPremioIdx(nextIdx);
    if (drumRef.current) {
      drumRef.current.textContent = "— — —";
      gsap.set(drumRef.current, { opacity: 1, scale: 1 });
    }
  };

  const handleResortear = () => {
    if (!ganadorActual) return;
    setSaltados((prev) => [...prev, ganadorActual.id]);
    setGanadorActual(null);
    setFase("idle");
    if (drumRef.current) {
      drumRef.current.textContent = "— — —";
      gsap.fromTo(
        drumRef.current,
        { opacity: 0.4, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.4)" }
      );
    }
  };

  const handleSelectPremio = (idx) => {
    if (fase === "sorteando" || fase === "revelado") return;
    setPremioIdx(idx);
    setSaltados([]);
    setGanadorActual(null);
    setError(null);
    if (drumRef.current) {
      drumRef.current.textContent = "— — —";
      gsap.set(drumRef.current, { opacity: 1, scale: 1 });
    }
  };

  const handleClose = () => {
    stopDrum();
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  // ─── Derived values ──────────────────────────────────────────────
  const premioCurrent = premios[premioIdx];
  const confirmedIds = Object.values(confirmados).map((g) => g.id);
  const excludedTotal = [...confirmedIds, ...saltados];
  const eligiblesCount = participantes.filter((p) => !excludedTotal.includes(p.id)).length;
  const premiosCompletados = Object.keys(confirmados).length;

  return (
    <div className="sv-overlay" ref={overlayRef}>
      {/* ── Background ── */}
      <div className="sv-bg" aria-hidden="true">
        <div className="sv-bg-orb sv-bg-orb--1" />
        <div className="sv-bg-orb sv-bg-orb--2" />
        <div className="sv-bg-orb sv-bg-orb--3" />
        <div className="sv-scanlines" />
      </div>

      {/* ── Header ── */}
      <header className="sv-header">
        <button className="sv-back-btn" onClick={handleClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Salir
        </button>

        <div className="sv-header-center">
          <span className="sv-header-icon">🎲</span>
          <h1 className="sv-header-title">{config.titulo || "Sorteo en Vivo"}</h1>
        </div>

        <div className="sv-header-right">
          <div className="sv-live-badge">
            <span className="sv-live-dot" />
            EN VIVO
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="sv-body">

        {/* ───────── Stage ───────── */}
        <main className="sv-stage" ref={stageRef}>
          {fase === "completo" ? (
            <div className="sv-completo">
              <div className="sv-completo-trophy">🏆</div>
              <h2 className="sv-completo-title">¡Sorteo Completo!</h2>
              <p className="sv-completo-sub">Todos los premios fueron entregados.</p>
              <div className="sv-completo-list">
                {Object.entries(confirmados)
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([lugar, g]) => {
                    const idx = premios.findIndex((p) => p.lugar === Number(lugar));
                    return (
                      <div key={lugar} className="sv-completo-item">
                        <span>{TROPHY[idx] || "🏅"}</span>
                        <span className="sv-completo-item-nombre">{g.nombre}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <>
              {/* Current prize header */}
              <div className="sv-current-premio">
                {premioCurrent ? (
                  <>
                    <span className="sv-current-trophy">{TROPHY[premioIdx] || "🏅"}</span>
                    <div className="sv-current-info">
                      <span className="sv-current-lugar">
                        {ORDINALS[premioIdx] || `${premioIdx + 1}°`} lugar
                      </span>
                      <span className="sv-current-nombre">{premioCurrent.descripcion}</span>
                    </div>
                    {saltados.length > 0 && (
                      <span className="sv-resorteo-badge">
                        Re-sorteo #{saltados.length}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="sv-no-premio">Seleccioná un premio del panel</span>
                )}
              </div>

              {/* Drum stage */}
              <div className="sv-drum-stage">
                <div className={`sv-drum-label ${fase === "revelado" ? "sv-drum-label--winner" : ""}`}>
                  {fase === "idle" && "LISTO PARA SORTEAR"}
                  {fase === "sorteando" && "SORTEANDO..."}
                  {fase === "revelado" && "🎉 GANADOR"}
                </div>

                {/* Slot machine display */}
                <div className="sv-slot-wrap">
                  {/* Direct-DOM drum display — hidden when winner revealed */}
                  <div
                    className={`sv-drum-display${fase === "revelado" ? " sv-drum-display--hidden" : ""}${fase === "sorteando" ? " sv-drum-display--rolling" : ""}`}
                    ref={drumRef}
                  />

                  {/* Winner name — React-controlled, mounted only when revelado */}
                  {fase === "revelado" && ganadorActual && (
                    <div className="sv-winner-block" ref={winnerRef}>
                      <div className="sv-winner-name">
                        {ganadorActual.nombre}
                      </div>
                      {ganadorActual.instagram && (
                        <div className="sv-winner-instagram">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                            <circle cx="12" cy="12" r="4"/>
                            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                          </svg>
                          {ganadorActual.instagram.startsWith("@") ? ganadorActual.instagram : `@${ganadorActual.instagram}`}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {fase === "revelado" && (
                  <div className="sv-verified-tag">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Participante verificado · Premio: {premioCurrent?.descripcion}
                  </div>
                )}

                {/* Confetti origin */}
                <div className="sv-confetti-origin" ref={confettiRef} aria-hidden="true">
                  {CONFETTI_DATA.map((c) => (
                    <div
                      key={c.id}
                      className="sv-particle"
                      style={{
                        background: c.color,
                        width: c.w,
                        height: c.h,
                        borderRadius: c.round ? "50%" : "3px",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="sv-actions">
                {fase === "idle" && (
                  <button
                    className="sv-btn-sortear"
                    onClick={handleSortear}
                    disabled={loading || !premioCurrent || eligiblesCount === 0}
                  >
                    <span className="sv-btn-sortear-icon">🎲</span>
                    <span className="sv-btn-sortear-label">SORTEAR</span>
                    <span className="sv-btn-sortear-sub">
                      {loading
                        ? "Cargando..."
                        : eligiblesCount === 0
                        ? "Sin participantes elegibles"
                        : `${eligiblesCount} participante${eligiblesCount !== 1 ? "s" : ""} elegible${eligiblesCount !== 1 ? "s" : ""}`}
                    </span>
                  </button>
                )}

                {fase === "sorteando" && (
                  <div className="sv-sorteando-state">
                    <div className="sv-pulse-ring" />
                    <div className="sv-pulse-ring sv-pulse-ring--2" />
                    <span className="sv-sorteando-text">
                      Eligiendo entre {eligiblesCount} participantes...
                    </span>
                  </div>
                )}

                {fase === "revelado" && (
                  <div className="sv-revelado-actions" ref={ctasRef}>
                    <button
                      className="sv-btn-confirmar"
                      onClick={handleConfirmar}
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="sv-saving-spinner" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      Confirmar ganador
                    </button>
                    <button
                      className="sv-btn-resortear"
                      onClick={handleResortear}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                      </svg>
                      Re-sortear
                      <span className="sv-resortear-hint">ganador no disponible</span>
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="sv-error-toast">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                  <button className="sv-error-close" onClick={() => setError(null)}>×</button>
                </div>
              )}
            </>
          )}
        </main>

        {/* ───────── Sidebar ───────── */}
        <aside className="sv-sidebar" ref={sidebarRef}>

          {/* Stats bar */}
          <div className="sv-stats-bar">
            <div className="sv-stat-item">
              <span className="sv-stat-val">{participantes.length}</span>
              <span className="sv-stat-lbl">Participantes</span>
            </div>
            <div className="sv-stat-divider" />
            <div className="sv-stat-item">
              <span className="sv-stat-val" style={{ color: "#10b981" }}>{premiosCompletados}</span>
              <span className="sv-stat-lbl">Entregados</span>
            </div>
            <div className="sv-stat-divider" />
            <div className="sv-stat-item">
              <span className="sv-stat-val" style={{ color: "#f5a524" }}>{premios.length - premiosCompletados}</span>
              <span className="sv-stat-lbl">Pendientes</span>
            </div>
          </div>

          {/* Premio selector */}
          <div className="sv-sidebar-block">
            <div className="sv-sidebar-heading">PREMIOS</div>
            <div className="sv-premios-list">
              {premios.map((p, i) => {
                const isDone = !!confirmados[p.lugar];
                const isActive = i === premioIdx && fase !== "completo";
                const ganador = confirmados[p.lugar];
                return (
                  <button
                    key={p.lugar}
                    className={`sv-premio-row${isActive ? " sv-premio-row--active" : ""}${isDone ? " sv-premio-row--done" : ""}`}
                    onClick={() => handleSelectPremio(i)}
                    disabled={fase === "sorteando" || fase === "revelado"}
                    title={isDone ? `Ganador: ${ganador?.nombre}` : undefined}
                  >
                    <span className="sv-premio-row-trophy">{TROPHY[i] || "🏅"}</span>
                    <div className="sv-premio-row-info">
                      <span className="sv-premio-row-lugar">{ORDINALS[i] || `${i+1}°`}</span>
                      <span className="sv-premio-row-desc">{p.descripcion}</span>
                      {isDone && ganador && (
                        <span className="sv-premio-row-winner">{ganador.nombre}</span>
                      )}
                    </div>
                    <span className={`sv-premio-row-status${isDone ? " sv-premio-row-status--done" : isActive ? " sv-premio-row-status--active" : ""}`}>
                      {isDone ? "✓" : isActive ? "›" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Winners log */}
          {premiosCompletados > 0 && (
            <div className="sv-sidebar-block sv-sidebar-block--winners">
              <div className="sv-sidebar-heading">GANADORES</div>
              <div className="sv-winners-list">
                {Object.entries(confirmados)
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([lugar, g]) => {
                    const idx = premios.findIndex((p) => p.lugar === Number(lugar));
                    return (
                      <div key={lugar} className="sv-winner-row">
                        <span className="sv-winner-row-trophy">{TROPHY[idx] || "🏅"}</span>
                        <div className="sv-winner-row-info">
                          <span className="sv-winner-row-lugar">{ORDINALS[idx] || `${lugar}°`}</span>
                          <span className="sv-winner-row-nombre">{g.nombre}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
