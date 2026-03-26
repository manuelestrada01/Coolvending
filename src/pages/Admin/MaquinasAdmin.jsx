import { useEffect, useRef, useState } from "react";
import {
  Row,
  Col,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  getMaquinas,
  addMaquina,
  updateMaquina,
  deleteMaquina,
  removeImage,
} from "../../services/firebase/maquinas";
import { validateMaquinaForm, validateImageFile } from "../../shared/utils/validators";
import AlgodonM  from "../../app/assets/images/models/algodonM.png";
import AlgodonM2 from "../../app/assets/images/models/algodonM2.png";
import AlgodonM3 from "../../app/assets/images/models/algodonM3.png";
import AlgodonM4 from "../../app/assets/images/models/algodonM4_s.png";
import AlgodonM5 from "../../app/assets/images/models/algodonM5.png";
import PororoM   from "../../app/assets/images/models/pororoM.png";

const CATEGORIAS = ["Algodón de azúcar", "Café", "Pochoclo", "Globos", "Expendedoras"];

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  categoria: "Algodón de azúcar",
  badge: "",
  tags: [],
  imagenURL: "",
  imagenPath: "",
};

const SEED_MACHINES = [
  { image: AlgodonM,  nombre: "CloudMaker Pro",  badge: "Más vendido",      tags: ["Automática", "Alta capacidad", "WiFi"],        categoria: "Algodón de azúcar", descripcion: "Máquina automática de alta capacidad con conectividad WiFi integrada." },
  { image: AlgodonM2, nombre: "SugarCube Mini",  badge: "Compacta",          tags: ["Portátil", "Silenciosa", "Fácil uso"],          categoria: "Algodón de azúcar", descripcion: "Versión compacta y portátil, ideal para espacios reducidos." },
  { image: AlgodonM3, nombre: "Artisan All",     badge: "Premium",            tags: ["Táctil", "Multi-función", "Pro"],               categoria: "Algodón de azúcar", descripcion: "Modelo premium con pantalla táctil y múltiples funciones avanzadas." },
  { image: AlgodonM4, nombre: "CloudMaker Lite", badge: "Nuevo",              tags: ["Liviana", "Económica", "Plug & Play"],          categoria: "Algodón de azúcar", descripcion: "Versión Lite liviana y económica, lista para usar desde el primer momento." },
  { image: AlgodonM5, nombre: "CubeMini Pro",    badge: "Best value",         tags: ["Auto-limpieza", "Autonomía", "Eficiente"],      categoria: "Pochoclo", descripcion: "Compacta con sistema de auto-limpieza y alta eficiencia energética." },
  { image: PororoM,   nombre: "Artisan Event",   badge: "Edición especial",   tags: ["Alta producción", "LED", "Eventos"],           categoria: "Algodón de azúcar", descripcion: "Diseñada para eventos de alta producción con iluminación LED integrada." },
];

const MAX_GALERIA = 5;
const MAX_DETALLE = 8;

