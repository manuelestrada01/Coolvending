import { useState, useEffect, useMemo } from "react";
import { Container, Spinner } from "react-bootstrap";
import { getMaquinas } from "../../services/firebase/maquinas";
import { getInsumos } from "../../services/firebase/insumosService";
import { savePresupuesto } from "../../services/firebase/firestore";
import PageHero from "../../shared/layout/PageHero";
import "./Presupuestos.css";

const WHATSAPP_NUMBER = "5491112345678";
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d\s\-().]{6,20}$/;

// Maps machine categoria → insumo maquina tag
const MACHINE_TO_INSUMO = {
  "algodón": "Algodón de azúcar",
  "algodon": "Algodón de azúcar",
  "pochoclo": "Pochoclos",
  "pochoclos": "Pochoclos",
};

const STEPS = [
  { n: 1, label: "Máquinas" },
  { n: 2, label: "Insumos" },
  { n: 3, label: "Canal" },
  { n: 4, label: "Contacto" },
];

export default function Presupuestos() {
  const [step, setStep] = useState(1);
  const [maquinas, setMaquinas] = useState([]);
  const [loadingMaquinas, setLoadingMaquinas] = useState(true);
  const [insumos, setInsumos] = useState([]);
  const [loadingInsumos, setLoadingInsumos] = useState(true);

  const [selected, setSelected] = useState(new Set());         // machine ids
  const [selectedInsumos, setSelectedInsumos] = useState(new Set()); // insumo ids
  const [canal, setCanal] = useState(null); // "email" | "whatsapp"
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getMaquinas()
      .then(setMaquinas)
      .catch(console.error)
      .finally(() => setLoadingMaquinas(false));
    getInsumos()
      .then(setInsumos)
      .catch(console.error)
      .finally(() => setLoadingInsumos(false));
  }, []);

  // Insumos relevantes según las máquinas seleccionadas
  const relevantInsumos = useMemo(() => {
    const selectedMachines = maquinas.filter((m) => selected.has(m.id));
    const tags = new Set();
    selectedMachines.forEach((m) => {
      const key = (m.categoria || m.nombre || "").toLowerCase();
      Object.entries(MACHINE_TO_INSUMO).forEach(([k, v]) => {
        if (key.includes(k)) tags.add(v);
      });
    });
    // If no specific match, show all insumos
    if (tags.size === 0) return insumos;
    // "Ambas" tag covers both machine types
    return insumos.filter((ins) => tags.has(ins.maquina) || ins.maquina === "Ambas");
  }, [maquinas, selected, insumos]);

  function toggleInsumo(id) {
    setSelectedInsumos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleMachine(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleContactChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validateContact() {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = "El nombre es requerido.";
    if (canal === "email" && !EMAIL_RE.test(form.email.trim())) errors.email = "Email inválido.";
    if (canal === "whatsapp" && !PHONE_RE.test(form.telefono.trim())) errors.telefono = "Teléfono inválido.";
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateContact();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    const selectedMaquinas = maquinas.filter((m) => selected.has(m.id)).map((m) => m.nombre);
    const selectedInsumoNames = insumos.filter((ins) => selectedInsumos.has(ins.id)).map((ins) => ins.nombre);

    if (canal === "whatsapp") {
      const list = selectedMaquinas.join(", ");
      const insumoList = selectedInsumoNames.length ? ` También me interesan los insumos: ${selectedInsumoNames.join(", ")}.` : "";
      const extra = form.mensaje.trim() ? ` ${form.mensaje.trim()}` : "";
      const text = `Hola! Me interesa recibir un presupuesto para: ${list}.${insumoList} Mi nombre es ${form.nombre.trim()}.${extra}`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      setDone(true);
      return;
    }

    setSubmitting(true);
    try {
      await savePresupuesto({
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        mensaje: form.mensaje.trim(),
        maquinas: selectedMaquinas,
        insumos: selectedInsumoNames,
        canal,
      });
      setDone(true);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      setFieldErrors({ _global: "Hubo un error al enviar. Intentá de nuevo o escribinos por WhatsApp." });
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep(1);
    setSelected(new Set());
    setSelectedInsumos(new Set());
    setCanal(null);
    setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
    setFieldErrors({});
    setDone(false);
  }

  const selectedNames = maquinas.filter((m) => selected.has(m.id)).map((m) => m.nombre);
  const selectedInsumoNames = insumos.filter((ins) => selectedInsumos.has(ins.id)).map((ins) => ins.nombre);

  return (
    <>
      <PageHero
        title={<>Pedínos tu<br /><span className="ph-gradient-text">presupuesto</span></>}
        description="Elegí las máquinas que te interesan y te enviamos una cotización personalizada."
      />

      <section className="pres-section">
        <Container>

          {done ? (
            /* ── Success ─────────────────────────────────────── */
            <div className="pres-success">
              <div className="pres-success-ring">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="pres-success-title">
                {canal === "whatsapp" ? "¡Te redirigimos a WhatsApp!" : "¡Solicitud enviada!"}
              </h3>
              <p className="pres-success-text">
                {canal === "whatsapp"
                  ? "Completá la conversación en WhatsApp y te responderemos a la brevedad."
                  : "Recibimos tu solicitud. Te contactaremos en menos de 24 hs."}
              </p>
              <button className="pres-success-back" onClick={reset}>Hacer otra consulta</button>
            </div>
          ) : (
            <>
              {/* ── Step indicator ───────────────────────────── */}
              <div className="pres-steps" role="list" aria-label="Pasos del formulario">
                {STEPS.map((s, i) => (
                  <div
                    key={s.n}
                    className={`pres-step${
                      step === s.n ? " pres-step--active" :
                      step > s.n  ? " pres-step--done"   : ""
                    }`}
                    role="listitem"
                  >
                    <div className="pres-step-num">
                      {step > s.n ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : s.n}
                    </div>
                    <span className="pres-step-label">{s.label}</span>
                    {i < STEPS.length - 1 && <div className="pres-step-connector" />}
                  </div>
                ))}
              </div>

              {/* ── Step 1: Select machines ───────────────────── */}
              {step === 1 && (
                <div className="pres-panel">
                  <h2 className="pres-panel-title">¿Qué máquinas te interesan?</h2>
                  <p className="pres-panel-sub">Podés seleccionar una o varias.</p>

                  {loadingMaquinas ? (
                    <div className="text-center py-5">
                      <Spinner style={{ color: "var(--cv-gold)" }} />
                    </div>
                  ) : maquinas.length === 0 ? (
                    <p className="pres-empty">No hay máquinas disponibles en este momento.</p>
                  ) : (
                    <div className="pres-machines-grid">
                      {maquinas.map((m) => {
                        const isSelected = selected.has(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            className={`pres-machine-card${isSelected ? " pres-machine-card--selected" : ""}`}
                            onClick={() => toggleMachine(m.id)}
                            aria-pressed={isSelected}
                          >
                            {m.imagenURL ? (
                              <img src={m.imagenURL} alt={m.nombre} className="pres-machine-img" loading="lazy" />
                            ) : (
                              <div className="pres-machine-img pres-machine-img--placeholder">🤖</div>
                            )}
                            <span className="pres-machine-name">{m.nombre}</span>
                            <div className="pres-machine-check" aria-hidden="true">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="pres-nav">
                    <div />
                    <button
                      className="pres-btn pres-btn--primary"
                      disabled={selected.size === 0}
                      onClick={() => setStep(2)}
                    >
                      Siguiente
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Insumos (optional) ─────────────────── */}
              {step === 2 && (
                <div className="pres-panel">
                  <h2 className="pres-panel-title">¿Querés agregar insumos a la cotización?</h2>
                  <p className="pres-panel-sub">Opcional — podés saltear este paso si solo querés cotizar máquinas.</p>

                  {loadingInsumos ? (
                    <div className="text-center py-5">
                      <Spinner style={{ color: "var(--cv-gold)" }} />
                    </div>
                  ) : relevantInsumos.length === 0 ? (
                    <p className="pres-empty">No hay insumos disponibles para las máquinas seleccionadas.</p>
                  ) : (
                    <div className="pres-insumos-grid">
                      {relevantInsumos.map((ins) => {
                        const isSelected = selectedInsumos.has(ins.id);
                        return (
                          <button
                            key={ins.id}
                            type="button"
                            className={`pres-insumo-card${isSelected ? " pres-insumo-card--selected" : ""}`}
                            onClick={() => toggleInsumo(ins.id)}
                            aria-pressed={isSelected}
                          >
                            {ins.imagenURL ? (
                              <img src={ins.imagenURL} alt={ins.nombre} className="pres-insumo-img" loading="lazy" />
                            ) : (
                              <div className="pres-insumo-img pres-insumo-img--placeholder">
                                {ins.maquina === "Pochoclos" ? "🍿" : "🍬"}
                              </div>
                            )}
                            <div className="pres-insumo-info">
                              <span className="pres-insumo-name">{ins.nombre}</span>
                              {ins.cantidad && (
                                <span className="pres-insumo-qty">{ins.cantidad}</span>
                              )}
                            </div>
                            <div className="pres-machine-check" aria-hidden="true">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="pres-nav">
                    <button className="pres-btn pres-btn--ghost" onClick={() => setStep(1)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                      </svg>
                      Volver
                    </button>
                    <div className="pres-nav-right">
                      <button className="pres-btn pres-btn--ghost" onClick={() => { setSelectedInsumos(new Set()); setStep(3); }}>
                        Saltear
                      </button>
                      <button className="pres-btn pres-btn--primary" onClick={() => setStep(3)}>
                        {selectedInsumos.size > 0 ? `Continuar (${selectedInsumos.size} seleccionado${selectedInsumos.size > 1 ? "s" : ""})` : "Continuar"}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 3: Choose channel ───────────────────── */}
              {step === 3 && (
                <div className="pres-panel">
                  <h2 className="pres-panel-title">¿Cómo preferís que te contactemos?</h2>
                  <p className="pres-panel-sub">Elegí el canal que más te convenga.</p>

                  <div className="pres-channels-grid">
                    {/* Email */}
                    <button
                      type="button"
                      className={`pres-channel-card${canal === "email" ? " pres-channel-card--selected" : ""}`}
                      onClick={() => setCanal("email")}
                      aria-pressed={canal === "email"}
                    >
                      <div className="pres-channel-icon pres-channel-icon--email">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" />
                        </svg>
                      </div>
                      <p className="pres-channel-title">Correo electrónico</p>
                      <p className="pres-channel-desc">Te enviamos la cotización a tu email.</p>
                      <div className="pres-channel-check" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </button>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      className={`pres-channel-card${canal === "whatsapp" ? " pres-channel-card--selected" : ""}`}
                      onClick={() => setCanal("whatsapp")}
                      aria-pressed={canal === "whatsapp"}
                    >
                      <div className="pres-channel-icon pres-channel-icon--wa">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.523 5.832L.057 23.57a.75.75 0 0 0 .918.943l5.84-1.53A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.705 9.705 0 0 1-4.953-1.356l-.355-.21-3.676.964.98-3.574-.23-.368A9.75 9.75 0 1 1 12 21.75z" />
                        </svg>
                      </div>
                      <p className="pres-channel-title">WhatsApp</p>
                      <p className="pres-channel-desc">Te redirigimos directo a una conversación.</p>
                      <div className="pres-channel-check" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </button>
                  </div>

                  <div className="pres-nav">
                    <button className="pres-btn pres-btn--ghost" onClick={() => setStep(2)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                      </svg>
                      Volver
                    </button>
                    <button
                      className="pres-btn pres-btn--primary"
                      disabled={!canal}
                      onClick={() => setStep(4)}
                    >
                      Siguiente
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 4: Contact info ──────────────────── */}
              {step === 4 && (
                <div className="pres-panel">
                  <h2 className="pres-panel-title">Tus datos de contacto</h2>
                  <p className="pres-panel-sub">Completá la información para recibir la cotización.</p>

                  {/* Selection summary */}
                  <div className="pres-summary">
                    <span className="pres-summary-label">Máquinas:</span>
                    <div className="pres-summary-tags">
                      {selectedNames.map((n) => (
                        <span key={n} className="pres-summary-tag">{n}</span>
                      ))}
                    </div>
                    {selectedInsumoNames.length > 0 && (
                      <>
                        <span className="pres-summary-label" style={{ marginTop: "0.5rem", width: "100%" }}>Insumos:</span>
                        <div className="pres-summary-tags">
                          {selectedInsumoNames.map((n) => (
                            <span key={n} className="pres-summary-tag pres-summary-tag--insumo">{n}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} noValidate>
                    {fieldErrors._global && (
                      <div className="pres-alert pres-alert--err">{fieldErrors._global}</div>
                    )}

                    <div className="pres-fields">
                      <div className="pres-field">
                        <label className="pres-label" htmlFor="pres-nombre">Nombre completo</label>
                        <input
                          id="pres-nombre"
                          className={`pres-input${fieldErrors.nombre ? " pres-input--error" : ""}`}
                          type="text"
                          name="nombre"
                          value={form.nombre}
                          onChange={handleContactChange}
                          placeholder="Juan Pérez"
                        />
                        {fieldErrors.nombre && <span className="pres-field-err">{fieldErrors.nombre}</span>}
                      </div>

                      {canal === "email" && (
                        <div className="pres-field">
                          <label className="pres-label" htmlFor="pres-email">Correo electrónico</label>
                          <input
                            id="pres-email"
                            className={`pres-input${fieldErrors.email ? " pres-input--error" : ""}`}
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleContactChange}
                            placeholder="juan@email.com"
                          />
                          {fieldErrors.email && <span className="pres-field-err">{fieldErrors.email}</span>}
                        </div>
                      )}

                      {canal === "whatsapp" && (
                        <div className="pres-field">
                          <label className="pres-label" htmlFor="pres-telefono">Teléfono / WhatsApp</label>
                          <input
                            id="pres-telefono"
                            className={`pres-input${fieldErrors.telefono ? " pres-input--error" : ""}`}
                            type="tel"
                            name="telefono"
                            value={form.telefono}
                            onChange={handleContactChange}
                            placeholder="+54 9 11 1234⁡5678"
                          />
                          {fieldErrors.telefono && <span className="pres-field-err">{fieldErrors.telefono}</span>}
                        </div>
                      )}

                      <div className="pres-field">
                        <label className="pres-label" htmlFor="pres-mensaje">
                          Mensaje <span className="pres-label-opt">(opcional)</span>
                        </label>
                        <textarea
                          id="pres-mensaje"
                          className="pres-input pres-textarea"
                          name="mensaje"
                          value={form.mensaje}
                          onChange={handleContactChange}
                          rows={4}
                          placeholder="Contanos más detalles sobre tu consulta..."
                        />
                      </div>
                    </div>

                    <div className="pres-nav">
                      <button type="button" className="pres-btn pres-btn--ghost" onClick={() => setStep(3)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                        Volver
                      </button>
                      <button type="submit" className="pres-btn pres-btn--primary" disabled={submitting}>
                        {submitting ? (
                          <><Spinner size="sm" className="me-2" />Enviando...</>
                        ) : canal === "whatsapp" ? (
                          <>Abrir WhatsApp
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.523 5.832L.057 23.57a.75.75 0 0 0 .918.943l5.84-1.53A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.705 9.705 0 0 1-4.953-1.356l-.355-.21-3.676.964.98-3.574-.23-.368A9.75 9.75 0 1 1 12 21.75z"/>
                            </svg>
                          </>
                        ) : (
                          <>Enviar solicitud
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  );
}