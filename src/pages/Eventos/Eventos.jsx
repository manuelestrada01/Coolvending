import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useScrollReveal } from "../../shared/utils/useScrollReveal";
import { getEventos } from "../../services/firebase/eventosService";
import PageHero from "../../shared/layout/PageHero";
import "./Eventos.css";

/* ─── Icons ─────────────────────────────────────────── */
const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

/* Minimalist feature icons */
const IconClock = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconUser = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconZap = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconLayers = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);
const IconStar = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconPackage = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

/* ─── Data helpers ────────────────────────────────────── */
const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MONTHS_LONG  = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_WEEK    = ["L","M","M","J","V","S","D"];
const TIME_SLOTS   = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];
const WA_NUMBER    = "5492615661521";

function getCalendarDays(year, month) {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Monday
  const total    = new Date(year, month + 1, 0).getDate();
  const cells    = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
}

/* ─── Data ───────────────────────────────────────────── */
const CATEGORIAS = ["Todos", "Cumpleaños", "Corporativo", "Social", "Feria", "Escolar", "Casamiento", "Otro"];

const IconBirthday = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    <path d="M12 3v4"/>
  </svg>
);
const IconBuilding = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18"/><path d="M9 21V9"/>
  </svg>
);
const IconSun = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IconHeart = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconBook = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const IconRings = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="12" r="5"/><circle cx="16" cy="12" r="5"/>
  </svg>
);

const CATEGORIA_ICONS = {
  "Cumpleaños":  <IconBirthday />,
  "Corporativo": <IconBuilding />,
  "Social":      <IconHeart />,
  "Feria":       <IconSun />,
  "Escolar":     <IconBook />,
  "Casamiento":  <IconRings />,
  "Otro":        <IconStar />,
};

const CATEGORIA_GRADIENTS = {
  "Cumpleaños":  "ev-grad--1",
  "Corporativo": "ev-grad--2",
  "Feria":       "ev-grad--3",
  "Social":      "ev-grad--4",
  "Escolar":     "ev-grad--5",
  "Casamiento":  "ev-grad--6",
  "Otro":        "ev-grad--1",
};

const CATEGORIA_TAG = {
  "Cumpleaños":  "cumpleanos",
  "Corporativo": "corporativo",
  "Social":      "social",
  "Feria":       "feria",
  "Escolar":     "escolar",
  "Casamiento":  "social",
  "Otro":        "social",
};

/* ─── Feature card ──────────────────────────────────── */
function FeatureCard({ icon, title, text, className, style }) {
  return (
    <div className={`ev-feature${className ? ` ${className}` : ""}`} style={style}>
      <div className="ev-feature__icon">{icon}</div>
      <h3 className="ev-feature__title">{title}</h3>
      <p className="ev-feature__text">{text}</p>
    </div>
  );
}

/* ─── Pricing card ───────────────────────────────────── */
function PricingCard({ opcion, isSelected, onSelect, className, style }) {
  return (
    <div
      className={[
        "ev-pricing",
        opcion.destacado && !isSelected ? "ev-pricing--destacado" : "",
        isSelected ? "ev-pricing--booking" : "",
        className ?? "",
      ].filter(Boolean).join(" ")}
      style={style}
    >
      {isSelected ? (
        /* ── BOOKING VIEW: reemplaza el interior de la card ── */
        <div className="ev-pricing-booking-view">
          {/* Compact header */}
          <div className="ev-pricing-booking-header">
            <div className="ev-pricing-booking-info">
              <span className="ev-pricing__opcion-label">{opcion.label}</span>
              <p className="ev-pricing__duracion">
                {opcion.duracion}
                <span className="ev-pricing-booking-price">&nbsp;&middot;&nbsp;{opcion.precio}</span>
              </p>
            </div>
            <button className="ev-pricing-close-btn" onClick={onSelect} aria-label="Cerrar">
              <CloseIcon />
            </button>
          </div>
          {/* Booking panel  */}
          <BookingPanel plan={opcion} key={opcion.label} />
        </div>
      ) : (
        /* ── NORMAL VIEW ── */
        <>
          {opcion.destacado && <div className="ev-pricing__ribbon">Más elegido</div>}
          <div className="ev-pricing__header">
            <div className="ev-pricing__icon">{opcion.icon}</div>
            <div>
              <span className="ev-pricing__opcion-label">{opcion.label}</span>
              <p className="ev-pricing__duracion">{opcion.duracion}</p>
            </div>
          </div>
          <div className="ev-pricing__price">
            <span className="ev-pricing__amount">{opcion.precio}</span>
            <span className="ev-pricing__currency">pesos</span>
          </div>
          <ul className="ev-pricing__list">
            {opcion.features.map((f, i) => (
              <li key={i} className="ev-pricing__item"><CheckIcon /> {f}</li>
            ))}
          </ul>
          <button className="ev-pricing__cta" onClick={onSelect}>
            Elegir fecha <ArrowRightIcon />
          </button>
        </>
      )}
    </div>
  );
}

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