export default function MaquinasAdmin() {
  const [maquinas, setMaquinas] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Portada
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Galería — archivos nuevos a subir
  const [galeriaFiles, setGaleriaFiles] = useState([]);
  const [galeriaPreviews, setGaleriaPreviews] = useState([]); // {url, isNew, path?}
  // Galería existente que se mantiene (al editar)
  const [galeriaExistente, setGaleriaExistente] = useState([]); // [{url, path}]

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [deleting, setDeleting] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [seeding, setSeeding] = useState(false);

  // Detalle images
  const [detalleFiles, setDetalleFiles] = useState([]);
  const [detallePreviews, setDetallePreviews] = useState([]);
  const [detalleExistente, setDetalleExistente] = useState([]);

  const fileInputRef = useRef(null);
  const galeriaInputRef = useRef(null);
  const detalleInputRef = useRef(null);

  const loadMaquinas = async () => {
    setFetching(true);
    try {
      setMaquinas(await getMaquinas());
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadMaquinas();
  }, []);

  // ── Modal helpers ──────────────────────────────────────────────
  const resetGaleria = () => {
    galeriaPreviews.forEach((p) => { if (p.isNew) URL.revokeObjectURL(p.url); });
    setGaleriaFiles([]);
    setGaleriaPreviews([]);
    setGaleriaExistente([]);
  };

  const resetDetalle = () => {
    detallePreviews.forEach((p) => { if (p.isNew) URL.revokeObjectURL(p.url); });
    setDetalleFiles([]);
    setDetallePreviews([]);
    setDetalleExistente([]);
  };

  const totalDetalle = () => detalleExistente.length + detalleFiles.length;

  const handleDetalleChange = (e) => {
    const files = Array.from(e.target.files);
    const slots = MAX_DETALLE - totalDetalle();
    if (slots <= 0) {
      setFormError(`Ya alcanzaste el máximo de ${MAX_DETALLE} imágenes de detalle.`);
      e.target.value = "";
      return;
    }
    const toAdd = files.slice(0, slots);
    const errors = toAdd.map(validateImageFile).filter(Boolean);
    if (errors.length) {
      setFormError(errors[0]);
      e.target.value = "";
      return;
    }
    const newPreviews = toAdd.map((f) => ({ url: URL.createObjectURL(f), isNew: true }));
    setDetalleFiles((prev) => [...prev, ...toAdd]);
    setDetallePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
    setFormError(null);
  };

  const removeDetalleItem = (index) => {
    const item = detallePreviews[index];
    if (item.isNew) {
      URL.revokeObjectURL(item.url);
      const newIdx = detallePreviews.slice(0, index).filter((p) => p.isNew).length;
      setDetalleFiles((prev) => prev.filter((_, i) => i !== newIdx));
    } else {
      setDetalleExistente((prev) => prev.filter((g) => g.url !== item.url));
    }
    setDetallePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    resetGaleria();
    resetDetalle();
    setFormError(null);
    setFieldErrors({});
    setTagInput("");
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      nombre: m.nombre ?? "",
      descripcion: m.descripcion ?? "",
      categoria: CATEGORIAS.includes(m.categoria) ? m.categoria : CATEGORIAS[0],
      badge: m.badge ?? "",
      tags: m.tags ?? m.caracteristicas ?? [],
      imagenURL: m.imagenURL ?? "",
      imagenPath: m.imagenPath ?? "",
    });
    setImageFile(null);
    setImagePreview(null);
    // Load existing gallery
    const existente = Array.isArray(m.galeria) ? m.galeria : [];
    setGaleriaExistente(existente);
    setGaleriaFiles([]);
    setGaleriaPreviews(existente.map((g) => ({ url: g.url, isNew: false, path: g.path })));
    // Load existing detalle images
    const existenteDetalle = Array.isArray(m.detalleImagenes) ? m.detalleImagenes : [];
    setDetalleExistente(existenteDetalle);
    setDetalleFiles([]);
    setDetallePreviews(existenteDetalle.map((g) => ({ url: g.url, isNew: false, path: g.path })));
    setFormError(null);
    setFieldErrors({});
    setTagInput("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    resetGaleria();
    resetDetalle();
    setShowModal(false);
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
  };

  // ── Form handlers ──────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imgErr = validateImageFile(file);
    if (imgErr) {
      setFormError(imgErr);
      e.target.value = "";
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const totalGaleria = () => galeriaExistente.length + galeriaFiles.length;

  const handleGaleriaChange = (e) => {
    const files = Array.from(e.target.files);
    const slots = MAX_GALERIA - totalGaleria();
    if (slots <= 0) {
      setFormError(`Ya alcanzaste el máximo de ${MAX_GALERIA} fotos en la galería.`);
      e.target.value = "";
      return;
    }
    const toAdd = files.slice(0, slots);
    const errors = toAdd.map(validateImageFile).filter(Boolean);
    if (errors.length) {
      setFormError(errors[0]);
      e.target.value = "";
      return;
    }
    const newPreviews = toAdd.map((f) => ({ url: URL.createObjectURL(f), isNew: true }));
    setGaleriaFiles((prev) => [...prev, ...toAdd]);
    setGaleriaPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
    setFormError(null);
  };

  const removeGaleriaItem = async (index) => {
    const item = galeriaPreviews[index];
    if (item.isNew) {
      // Remove from pending files
      URL.revokeObjectURL(item.url);
      const newIdx = galeriaPreviews.slice(0, index).filter((p) => p.isNew).length;
      setGaleriaFiles((prev) => prev.filter((_, i) => i !== newIdx));
    } else {
      // Mark existing for removal (will be excluded from galeriaExistente)
      setGaleriaExistente((prev) => prev.filter((g) => g.url !== item.url));
      // Optionally delete from storage immediately (best UX: defer to save)
    }
    setGaleriaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { ...form };
    const { ok, errors } = validateMaquinaForm(data);
    if (!ok) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        // Delete removed existing gallery items from storage
        const removedItems = (editing.galeria ?? []).filter(
          (g) => !galeriaExistente.some((e) => e.url === g.url)
        );
        for (const item of removedItems) {
          await removeImage(item.path);
        }
        // Delete removed detalle items from storage
        const removedDetalle = (editing.detalleImagenes ?? []).filter(
          (g) => !detalleExistente.some((e) => e.url === g.url)
        );
        for (const item of removedDetalle) {
          await removeImage(item.path);
        }
        await updateMaquina(editing.id, data, imageFile, galeriaFiles, galeriaExistente, detalleFiles, detalleExistente);
      } else {
        await addMaquina(data, imageFile, galeriaFiles, detalleFiles);
      }

      closeModal();
      await loadMaquinas();
    } catch (err) {
      console.error(err);
      setFormError("Error al guardar. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (m) => {
    if (!window.confirm(`¿Eliminar "${m.nombre}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(m.id);
    try {
      await deleteMaquina(m.id, m.imagenPath, m.galeria ?? [], m.detalleImagenes ?? []);
      await loadMaquinas();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la máquina.");
    } finally {
      setDeleting(null);
    }
  };

  // ── Seed demo data ────────────────────────────────────────────
  const handleSeed = async () => {
    if (!window.confirm(`¿Subir las ${SEED_MACHINES.length} máquinas de ejemplo a Firestore?\nEsto crea nuevos documentos con sus imágenes.`)) return;
    setSeeding(true);
    try {
      for (const m of SEED_MACHINES) {
        const resp = await fetch(m.image);
        const blob = await resp.blob();
        const ext = blob.type.split("/")[1] || "png";
        const file = new File([blob], `${m.nombre}.${ext}`, { type: blob.type });
        await addMaquina(
          { nombre: m.nombre, categoria: m.categoria, descripcion: m.descripcion, badge: m.badge, tags: m.tags },
          file
        );
      }
      await loadMaquinas();
      alert("¡Máquinas subidas correctamente!");
    } catch (err) {
      console.error(err);
      alert("Error al seedear: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  const currentPreview = imagePreview || (editing?.imagenURL ?? form.imagenURL);
  const galeriaSlots = MAX_GALERIA - totalGaleria();
  const detalleSlots = MAX_DETALLE - totalDetalle();

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Máquinas</h1>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="outline-secondary"
            style={{ borderColor: "var(--cv-border)", color: "var(--cv-text-secondary)", fontSize: "0.85rem" }}
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? <><Spinner size="sm" className="me-1" />Subiendo...</> : "🌱 Cargar máquinas de ejemplo"}
          </Button>
          <Button className="admin-btn-primary" onClick={openAdd}>
            + Nueva máquina
          </Button>
        </div>
      </div>

      {fetching ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" style={{ color: "var(--cv-gold)" }} />
        </div>
      ) : maquinas.length === 0 ? (
        <div className="admin-empty-state">
          <span className="admin-empty-icon">🏭</span>
          <p style={{ marginBottom: "1rem" }}>No hay máquinas cargadas todavía.</p>
          <Button className="admin-btn-primary" onClick={openAdd}>
            Agregar primera máquina
          </Button>
        </div>
      ) : (
        <Row className="g-3">
          {maquinas.map((m) => (
            <Col key={m.id} xs={12} sm={6} lg={4}>
              <div className="admin-maquina-card">
                {m.imagenURL ? (
                  <img
                    src={m.imagenURL}
                    alt={m.nombre}
                    className="admin-maquina-img"
                  />
                ) : (
                  <div className="admin-maquina-placeholder">📷</div>
                )}
                {Array.isArray(m.galeria) && m.galeria.length > 0 && (
                  <div style={{ display: "flex", gap: 4, padding: "6px 8px", background: "var(--cv-card-bg)", flexWrap: "wrap" }}>
                    {m.galeria.map((g, i) => (
                      <img
                        key={i}
                        src={g.url}
                        alt={`galería ${i + 1}`}
                        style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid var(--cv-border)" }}
                      />
                    ))}
                  </div>
                )}
                <div className="admin-maquina-body">
                  <p className="admin-maquina-name">{m.nombre}</p>
                  <span className="admin-maquina-badge">{m.categoria}</span>
                  <div className="admin-maquina-actions">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      style={{ flex: 1, fontSize: "0.82rem", borderColor: "var(--cv-border)", color: "var(--cv-text-primary)" }}
                      onClick={() => openEdit(m)}
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      style={{ flex: 1, fontSize: "0.82rem" }}
                      disabled={deleting === m.id}
                      onClick={() => handleDelete(m)}
                    >
                      {deleting === m.id ? <Spinner size="sm" /> : "🗑 Eliminar"}
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* ─── Add / Edit Modal ─────────────────────────────────── */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        className="admin-modal"
        backdrop={submitting ? "static" : true}
      >
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>
            {editing ? "Editar máquina" : "Nueva máquina"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="py-2">
                {formError}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                name="nombre"
                value={form.nombre}
                onChange={handleFormChange}
                disabled={submitting}
                className="admin-input"
                placeholder="ej. Snack Master 300"
                isInvalid={!!fieldErrors.nombre}
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.nombre}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Categoría *</Form.Label>
              <Form.Select
                name="categoria"
                value={form.categoria}
                onChange={handleFormChange}
                disabled={submitting}
                className="admin-input"
                isInvalid={!!fieldErrors.categoria}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{fieldErrors.categoria}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={form.descripcion}
                onChange={handleFormChange}
                disabled={submitting}
                className="admin-input"
                placeholder="Descripción de la máquina..."
                isInvalid={!!fieldErrors.descripcion}
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.descripcion}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Badge{" "}
                <small style={{ color: "var(--cv-text-secondary)", fontWeight: 400 }}>
                  (ej: Más vendido, Nuevo, Premium)
                </small>
              </Form.Label>
              <Form.Control
                name="badge"
                value={form.badge}
                onChange={handleFormChange}
                disabled={submitting}
                className="admin-input"
                placeholder="ej. Más vendido"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Tags{" "}
                <small style={{ color: "var(--cv-text-secondary)", fontWeight: 400 }}>
                  (máx. 3 · aparecen como etiquetas en el catálogo)
                </small>
              </Form.Label>
              {form.tags.length > 0 && (
                <div className="admin-tag-list mb-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="admin-tag">
                      {tag}
                      <button
                        type="button"
                        className="admin-tag-remove"
                        disabled={submitting}
                        onClick={() => setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {form.tags.length < 3 && (
                <div className="d-flex gap-2">
                  <Form.Control
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const t = tagInput.trim();
                        if (t && form.tags.length < 3 && !form.tags.includes(t)) {
                          setForm((prev) => ({ ...prev, tags: [...prev.tags, t] }));
                          setTagInput("");
                        }
                      }
                    }}
                    disabled={submitting}
                    className="admin-input"
                    placeholder="ej. Automática — Enter para agregar"
                  />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    style={{ borderColor: "var(--cv-border)", color: "var(--cv-text-primary)", flexShrink: 0 }}
                    disabled={submitting || !tagInput.trim() || form.tags.length >= 3}
                    onClick={() => {
                      const t = tagInput.trim();
                      if (t && form.tags.length < 3 && !form.tags.includes(t)) {
                        setForm((prev) => ({ ...prev, tags: [...prev.tags, t] }));
                        setTagInput("");
                      }
                    }}
                  >
                    +
                  </Button>
                </div>
              )}
            </Form.Group>

            {/* ── Foto portada ── */}
            <Form.Group className="mb-3">
              <Form.Label>
                Foto portada{" "}
                {editing && (
                  <small style={{ color: "var(--cv-text-secondary)", fontWeight: 400 }}>
                    (dejá vacío para mantener la actual)
                  </small>
                )}
              </Form.Label>

              {currentPreview && (
                <img
                  src={currentPreview}
                  alt="Vista previa portada"
                  className="admin-image-preview d-block"
                />
              )}

              <Form.Control
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                disabled={submitting}
                className="admin-input"
              />
            </Form.Group>

            {/* ── Galería (hasta 5 fotos) ── */}
            <Form.Group className="mb-2">
              <Form.Label>
                Galería{" "}
                <small style={{ color: "var(--cv-text-secondary)", fontWeight: 400 }}>
                  ({totalGaleria()}/{MAX_GALERIA} fotos · se muestran en la página del modelo)
                </small>
              </Form.Label>

              {galeriaPreviews.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {galeriaPreviews.map((p, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img
                        src={p.url}
                        alt={`galería ${i + 1}`}
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "2px solid var(--cv-border)",
                        }}
                      />
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => removeGaleriaItem(i)}
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: "none",
                          background: "#d63384",
                          color: "#fff",
                          fontSize: 12,
                          lineHeight: "20px",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label="Quitar foto"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {galeriaSlots > 0 && (
                <>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    ref={galeriaInputRef}
                    onChange={handleGaleriaChange}
                    disabled={submitting}
                    className="admin-input"
                  />
                  <Form.Text style={{ color: "var(--cv-text-secondary)" }}>
                    Podés seleccionar hasta {galeriaSlots} foto{galeriaSlots !== 1 ? "s" : ""} más
                  </Form.Text>
                </>
              )}
            </Form.Group>
            {/* ── Imágenes de detalle (hasta 8) ── */}
            <Form.Group className="mb-2">
              <Form.Label>
                Imágenes de detalle{" "}
                <small style={{ color: "var(--cv-text-secondary)", fontWeight: 400 }}>
                  ({totalDetalle()}/{MAX_DETALLE} · aparecen en la sección "Más detalle" del modelo)
                </small>
              </Form.Label>

              {detallePreviews.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {detallePreviews.map((p, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img
                        src={p.url}
                        alt={`detalle ${i + 1}`}
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "2px solid var(--cv-border)",
                        }}
                      />
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => removeDetalleItem(i)}
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: "none",
                          background: "#d63384",
                          color: "#fff",
                          fontSize: 12,
                          lineHeight: "20px",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label="Quitar imagen de detalle"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {detalleSlots > 0 && (
                <>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    ref={detalleInputRef}
                    onChange={handleDetalleChange}
                    disabled={submitting}
                    className="admin-input"
                  />
                  <Form.Text style={{ color: "var(--cv-text-secondary)" }}>
                    Podés seleccionar hasta {detalleSlots} imagen{detalleSlots !== 1 ? "es" : ""} más
                  </Form.Text>
                </>
              )}
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={closeModal}
              disabled={submitting}
              style={{ borderColor: "var(--cv-border)", background: "transparent", color: "var(--cv-text-primary)" }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="admin-btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Guardando...
                </>
              ) : editing ? (
                "Guardar cambios"
              ) : (
                "Agregar máquina"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
