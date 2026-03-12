import { useEffect, useRef, useState } from "react";
import {
  Row, Col, Button, Modal, Form, Alert, Spinner,
} from "react-bootstrap";
import {
  getInsumos,
  addInsumo,
  updateInsumo,
  deleteInsumo,
} from "../../services/firebase/insumosService";
import { validateInsumoForm, validateImageFile } from "../../shared/utils/validators";

const MAQUINAS = ["Algodón de azúcar", "Pochoclos", "Ambas"];

const SEED_INSUMOS = [
  {
    nombre: "Palitos para algodón de azúcar",
    descripcion: "Palitos de papel food-grade, resistentes y del largo ideal para sostener el copo mientras la máquina gira el azúcar. Vienen en paquetes de alta cantidad para abastecer sesiones de trabajo continuas.",
    precio: 1200,
    maquina: "Algodón de azúcar",
  },
  {
    nombre: "Azúcar para algodón",
    descripcion: "Azúcar granulada especial para máquinas de algodón de azúcar, con el tamaño de grano y la pureza óptimos para lograr hilos finos y un copo esponjoso. Disponible en varios colores y aromas.",
    precio: 2800,
    maquina: "Algodón de azúcar",
  },
  {
    nombre: "Maíz para pochoclos",
    descripcion: "Granos de maíz pisingallo seleccionados, con alto porcentaje de expansión y cascarilla fina. Producen pochoclos grandes, livianos y de textura uniforme, ideales para las máquinas automáticas.",
    precio: 3500,
    maquina: "Pochoclos",
  },
  {
    nombre: "Mantequilla para pochoclos",
    descripcion: "Mantequilla clarificada de alta calidad, formulada para resistir las altas temperaturas de las pochocleras sin humear en exceso. Aporta el sabor clásico y el acabado brillante que diferencia a un buen pochoclo.",
    precio: 4200,
    maquina: "Pochoclos",
  },
  {
    nombre: "Jarabe de caramelo",
    descripcion: "Jarabe dulce de caramelo dorado para bañar los pochoclos. Su consistencia permite una cobertura pareja sin endurecer demasiado, creando una capa crocante y deliciosa que encanta a chicos y adultos.",
    precio: 3800,
    maquina: "Pochoclos",
  },
  {
    nombre: "Jarabe de chocolate",
    descripcion: "Jarabe de cacao intenso para crear pochoclos con cobertura de chocolate. Fácil de aplicar en caliente, se adhiere de forma uniforme a los granos y solidifica rápido con un acabado brillante irresistible.",
    precio: 3800,
    maquina: "Pochoclos",
  },
  {
    nombre: "Jarabe de frutilla",
    descripcion: "Jarabe de frutilla natural con aroma frutal intenso para darle un toque diferente a tus pochoclos. Ideal para atraer a un público más amplio y ofrecer variedad en el menú de la máquina.",
    precio: 3800,
    maquina: "Pochoclos",
  },
];

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  precio: "",
  cantidad: "",
  maquina: "Algodón de azúcar",
  imagenURL: "",
  imagenPath: "",
};