/* ─── Booking panel (calendar + timeslots) ───────────── */
function BookingPanel({ plan }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selDate,   setSelDate]   = useState(null);
  const [selTime,   setSelTime]   = useState(null);

  const cells = getCalendarDays(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isPrevDisabled = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const isDisabled = (day) => {
    if (!day) return true;
    return new Date(viewYear, viewMonth, day) <= today;
  };
  const isSelected = (day) =>
    !!day && !!selDate &&
    selDate.getFullYear() === viewYear &&
    selDate.getMonth()    === viewMonth &&
    selDate.getDate()     === day;
  const isToday = (day) =>
    !!day && new Date(viewYear, viewMonth, day).getTime() === today.getTime();

  const handleDay = (day) => {
    if (isDisabled(day)) return;
    setSelDate(new Date(viewYear, viewMonth, day));
    setSelTime(null);
  };

  const handleConfirm = () => {
    const dateStr = selDate.toLocaleDateString("es-AR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const msg = `¡Hola! Me interesa reservar la ${plan.label} (${plan.duracion}) para el ${dateStr} a las ${selTime}hs. ¿Está disponible?`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="ev-booking-panel">
      {/* Calendar */}
      <div className="ev-cal">
        <div className="ev-cal__nav">
          <button
            className="ev-cal__nav-btn"
            onClick={prevMonth}
            disabled={isPrevDisabled}
            aria-label="Mes anterior"
          ><ChevronLeft /></button>
          <span className="ev-cal__month-label">{MONTHS_LONG[viewMonth]} {viewYear}</span>
          <button className="ev-cal__nav-btn" onClick={nextMonth} aria-label="Mes siguiente"><ChevronRight /></button>
        </div>

        <div className="ev-cal__grid">
          {DAYS_WEEK.map((d, i) => (
            <span key={i} className="ev-cal__weekday">{d}</span>
          ))}
          {cells.map((day, i) => (
            <button
              key={i}
              className={[
                "ev-cal__day",
                !day               ? "ev-cal__day--empty"    : "",
                isDisabled(day)    ? "ev-cal__day--disabled"  : "",
                isToday(day)       ? "ev-cal__day--today"     : "",
                isSelected(day)    ? "ev-cal__day--selected"  : "",
              ].filter(Boolean).join(" ")}
              onClick={() => handleDay(day)}
              disabled={!day || isDisabled(day)}
              tabIndex={!day || isDisabled(day) ? -1 : 0}
              aria-label={day ? `${day} de ${MONTHS_LONG[viewMonth]}` : undefined}
            >
              {day ?? ""}
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      {selDate && (
        <div className="ev-timeslots">
          <p className="ev-timeslots__label">Horario de inicio</p>
          <div className="ev-timeslots__grid">
            {TIME_SLOTS.map(t => (
              <button
                key={t}
                className={`ev-timeslot${selTime === t ? " ev-timeslot--selected" : ""}`}
                onClick={() => setSelTime(t)}
              >{t}</button>
            ))}
          </div>
        </div>
      )}

      {/* Confirm */}
      {selDate && selTime && (
        <button className="ev-booking-confirm" onClick={handleConfirm}>
          <WhatsAppIcon /> Reservar por WhatsApp
        </button>
      )}
    </div>
  );
}

/* ─── Event card (Firestore data) ──────────────── */
function EventCard({ evento, className, style }) {
  const portada = evento.fotos?.[0]?.url ?? null;
  const categoria = evento.categoria ?? "Otro";
  const icon = CATEGORIA_ICONS[categoria] ?? <IconStar />;
  const gradiente = CATEGORIA_GRADIENTS[categoria] ?? "ev-grad--1";
  const tagCls = CATEGORIA_TAG[categoria] ?? "social";

  let dia = "--", mes = "---";
  if (evento.fecha) {
    const parts = evento.fecha.split("-");
    dia = Number(parts[2]).toString();
    mes = MONTHS_SHORT[Number(parts[1]) - 1] ?? "---";
  }

  return (
    <article className={`ev-card${className ? ` ${className}` : ""}`} style={style}>
      <div className="ev-card__img-wrap">
        {portada ? (
          <img
            src={portada}
            alt={evento.titulo}
            className="ev-card__img"
          />
        ) : (
          <div className={`ev-card__img-placeholder ${gradiente}`}>
            <div className="ev-card__placeholder-icon">{icon}</div>
          </div>
        )}
        <span className={`ev-card__tag ev-card__tag--${tagCls}`}>{categoria}</span>
        <div className="ev-card__date-ribbon">
          <strong>{dia}</strong>{mes}
        </div>
      </div>

      <div className="ev-card__body">
        <h3 className="ev-card__title">{evento.titulo}</h3>
        <p className="ev-card__meta"><MapPinIcon />{evento.ubicacion}</p>
        <p className="ev-card__desc">{evento.detalle}</p>
        <div className="ev-card__footer">
          {evento.invitados && (
            <span className="ev-card__guests"><UsersIcon />{evento.invitados}</span>
          )}
          <NavLink to="/contacto" className="ev-card__btn">
            Consultar <ArrowRightIcon />
          </NavLink>
        </div>
      </div>
    </article>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function Eventos() {
  const [filtro, setFiltro] = useState("Todos");
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  useEffect(() => {
    getEventos()
      .then(setEventos)
      .catch(console.error)
      .finally(() => setLoadingEventos(false));
  }, []);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(null);

  const [statsRef, statsVisible]     = useScrollReveal();
  const [howRef, howVisible]         = useScrollReveal();
  const [pricingRef, pricingVisible] = useScrollReveal();
  const [cardsRef, cardsVisible]     = useScrollReveal();
  const [ctaRef, ctaVisible]         = useScrollReveal();

  const eventosFiltrados =
    filtro === "Todos"
      ? eventos
      : eventos.filter((e) => e.categoria === filtro);

  return (
    <>
      {/* ── Hero ── */}
      <PageHero
        title={<>Nuestros <span className="ph-gradient-text">Eventos</span></>}
        description={<>Llevamos la magia del algodón de azúcar portátil y american popcorn a cada celebración. Servicio <strong>por hora</strong>, operario calificado incluido y una nube dulce cada 1 min 30 seg — porque cada invitado merece su momento mágico.</>}
      >
        <NavLink to="/contacto" className="ev-hero__cta">
          Reservar para tu Evento <ArrowRightIcon />
        </NavLink>
      </PageHero>

      {/* ── Stats bar ── */}
      <div className="ev-stats">
        <div
          ref={statsRef}
          className={`ev-stats__inner reveal-section${statsVisible ? " visible" : ""}`}
        >
          {[
            { value: "+100", label: "Eventos realizados" },
            { value: "~35/hr", label: "Algodones por máquina" },
            { value: "1 ó 2", label: "Máquinas disponibles por evento" },
            { value: "Incluido", label: "Operario calificado" },
          ].map((s, i) => (
            <div className="ev-stat reveal-card" key={s.label} style={{ transitionDelay: `${i * 0.1}s` }}>
              <span className="ev-stat__value">{s.value}</span>
              <span className="ev-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cómo funciona ── */}
      <section className="ev-how">
        <Container>
          <div className="ev-section-header">
            <span className="ev-section-header__eyebrow">El servicio</span>
            <h2 className="ev-section-header__title">¿Cómo funciona?</h2>
            <span className="ev-section-header__line" />
          </div>
          <Row
            ref={howRef}
            className={`g-4 reveal-section${howVisible ? " visible" : ""}`}
          >
            {[
              {
                icon: <IconClock />,
                title: "Cobro por hora",
                text: "Contratás exactamente las horas que necesitás. El precio varía según la duración y la cantidad de máquinas elegidas.",
              },
              {
                icon: <IconUser />,
                title: "Operario calificado incluido",
                text: "Cada máquina viene con su propio operario especializado. Vos disfrutás de tu evento — nosotros nos ocupamos de todo.",
              },
              {
                icon: <IconZap />,
                title: "1 algodón cada 1 min 30 s",
                text: "Producción continua de ~35 porciones por hora por máquina. Ningún invitado se queda sin su nube de azúcar.",
              },
              {
                icon: <IconLayers />,
                title: "1 ó 2 máquinas",
                text: "Según el tamaño de tu evento podés sumar una segunda máquina y llegar a ~70 porciones por hora con doble espectáculo.",
              },
            ].map((f, i) => (
              <Col key={f.title} xs={12} sm={6} lg={3}>
                <div className="why-card reveal-card" style={{ transitionDelay: `${i * 0.12}s` }}>
                  <div className="why-card-icon">{f.icon}</div>
                  <h4 className="why-card-title">{f.title}</h4>
                  <p className="why-card-text">{f.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── Tipos de eventos ── */}
      <section className="ev-section">
        <Container>
          <div className="ev-section-header">
            <span className="ev-section-header__eyebrow">Galería de eventos</span>
            <h2 className="ev-section-header__title">Momentos que endulzamos</h2>
            <span className="ev-section-header__line" />
          </div>

          <div className="ev-filters">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                className={`ev-chip${filtro === cat ? " ev-chip--active" : ""}`}
                onClick={() => setFiltro(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div
            ref={cardsRef}
            className={`ev-grid reveal-section${cardsVisible ? " visible" : ""}`}
          >
            {loadingEventos ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem 0", color: "#999" }}>Cargando eventos...</p>
            ) : eventosFiltrados.length === 0 ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem 0", color: "#999" }}>
                {eventos.length === 0 ? "Próximamente publicaremos los eventos realizados." : "No hay eventos en esta categoría todavía."}
              </p>
            ) : (
              eventosFiltrados.map((evento, i) => (
                <EventCard key={evento.id} evento={evento} className="reveal-card" style={{ transitionDelay: `${i * 0.1}s` }} />
              ))
            )}
          </div>
        </Container>
      </section>

      {/* ── Precios ── */}
      <section className="ev-plans-section">
        <Container>
          <div className="ev-section-header">
            <span className="ev-section-header__eyebrow">Máquina robotizada · 5 deliciosos sabores</span>
            <h2 className="ev-section-header__title">Precios para tu evento</h2>
            <span className="ev-section-header__line" />
          </div>
          <p className="ev-pricing__note-top">
            Incluye operario, flete e insumos. · Mendoza y alrededores.
          </p>
          <div
            ref={pricingRef}
            className={`ev-plans-grid reveal-section${pricingVisible ? " visible" : ""}`}
          >
            {[
              {
                icon: <IconClock />,
                label: "Opción 1",
                duracion: "1 hora",
                precio: "$ 100.000",
                features: [
                  "30 – 35 algodones de azúcar",
                  "1 operario calificado incluido",
                  "Flete e insumos incluidos",
                  "5 sabores disponibles",
                ],
                destacado: false,
              },
              {
                icon: <IconStar />,
                label: "Opción 2",
                duracion: "1,5 horas",
                precio: "$ 135.000",
                features: [
                  "45 – 50 algodones de azúcar",
                  "1 operario calificado incluido",
                  "Flete e insumos incluidos",
                  "5 sabores disponibles",
                ],
                destacado: true,
              },
              {
                icon: <IconPackage />,
                label: "Opción 3",
                duracion: "2 horas",
                precio: "$ 180.000",
                features: [
                  "60 – 65 algodones de azúcar",
                  "1 operario calificado incluido",
                  "Flete e insumos incluidos",
                  "5 sabores disponibles",
                ],
                destacado: false,
              },
            ].map((op, i) => (
              <PricingCard
                key={op.label}
                opcion={op}
                isSelected={selectedPlanIdx === i}
                onSelect={() => setSelectedPlanIdx(selectedPlanIdx === i ? null : i)}
                className="reveal-card"
                style={{ transitionDelay: `${i * 0.14}s` }}
              />
            ))}
          </div>
          <p className="ev-pricing__note">
            ¿Necesitás 2 máquinas? Consultanos para una propuesta personalizada.
          </p>

          {/* ── CTA Banner ── */}
          <div
            ref={ctaRef}
            className={`ev-cta-banner ev-anim${ctaVisible ? " ev-anim--visible" : ""}`}
          >
            <h2 className="ev-cta-banner__title">
              ¿Querés algodón de azúcar en tu próximo evento?
            </h2>
            <p className="ev-cta-banner__text">
              Contamos con máquinas portátiles disponibles para cualquier tipo de
              celebración. Consultanos sin compromiso y hacemos una propuesta a
              medida para vos.
            </p>
            <div className="ev-cta-banner__actions">
              <NavLink to="/contacto" className="ev-cta-banner__btn-primary">
                Solicitar Presupuesto <ArrowRightIcon />
              </NavLink>
              <a
                href="https://wa.me/5492615661521"
                target="_blank"
                rel="noopener noreferrer"
                className="ev-cta-banner__btn-outline"
              >
                <WhatsAppIcon /> Escribinos por WhatsApp
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
