import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { getSorteoConfig } from "../../services/firebase/sorteosService";
import heroImg from "../../app/assets/images/sorteo-popup.png";
import trophyGold from "../../app/assets/images/trophy-gold.png";
import trophySilver from "../../app/assets/images/trophy-silver.png";
import trophyBronze from "../../app/assets/images/trophy-bronze.png";
import "./SorteoPopup.css";

gsap.registerPlugin(useGSAP);

const TROPHY_IMGS = { gold: trophyGold, silver: trophySilver, bronze: trophyBronze };
const ORDINALS = ["1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°"];
const VARIANTS = ["gold", "silver", "bronze"];

function PodiumCard({ premio, index, refCallback }) {
  const isFirst = index === 0;
  const variant = VARIANTS[index] ?? "bronze";
  const rankLabel = index === 0 ? "first" : index === 1 ? "second" : "third";

  return (
    <div className={`sp-podium-wrapper sp-podium-wrapper--${rankLabel}`}>
      <div className="sp-podium-trophy">
        <img
          src={TROPHY_IMGS[variant]}
          alt={`${variant} trophy`}
          className={`sp-trophy sp-trophy--${variant}`}
        />
      </div>
      <div
        className={`sp-podium-card sp-podium-card--${rankLabel}`}
        ref={refCallback}
      >
        <div className={`sp-podium-num sp-podium-num--${variant}`}>
          {index + 1}
        </div>

        {isFirst && (
          <div className="sp-podium-principal-label">
            <span>✦</span> Premio principal <span>✦</span>
          </div>
        )}

        <div className="sp-podium-img-wrap">
          {premio.imagen ? (
            <img src={premio.imagen} alt={premio.descripcion} className="sp-podium-img" />
          ) : (
            <div className={`sp-podium-img-placeholder sp-podium-img-placeholder--${variant}`}>
              🎁
            </div>
          )}
        </div>

        <div className="sp-podium-desc">{premio.descripcion}</div>
      </div>
    </div>
  );
}

export default function SorteoPopup() {
  const [config, setConfig] = useState(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const backdropRef = useRef(null);
  const modalRef = useRef(null);
  const premiosRef = useRef([]);

  useEffect(() => {
    if (sessionStorage.getItem("sorteo_popup_seen")) return;
    getSorteoConfig()
      .then((cfg) => {
        if (cfg?.activo) {
          setConfig(cfg);
          setVisible(true);
        }
      })
      .catch(() => {});
  }, []);

  useGSAP(
    () => {
      if (!visible || closing) return;
      const cards = premiosRef.current.filter(Boolean);

      gsap.fromTo(backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power2.out" }
      );

      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.84, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.52, ease: "back.out(1.4)", delay: 0.1 }
      );

      if (cards.length) {
        // Podio: 2do entra desde izquierda, 1ro desde abajo, 3ro desde derecha
        const order = [cards[1], cards[0], cards[2]].filter(Boolean);
        gsap.fromTo(order,
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.2)", stagger: 0.08, delay: 0.42 }
        );
      }
    },
    { scope: backdropRef, dependencies: [visible] }
  );

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    sessionStorage.setItem("sorteo_popup_seen", "1");

    gsap.to(modalRef.current, {
      opacity: 0, scale: 0.88, y: 20, duration: 0.28, ease: "power2.in",
    });
    gsap.to(backdropRef.current, {
      opacity: 0, duration: 0.32, ease: "power2.in", delay: 0.06,
      onComplete: () => setVisible(false),
    });
  };

  if (!visible || !config) return null;

  const premios = (config.premios || []).filter((p) => p.descripcion);
  // Reorder for podium display: 2nd | 1st | 3rd
  const top3 = [premios[1], premios[0], premios[2]].filter(Boolean);
  const top3Indices = [1, 0, 2];
  const rest = premios.slice(3);

  return (
    <div
      className="sp-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) handleClose(); }}
    >
      <div className="sp-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label={`Sorteo: ${config.titulo}`}>

        {/* Hero */}
        <div className="sp-hero">
          <img src={heroImg} alt="Sorteo CoolVending" />
          <div className="sp-hero-overlay" />
          <div className="sp-hero-title">
            <h2 className="sp-title">
              <span className="sp-title-top">Sorteo</span>
              <span className="sp-title-brand">CoolVending</span>
            </h2>
          </div>
          <button className="sp-close" onClick={handleClose} aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Premios */}
        {premios.length > 0 && (
          <div className="sp-body">
            {/* Podio top 3 */}
            <div className="sp-podium">
              {top3.map((premio, displayIdx) => {
                const realIdx = top3Indices[displayIdx];
                return (
                  <PodiumCard
                    key={realIdx}
                    premio={premio}
                    index={realIdx}
                    refCallback={(el) => (premiosRef.current[displayIdx] = el)}
                  />
                );
              })}
            </div>

            {/* 4°+ en fila simple */}
            {rest.length > 0 && (
              <div className="sp-rest">
                {rest.map((premio, i) => (
                  <div key={i + 3} className="sp-rest-item">
                    <span className="sp-rest-num">{ORDINALS[i + 3]}</span>
                    <span className="sp-rest-desc">{premio.descripcion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="sp-footer">
          <Link to="/sorteos" className="sp-cta" onClick={handleClose}>
            ¡Quiero participar!
          </Link>
          <button className="sp-skip" onClick={handleClose}>
            Ahora no
          </button>
        </div>

      </div>
    </div>
  );
}