function formatPrice(value) {
  const n = Number(value);
  if (!n && n !== 0) return "-";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

export default function InsumosAdmin() {
  const [insumos, setInsumos] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const fileInputRef = useRef(null);

  const loadInsumos = async () => {
    setFetching(true);
    try {
      setInsumos(await getInsumos());
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { loadInsumos(); }, []);

  // ── Modal helpers ──────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      nombre: item.nombre ?? "",
      descripcion: item.descripcion ?? "",
      precio: item.precio ?? "",
      cantidad: item.cantidad ?? "",
      maquina: MAQUINAS.includes(item.maquina) ? item.maquina : MAQUINAS[0],
      imagenURL: item.imagenURL ?? "",
      imagenPath: item.imagenPath ?? "",
    });
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ok, errors } = validateInsumoForm({ ...form });
    if (!ok) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        await updateInsumo(editing.id, form, imageFile);
      } else {
        await addInsumo(form, imageFile);
      }
      closeModal();
      await loadInsumos();
    } catch (err) {
      console.error(err);
      setFormError("Error al guardar. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };
  // ── Seed demo data ────────────────────────────────────────────
  const handleSeed = async () => {
    if (!window.confirm(`¿Subir los ${SEED_INSUMOS.length} insumos de ejemplo a Firestore?\nEsto crea nuevos documentos (sin imagen).`)) return;
    setSeeding(true);
    try {
      for (const item of SEED_INSUMOS) {
        await addInsumo(item, null);
      }
      await loadInsumos();
      alert("¡Insumos de ejemplo cargados correctamente!");
    } catch (err) {
      console.error(err);
      alert("Error al seedear: " + err.message);
    } finally {
      setSeeding(false);
    }
  };
  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.nombre}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(item.id);
    try {
      await deleteInsumo(item.id, item.imagenPath);
      await loadInsumos();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el insumo.");
    } finally {
      setDeleting(null);
    }
  };

  const currentPreview = imagePreview || (editing ? form.imagenURL : null);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Insumos</h1>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="outline-secondary"
            style={{ borderColor: "var(--cv-border)", color: "var(--cv-text-secondary)", fontSize: "0.85rem" }}
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? <><Spinner size="sm" className="me-1" />Subiendo...</> : "🌱 Cargar insumos de ejemplo"}
          </Button>
          <Button className="admin-btn-primary" onClick={openAdd}>
            + Nuevo insumo
          </Button>
        </div>
      </div>

      {fetching ? (
        <div className="text-center py-5">
          <Spinner style={{ color: "var(--cv-gold)" }} />
        </div>
      ) : insumos.length === 0 ? (
        <div className="admin-empty-state">
          <p>Todavía no hay insumos cargados.</p>
          <Button className="admin-btn-primary" onClick={openAdd}>
            Agregar el primero
          </Button>
        </div>
      ) : (
        <Row className="g-3">
          {insumos.map((item) => (
            <Col key={item.id} xs={12} sm={6} xl={4}>
              <div className="admin-machine-card">
                {item.imagenURL ? (
                  <img
                    src={item.imagenURL}
                    alt={item.nombre}
                    className="admin-machine-img"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="admin-machine-img"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--cv-card-bg)",
                      color: "var(--cv-text-secondary)",
                      fontSize: "2rem",
                    }}
                  >
                    📦
                  </div>
                )}

                <div className="admin-machine-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <p className="admin-machine-name" style={{ margin: 0 }}>{item.nombre}</p>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: item.maquina === "Algodón de azúcar" ? "#d63384" : item.maquina === "Pochoclos" ? "#f5a524" : "#6b7280",
                        background: item.maquina === "Algodón de azúcar" ? "rgba(214,51,132,0.1)" : item.maquina === "Pochoclos" ? "rgba(245,165,36,0.1)" : "rgba(107,114,128,0.1)",
                        borderRadius: "999px",
                        padding: "0.15rem 0.55rem",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {item.maquina}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.82rem", color: "var(--cv-text-secondary)", margin: "0.4rem 0 0.6rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.descripcion}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", margin: "0 0 0.75rem" }}>
                    <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--cv-gold)", margin: 0 }}>
                      {formatPrice(item.precio)}
                    </p>
                    {item.cantidad && (
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--cv-text-secondary)", background: "var(--cv-border)", borderRadius: "999px", padding: "0.15rem 0.55rem", whiteSpace: "nowrap" }}>
                        {item.cantidad}
                      </span>
                    )}
                  </div>

                  <div className="admin-machine-actions">
                    <Button
                      size="sm"
                      className="admin-btn-edit"
                      onClick={() => openEdit(item)}
                      disabled={deleting === item.id}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      className="admin-btn-delete"
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item.id}
                    >
                      {deleting === item.id ? <Spinner size="sm" /> : "Eliminar"}
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* ── Modal ── */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        backdrop={submitting ? "static" : true}
      >
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>
            {editing ? "Editar insumo" : "Nuevo insumo"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="py-2">{formError}</Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                name="nombre"
                value={form.nombre}
                onChange={handleFormChange}
                disabled={submitting}
                className="admin-input"
                placeholder="ej. Azúcar para algodón"
                isInvalid={!!fieldErrors.nombre}
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.nombre}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Máquina *</Form.Label>
              <Form.Select
                name="maquina"
                value={form.maquina}
                onChange={handleFormChange}
                disabled={submitting}
                className="admin-input"
                isInvalid={!!fieldErrors.maquina}
              >
                {MAQUINAS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{fieldErrors.maquina}</Form.Control.Feedback>
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
                placeholder="Breve descripción del insumo..."
                isInvalid={!!fieldErrors.descripcion}
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.descripcion}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Precio{" "}
                <small style={{ color: "var(--cv-text-secondary)", fontWeight: 400 }}>(ARS, sin símbolos)</small>
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="1"
                name="precio"
                value={form.precio}
                onChange={handleFormChange}
                disabled={submitting}
                className="admin-input"
                placeholder="ej. 1500"
                isInvalid={!!fieldErrors.precio}
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.precio}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Cantidad / Peso{" "}
                <small style={{ color: "var(--cv-text-secondary)", fontWeight: 400 }}>(ej. 1 kg, 500 ml, 100 unidades)</small>
              </Form.Label>
              <Form.Control
                type="text"
                name="cantidad"
                value={form.cantidad}
                onChange={handleFormChange}
                disabled={submitting}
                className="admin-input"
                placeholder="ej. 500 g"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>
                Imagen{" "}
                {editing && (
                  <small style={{ color: "var(--cv-text-secondary)", fontWeight: 400 }}>
                    (dejá vacío para mantener la actual)
                  </small>
                )}
              </Form.Label>

              {currentPreview && (
                <img
                  src={currentPreview}
                  alt="Vista previa"
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
                <><Spinner size="sm" className="me-2" />Guardando...</>
              ) : editing ? (
                "Guardar cambios"
              ) : (
                "Agregar insumo"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
