import { useEffect, useRef, useState } from "react";
import {
  Row, Col, Button, Modal, Form, Alert, Spinner, Badge,
} from "react-bootstrap";
import {
  getEventos,
  addEvento,
  updateEvento,
  deleteEvento,
} from "../../services/firebase/eventosService";
import { validateEventoForm, validateImageFile } from "../../shared/utils/validators";

const CATEGORIAS = ["Cumpleaños", "Corporativo", "Social", "Feria", "Escolar", "Casamiento", "Otro"];
const MAX_PHOTOS = 3;

const EMPTY_FORM = {
  titulo: "",
  ubicacion: "",
  detalle: "",
  invitados: "",
  categoria: "Cumpleaños",
  fecha: "",
  fotos: [],
};

export default function EventosAdmin() {
  const [eventos, setEventos] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [removedPaths, setRemovedPaths] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleting, setDeleting] = useState(null);

  const fileInputRef = useRef(null);

  const loadEventos = async () => {
    setFetching(true);
    try {
      setEventos(await getEventos());
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { loadEventos(); }, []);

  // ── Modal helpers ──
  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setNewFiles([]);
    setPreviews([]);
    setRemovedPaths([]);
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (ev) => {
    setEditing(ev);
    setForm({
      titulo: ev.titulo ?? "",
      ubicacion: ev.ubicacion ?? "",
      detalle: ev.detalle ?? "",
      invitados: ev.invitados ?? "",
      categoria: CATEGORIAS.includes(ev.categoria) ? ev.categoria : CATEGORIAS[0],
      fecha: ev.fecha ?? "",
      fotos: ev.fotos ?? [],
    });
    setNewFiles([]);
    setPreviews([]);
    setRemovedPaths([]);
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.preview));
    setShowModal(false);
    setEditing(null);
    setNewFiles([]);
    setPreviews([]);
    setRemovedPaths([]);
  };

  // ── Photo helpers ──
  const existingPhotos = (form.fotos || []).filter((f) => !removedPaths.includes(f.path));
  const totalPhotos = existingPhotos.length + newFiles.length;
  const availableSlots = MAX_PHOTOS - totalPhotos;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const validated = [];
    for (const file of selected) {
      if (newFiles.length + validated.length + existingPhotos.length >= MAX_PHOTOS) break;
      const err = validateImageFile(file);
      if (err) { setFormError(err); return; }
      validated.push(file);
    }

    const newPreviews = validated.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setNewFiles((prev) => [...prev, ...validated]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    setFormError(null);
  };

  const removeExistingPhoto = (path) => {
    setRemovedPaths((prev) => [...prev, path]);
  };

  const removeNewFile = (idx) => {
    URL.revokeObjectURL(previews[idx].preview);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Form handlers ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const { ok, errors } = validateEventoForm(form);
    if (!ok) {
      setFieldErrors(errors);
      setFormError("Corregí los errores del formulario.");
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await updateEvento(editing.id, form, newFiles, removedPaths);
      } else {
        await addEvento(form, newFiles);
      }
      closeModal();
      await loadEventos();
    } catch (err) {
      setFormError(err.message || "Ocurrió un error. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ev) => {
    if (!window.confirm(`¿Eliminar el evento "${ev.titulo}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(ev.id);
    try {
      await deleteEvento(ev.id, ev.fotos ?? []);
      await loadEventos();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  // ── Render helpers ──
  const formatDate = (isoDate) => {
    if (!isoDate) return "—";
    const [year, month, day] = isoDate.split("-");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
  };

  return (
    <>
      <div className="admin-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <h1 className="admin-page-title">Eventos</h1>
        <Button onClick={openAdd} style={{ background: "var(--cv-gold)", border: "none", fontWeight: 600, borderRadius: "100px", padding: "0.5rem 1.4rem" }}>
          + Nuevo evento
        </Button>
      </div>

      {fetching ? (
        <div className="text-center py-5">
          <Spinner style={{ color: "var(--cv-gold)" }} />
        </div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-5" style={{ color: "var(--cv-text-secondary)" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎪</p>
          <p>No hay eventos todavía. ¡Creá el primero!</p>
        </div>
      ) : (
        <Row className="g-3">
          {eventos.map((ev) => {
            const portada = ev.fotos?.[0]?.url ?? null;
            return (
              <Col key={ev.id} xs={12} sm={6} lg={4}>
                <div className="admin-machine-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ height: 160, background: "var(--cv-surface-alt)", borderRadius: "12px 12px 0 0", overflow: "hidden", position: "relative" }}>
                    {portada ? (
                      <img src={portada} alt={ev.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2.5rem" }}>🎪</div>
                    )}
                    <Badge bg="dark" style={{ position: "absolute", top: 10, left: 10, fontSize: "0.7rem" }}>
                      {ev.categoria}
                    </Badge>
                    {ev.fotos?.length > 0 && (
                      <Badge bg="secondary" style={{ position: "absolute", top: 10, right: 10, fontSize: "0.7rem" }}>
                        {ev.fotos.length} foto{ev.fotos.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <p style={{ margin: 0, fontWeight: 700, color: "var(--cv-text-primary)", fontSize: "0.95rem", lineHeight: 1.3 }}>{ev.titulo}</p>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--cv-text-secondary)" }}>📅 {formatDate(ev.fecha)}</p>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--cv-text-secondary)" }}>📍 {ev.ubicacion}</p>
                    {ev.invitados && (
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--cv-text-secondary)" }}>👥 {ev.invitados} invitados</p>
                    )}
                  </div>
                  <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--cv-border)", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <Button size="sm" variant="outline-secondary" onClick={() => openEdit(ev)} style={{ borderRadius: "100px", fontSize: "0.78rem" }}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      style={{ borderRadius: "100px", fontSize: "0.78rem" }}
                      disabled={deleting === ev.id}
                      onClick={() => handleDelete(ev)}
                    >
                      {deleting === ev.id ? <Spinner size="sm" /> : "Eliminar"}
                    </Button>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* ── Modal crear/editar ── */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {editing ? "Editar evento" : "Nuevo evento"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger" style={{ fontSize: "0.85rem" }}>{formError}</Alert>}

            <Row className="g-3">
              <Col xs={12} md={8}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem" }}>Título *</Form.Label>
                  <Form.Control
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    placeholder="Ej: Cumpleaños de Sofía"
                    isInvalid={!!fieldErrors.titulo}
                    maxLength={120}
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.titulo}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem" }}>Categoría *</Form.Label>
                  <Form.Select name="categoria" value={form.categoria} onChange={handleChange} isInvalid={!!fieldErrors.categoria}>
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{fieldErrors.categoria}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem" }}>Fecha *</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    isInvalid={!!fieldErrors.fecha}
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.fecha}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem" }}>Cantidad de invitados</Form.Label>
                  <Form.Control
                    name="invitados"
                    value={form.invitados}
                    onChange={handleChange}
                    placeholder="Ej: 80 invitados"
                    maxLength={50}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem" }}>Ubicación *</Form.Label>
                  <Form.Control
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                    placeholder="Ej: Salón Rosado, Mendoza"
                    isInvalid={!!fieldErrors.ubicacion}
                    maxLength={150}
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.ubicacion}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem" }}>Detalle *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="detalle"
                    value={form.detalle}
                    onChange={handleChange}
                    placeholder="Describí el evento..."
                    isInvalid={!!fieldErrors.detalle}
                    maxLength={2000}
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.detalle}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* ── Fotos ── */}
              <Col xs={12}>
                <Form.Label style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                  Fotos (máx. {MAX_PHOTOS}) — {totalPhotos}/{MAX_PHOTOS}
                </Form.Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: availableSlots > 0 ? "0.75rem" : 0 }}>
                  {/* Fotos existentes (edición) */}
                  {existingPhotos.map((f) => (
                    <div key={f.path} style={{ position: "relative", width: 100, height: 100 }}>
                      <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                      <button type="button" onClick={() => removeExistingPhoto(f.path)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.65)", border: "none", borderRadius: "50%", width: 22, height: 22, color: "#fff", cursor: "pointer", fontSize: "0.75rem", lineHeight: 1 }}>✕</button>
                    </div>
                  ))}
                  {/* Previews nuevas */}
                  {previews.map((p, i) => (
                    <div key={i} style={{ position: "relative", width: 100, height: 100 }}>
                      <img src={p.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10, opacity: 0.85 }} />
                      <button type="button" onClick={() => removeNewFile(i)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.65)", border: "none", borderRadius: "50%", width: 22, height: 22, color: "#fff", cursor: "pointer", fontSize: "0.75rem", lineHeight: 1 }}>✕</button>
                      <span style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "0.6rem", borderRadius: 4, padding: "1px 5px", whiteSpace: "nowrap" }}>nueva</span>
                    </div>
                  ))}
                  {/* Botón agregar */}
                  {availableSlots > 0 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} style={{ width: 100, height: 100, borderRadius: 10, border: "2px dashed var(--cv-border)", background: "transparent", cursor: "pointer", color: "var(--cv-text-secondary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, fontSize: "0.7rem" }}>
                      <span style={{ fontSize: "1.4rem" }}>+</span>
                      Agregar
                    </button>
                  )}
                </div>
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <Form.Text style={{ fontSize: "0.75rem", color: "var(--cv-text-secondary)" }}>
                  JPG, PNG o WebP · Máx. 5 MB por imagen
                </Form.Text>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal} disabled={submitting} style={{ borderRadius: "100px" }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} style={{ background: "var(--cv-gold)", border: "none", borderRadius: "100px", fontWeight: 600 }}>
              {submitting ? <><Spinner size="sm" className="me-2" />Guardando...</> : (editing ? "Guardar cambios" : "Crear evento")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
