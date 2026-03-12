import { useState } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { saveContactMessage } from "../../services/firebase/firestore";
import { validateContactForm } from "../../shared/utils/validators";
import { useScrollReveal } from "../../shared/utils/useScrollReveal";
import PageHero from "../../shared/layout/PageHero";
import "./Contacto.css";

const INITIAL = { nombre: "", email: "", telefono: "", mensaje: "", _trap: "" };

export default function Contacto() {
  const [form, setForm] = useState(INITIAL);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState(null);

  const [sidebarRef, sidebarVisible] = useScrollReveal();
  const [formRef, formVisible] = useScrollReveal();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form._trap) return;
    const { ok, errors } = validateContactForm(form);
    if (!ok) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setStatus("loading");
    try {
      await saveContactMessage(form);
      setForm(INITIAL);
      setStatus("success");
    } catch (err) {
      if (err.message === "rate_limit") setStatus("ratelimit");
      else {
        if (import.meta.env.DEV) console.error(err);
        setStatus("error");
      }
    }
  }

  return (
    <>
      {/* ���� Hero ���� */}
      <PageHero
        title={<>Hablemos sobre<br /><span className="ph-gradient-text">tu próximo proyecto</span></>}
        description={<>Completá el formulario o escribinos directamente.<br />Te respondemos en menos de 24 hs.</>}
      />

      {/* ���� Contact section ���� */}
      <section className="ctc-section">
        <Container className="position-relative">
          <Row className="g-5 align-items-start">

            {/* ���� Sidebar ���� */}
            <Col lg={4}>
              <div ref={sidebarRef} className={`ctc-sidebar ctc-reveal ctc-reveal--left${sidebarVisible ? " ctc-reveal--visible" : ""}`}>
                <p className="ctc-eyebrow">Nuestros canales</p>
                <h2 className="ctc-sidebar-title">Estamos<br />disponibles</h2>
                <p className="ctc-sidebar-desc">
                  Elegí el canal que más te guste. Atendemos en todos ellos.
                </p>

                <div className="ctc-contacts">
                  <a href="tel:+5491112345678" className="ctc-contact-card ctc-card-reveal" style={{ animationDelay: sidebarVisible ? "0.1s" : "0s" }}>
                    <div className="ctc-contact-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11 19.79 19.79 0 0 1 1.62 2.34 2 2 0 0 1 3.6.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div>
                      <p className="ctc-contact-label">Teléfono / WhatsApp</p>
                      <p className="ctc-contact-value">+54 9 11 1234�5678</p>
                    </div>
                    <svg className="ctc-contact-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>

                  <a href="mailto:hola@coolvending.com.ar" className="ctc-contact-card ctc-card-reveal" style={{ animationDelay: sidebarVisible ? "0.22s" : "0s" }}>
                    <div className="ctc-contact-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" />
                      </svg>
                    </div>
                    <div>
                      <p className="ctc-contact-label">Email</p>
                      <p className="ctc-contact-value">hola@coolvending.com.ar</p>
                    </div>
                    <svg className="ctc-contact-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>

                  <div className="ctc-contact-card ctc-card-reveal" style={{ animationDelay: sidebarVisible ? "0.34s" : "0s" }}>
                    <div className="ctc-contact-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 21s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z" /><circle cx="12" cy="11" r="2.1" />
                      </svg>
                    </div>
                    <div>
                      <p className="ctc-contact-label">Zona de cobertura</p>
                      <p className="ctc-contact-value">Buenos Aires y GBA</p>
                    </div>
                  </div>

                  <div className="ctc-contact-card ctc-card-reveal" style={{ animationDelay: sidebarVisible ? "0.46s" : "0s" }}>
                    <div className="ctc-contact-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <p className="ctc-contact-label">Horario de atención</p>
                      <p className="ctc-contact-value">Lun�Vie · 9 a 18 hs</p>
                    </div>
                  </div>
                </div>

                <div className="ctc-socials">
                  <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer" className="ctc-social ctc-social--wa">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.523 5.832L.057 23.57a.75.75 0 0 0 .918.943l5.84-1.53A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.705 9.705 0 0 1-4.953-1.356l-.355-.21-3.676.964.98-3.574-.23-.368A9.75 9.75 0 1 1 12 21.75z" />
                    </svg>
                    WhatsApp
                  </a>
                  <a href="https://instagram.com/coolvending" target="_blank" rel="noopener noreferrer" className="ctc-social ctc-social--ig">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                    Instagram
                  </a>
                </div>
              </div>
            </Col>

            {/* ���� Form ���� */}
            <Col lg={8}>
              <div ref={formRef} className={`ctc-form-card ctc-reveal ctc-reveal--right${formVisible ? " ctc-reveal--visible" : ""}`}>
                {status === "success" ? (
                  <div className="ctc-success">
                    <div className="ctc-success-ring">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <h3 className="ctc-success-title">¡Mensaje enviado!</h3>
                    <p className="ctc-success-text">Nos pondremos en contacto a la brevedad. ¡Gracias por escribirnos!</p>
                    <button className="ctc-success-back" onClick={() => setStatus(null)}>Enviar otro mensaje</button>
                  </div>
                ) : (
                  <>
                    <div className="ctc-form-header">
                      <h3 className="ctc-form-header-title">Envianos un mensaje</h3>
                      <p className="ctc-form-header-sub">Completá el formulario y te respondemos a la brevedad.</p>
                    </div>

                    <div className="ctc-form-body">
                      {/* Honeypot: bots fill the hidden field, humans don't */}
                      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }}>
                        <input type="text" name="_trap" value={form._trap} onChange={handleChange} tabIndex={-1} autoComplete="off" />
                      </div>

                      {status === "ratelimit" && (
                        <div className="ctc-alert ctc-alert--warn">
                          Enviaste demasiados mensajes en poco tiempo. Esperá unos minutos y volvé a intentarlo.
                        </div>
                      )}
                      {status === "error" && (
                        <div className="ctc-alert ctc-alert--err">
                          Hubo un error al enviar. Intentá de nuevo o escribinos por WhatsApp.
                        </div>
                      )}

                      <form onSubmit={handleSubmit} noValidate>
                        <Row className="g-4">
                          <Col md={6}>
                            <div className="ctc-field">
                              <label className="ctc-label" htmlFor="ctc-nombre">Nombre completo</label>
                              <input
                                id="ctc-nombre"
                                className={`ctc-input${fieldErrors.nombre ? " ctc-input--error" : ""}`}
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Juan Pérez"
                              />
                              {fieldErrors.nombre && <span className="ctc-field-err">{fieldErrors.nombre}</span>}
                            </div>
                          </Col>

                          <Col md={6}>
                            <div className="ctc-field">
                              <label className="ctc-label" htmlFor="ctc-email">Correo electrónico</label>
                              <input
                                id="ctc-email"
                                className={`ctc-input${fieldErrors.email ? " ctc-input--error" : ""}`}
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="juan@email.com"
                              />
                              {fieldErrors.email && <span className="ctc-field-err">{fieldErrors.email}</span>}
                            </div>
                          </Col>

                          <Col md={12}>
                            <div className="ctc-field">
                              <label className="ctc-label" htmlFor="ctc-telefono">
                                Teléfono <span className="ctc-label-opt">(opcional)</span>
                              </label>
                              <input
                                id="ctc-telefono"
                                className={`ctc-input${fieldErrors.telefono ? " ctc-input--error" : ""}`}
                                type="tel"
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                placeholder="+54 9 11 1234�5678"
                              />
                              {fieldErrors.telefono && <span className="ctc-field-err">{fieldErrors.telefono}</span>}
                            </div>
                          </Col>

                          <Col md={12}>
                            <div className="ctc-field">
                              <label className="ctc-label" htmlFor="ctc-mensaje">Mensaje</label>
                              <textarea
                                id="ctc-mensaje"
                                className={`ctc-input ctc-textarea${fieldErrors.mensaje ? " ctc-input--error" : ""}`}
                                name="mensaje"
                                value={form.mensaje}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Contanos en qué podemos ayudarte..."
                              />
                              {fieldErrors.mensaje && <span className="ctc-field-err">{fieldErrors.mensaje}</span>}
                            </div>
                          </Col>

                          <Col md={12}>
                            <button type="submit" className="ctc-submit" disabled={status === "loading"}>
                              {status === "loading" ? (
                                <><Spinner size="sm" className="me-2" />Enviando...</>
                              ) : (
                                <>
                                  Enviar mensaje
                                  <svg className="ctc-submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                  </svg>
                                </>
                              )}
                            </button>
                          </Col>
                        </Row>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </Col>

          </Row>
        </Container>
      </section>
    </>
  );
}

