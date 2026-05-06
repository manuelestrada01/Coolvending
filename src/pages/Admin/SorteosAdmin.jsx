import { useEffect, useState, useCallback, useRef } from "react";
import { Row, Col, Button, Form, Alert, Spinner, Badge, Modal } from "react-bootstrap";
import SorteoVivo from "./SorteoVivo";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../services/firebase/firebase";
import {
  getSorteoConfig,
  setSorteoConfig,
  getParticipantes,
  eliminarParticipante,
  agregarParticipanteManual,
  sortearGanador,
  limpiarGanador,
  eliminarSorteo,
} from "../../services/firebase/sorteosService";

const DEFAULT_PREMIOS = [
  { lugar: 1, descripcion: "", detalle: "", imagen: "" },
  { lugar: 2, descripcion: "", detalle: "", imagen: "" },
  { lugar: 3, descripcion: "", detalle: "", imagen: "" },
  { lugar: 4, descripcion: "", detalle: "", imagen: "" },
  { lugar: 5, descripcion: "", detalle: "", imagen: "" },
];

const EMPTY_CONFIG = {
  titulo: "Sorteo CoolVending",
  activo: false,
  fechaInicio: "",
  fechaFin: "",
  linkVivo: "",
  premios: DEFAULT_PREMIOS,
};

export default function SorteosAdmin() {
  const [config, setConfig] = useState(EMPTY_CONFIG);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [sorteando, setSorteando] = useState(false);
  const [ganadorModal, setGanadorModal] = useState(false);
  const [nuevoGanador, setNuevoGanador] = useState(null);
  const [error, setError] = useState(null);
  const [manualNombre, setManualNombre] = useState("");
  const [manualOp, setManualOp] = useState("");
  const [addingManual, setAddingManual] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Confirm modal ──────────────────────────────────────────────────────────
  const [confirmState, setConfirmState] = useState({ open: false, msg: "", danger: false, onConfirm: null });
  const openConfirm = (msg, onConfirm, danger = false) =>
    setConfirmState({ open: true, msg, danger, onConfirm });
  const closeConfirm = () => setConfirmState((s) => ({ ...s, open: false }));
  const handleConfirmOk = () => { closeConfirm(); confirmState.onConfirm?.(); };

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, parts] = await Promise.all([
        getSorteoConfig(),
        getParticipantes(),
      ]);
      if (cfg) setConfig({ ...EMPTY_CONFIG, ...cfg });
      setParticipantes(parts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    setError(null);
    try {
      await setSorteoConfig({
        titulo: config.titulo,
        activo: config.activo,
        fechaInicio: config.fechaInicio,
        fechaFin: config.fechaFin,
        linkVivo: config.linkVivo,
        premios: config.premios ?? DEFAULT_PREMIOS,
      });
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2500);
    } catch {
      setError("Error al guardar configuración.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleEliminar = (id, nombre) => {
    openConfirm(`¿Eliminar a ${nombre} de la lista?`, async () => {
      try {
        await eliminarParticipante(id);
        setParticipantes((prev) => prev.filter((p) => p.id !== id));
      } catch {
        setError("Error al eliminar participante.");
      }
    }, true);
  };

  const handleSortear = () => {
    openConfirm("¿Sortear un ganador entre los participantes aprobados?", async () => {
      setSorteando(true);
      setError(null);
      try {
        const ganador = await sortearGanador();
        setNuevoGanador(ganador);
        setGanadorModal(true);
        cargar();
      } catch (err) {
        setError(err.message || "Error al sortear.");
      } finally {
        setSorteando(false);
      }
    });
  };

  const handleLimpiarGanador = () => {
    openConfirm("¿Eliminar el ganador actual? Esto lo limpia del sitio público.", async () => {
      await limpiarGanador();
      cargar();
    }, true);
  };

  const handleAgregarManual = async (e) => {
    e.preventDefault();
    setAddingManual(true);
    setError(null);
    try {
      await agregarParticipanteManual({ nombre: manualNombre, operacionId: manualOp });
      setManualNombre("");
      setManualOp("");
      cargar();
    } catch (err) {
      setError(err.message || "Error al agregar participante.");
    } finally {
      setAddingManual(false);
    }
  };

  const handleEliminarSorteo = () => {
    openConfirm(
      `¿Eliminar el sorteo completo? Esto borrará la configuración y TODOS los participantes (${participantes.length}). Esta acción no se puede deshacer.`,
      async () => {
        setDeleting(true);
        try {
          await eliminarSorteo();
          setConfig(EMPTY_CONFIG);
          setParticipantes([]);
        } catch {
          setError("Error al eliminar el sorteo.");
        } finally {
          setDeleting(false);
        }
      },
      true
    );
  };

  const [modoVivo, setModoVivo] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const fileInputRefs = useRef([]);

  const handleUploadImagen = async (file, idx) => {
    setUploadingIdx(idx);
    try {
      const lugar = (config.premios ?? DEFAULT_PREMIOS)[idx].lugar;
      const ext = file.name.split(".").pop();
      const path = `sorteos/premios/premio_${lugar}_${Date.now()}.${ext}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      setConfig((c) => {
        const premios = [...(c.premios ?? DEFAULT_PREMIOS)];
        premios[idx] = { ...premios[idx], imagen: url };
        return { ...c, premios };
      });
    } catch {
      setError("Error al subir imagen.");
    } finally {
      setUploadingIdx(null);
    }
  };

  const aprobados = participantes.filter((p) => p.estado === "aprobado");

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" style={{ color: "#d63384" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 style={{ fontWeight: 700, margin: 0 }}>Gestión de Sorteos</h2>
        <div className="d-flex align-items-center gap-2" style={{ flexWrap: "wrap" }}>
          <Badge
            style={{
              background: config.activo ? "linear-gradient(135deg,#d63384,#f5a524)" : "#6c757d",
              fontSize: "0.85rem",
              padding: "0.5em 1em",
            }}
          >
            {config.activo ? "ACTIVO" : "INACTIVO"}
          </Badge>
          <Button
            onClick={() => setModoVivo(true)}
            disabled={!config.activo || aprobados.length === 0 || !config.premios?.some(p => p.descripcion)}
            style={{
              background: "linear-gradient(135deg,#d63384,#f5a524)",
              border: "none",
              fontWeight: 700,
              fontSize: "0.88rem",
              padding: "0.45rem 1.1rem",
            }}
            title={
              !config.activo
                ? "Activa el sorteo primero"
                : aprobados.length === 0
                ? "No hay participantes aprobados"
                : "Abrir pantalla de sorteo en vivo"
            }
          >
            🎬 Modo Vivo
          </Button>
          <Button
            size="sm"
            variant="outline-danger"
            disabled={deleting}
            onClick={handleEliminarSorteo}
            style={{ fontWeight: 600, fontSize: "0.8rem" }}
          >
            {deleting ? <Spinner size="sm" animation="border" /> : "Eliminar sorteo"}
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {configSaved && <Alert variant="success">Configuración guardada.</Alert>}

      {/* ─── Config ─────────────────────────────────── */}
      <div className="admin-section mb-5">
        <h5 style={{ fontWeight: 700, marginBottom: "1.25rem", color: "var(--cv-text-primary)" }}>
          Configuración del sorteo
        </h5>
        <Form onSubmit={handleSaveConfig}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, fontSize: "0.88rem" }}>Título</Form.Label>
                <Form.Control
                  value={config.titulo}
                  onChange={(e) => setConfig((c) => ({ ...c, titulo: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, fontSize: "0.88rem" }}>Fecha de inicio</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={config.fechaInicio}
                  onChange={(e) => setConfig((c) => ({ ...c, fechaInicio: e.target.value }))}
                />
                <Form.Text style={{ fontSize: "0.78rem", color: "var(--cv-text-secondary)" }}>
                  Solo se aceptan pagos realizados a partir de esta fecha.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, fontSize: "0.88rem" }}>Fecha de finalización</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={config.fechaFin}
                  onChange={(e) => setConfig((c) => ({ ...c, fechaFin: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, fontSize: "0.88rem" }}>Link del vivo (Instagram)</Form.Label>
                <Form.Control
                  type="url"
                  value={config.linkVivo}
                  onChange={(e) => setConfig((c) => ({ ...c, linkVivo: e.target.value }))}
                  placeholder="https://www.instagram.com/coolvending.ar"
                />
                <Form.Text style={{ fontSize: "0.78rem", color: "var(--cv-text-secondary)" }}>
                  Se muestra en la página pública del sorteo.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Check
                type="switch"
                id="sorteo-activo"
                label="Sorteo activo (los usuarios pueden inscribirse)"
                checked={config.activo}
                onChange={(e) => setConfig((c) => ({ ...c, activo: e.target.checked }))}
              />
            </Col>

            {/* ─── Premios ─── */}
            <Col md={12}>
              <div style={{ borderTop: "1px solid var(--cv-border)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", margin: 0, color: "var(--cv-text-primary)" }}>
                    Premios del sorteo
                  </p>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    style={{ fontSize: "0.8rem", fontWeight: 600 }}
                    onClick={() => setConfig((c) => {
                      const premios = c.premios ?? DEFAULT_PREMIOS;
                      return { ...c, premios: [...premios, { lugar: premios.length + 1, descripcion: "" }] };
                    })}
                  >
                    + Agregar premio
                  </Button>
                </div>
                <Row className="g-2">
                  {(config.premios ?? DEFAULT_PREMIOS).map((p, i) => (
                    <Col md={6} key={i}>
                      <div
                        style={{
                          border: "1px solid var(--cv-border)",
                          borderRadius: 10,
                          padding: "0.75rem",
                          background: "var(--cv-card-bg)",
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--cv-text-secondary)" }}>
                            {p.lugar}° lugar
                          </span>
                          {i >= 5 && (
                            <button
                              type="button"
                              onClick={() => setConfig((c) => {
                                const premios = (c.premios ?? DEFAULT_PREMIOS).filter((_, idx) => idx !== i)
                                  .map((pr, idx) => ({ ...pr, lugar: idx + 1 }));
                                return { ...c, premios };
                              })}
                              style={{ background: "none", border: "none", color: "#dc3545", fontSize: "0.75rem", cursor: "pointer", padding: "0 4px" }}
                            >
                              ✕ quitar
                            </button>
                          )}
                        </div>

                        {/* Miniatura */}
                        <div className="d-flex align-items-center gap-2 mb-2">
                          {p.imagen ? (
                            <img
                              src={p.imagen}
                              alt={`Premio ${p.lugar}`}
                              style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, border: "1px solid var(--cv-border)", flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 52, height: 52, borderRadius: 8,
                                border: "1.5px dashed var(--cv-border)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "var(--cv-text-secondary)", fontSize: "1.3rem", flexShrink: 0,
                              }}
                            >
                              🖼️
                            </div>
                          )}
                          <div className="d-flex flex-column gap-1" style={{ flex: 1 }}>
                            <input
                              ref={(el) => (fileInputRefs.current[i] = el)}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadImagen(file, i);
                                e.target.value = "";
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline-secondary"
                              disabled={uploadingIdx === i}
                              style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.6rem" }}
                              onClick={() => fileInputRefs.current[i]?.click()}
                            >
                              {uploadingIdx === i ? <Spinner size="sm" animation="border" /> : p.imagen ? "Cambiar foto" : "Subir foto"}
                            </Button>
                            {p.imagen && (
                              <button
                                type="button"
                                style={{ background: "none", border: "none", color: "#dc3545", fontSize: "0.72rem", cursor: "pointer", textAlign: "left", padding: 0 }}
                                onClick={() => setConfig((c) => {
                                  const premios = [...(c.premios ?? DEFAULT_PREMIOS)];
                                  premios[i] = { ...premios[i], imagen: "" };
                                  return { ...c, premios };
                                })}
                              >
                                ✕ quitar foto
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Nombre */}
                        <Form.Control
                          size="sm"
                          value={p.descripcion}
                          placeholder={`Premio para el ${p.lugar}° puesto`}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((c) => {
                              const premios = [...(c.premios ?? DEFAULT_PREMIOS)];
                              premios[i] = { ...premios[i], descripcion: val };
                              return { ...c, premios };
                            });
                          }}
                        />
                        {/* Detalle opcional */}
                        <Form.Control
                          as="textarea"
                          size="sm"
                          rows={2}
                          value={p.detalle ?? ""}
                          placeholder="Descripción opcional (se muestra en el popup)"
                          className="mt-2"
                          style={{ fontSize: "0.8rem", resize: "none" }}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((c) => {
                              const premios = [...(c.premios ?? DEFAULT_PREMIOS)];
                              premios[i] = { ...premios[i], detalle: val };
                              return { ...c, premios };
                            });
                          }}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>
          </Row>
          <Button
            type="submit"
            className="mt-3"
            disabled={savingConfig}
            style={{ background: "linear-gradient(135deg,#d63384,#f5a524)", border: "none", fontWeight: 700 }}
          >
            {savingConfig ? <Spinner size="sm" animation="border" /> : "Guardar configuración"}
          </Button>
        </Form>
      </div>

      {/* ─── Winner ─────────────────────────────────── */}
      {config.ganador && (
        <div
          className="mb-5 p-4"
          style={{
            background: "linear-gradient(135deg,#d63384,#f5a524)",
            borderRadius: 16,
            color: "#fff",
          }}
        >
          <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.8 }}>
            Ganador sorteado
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{config.ganador.nombre}</div>
          <div style={{ fontFamily: "monospace", opacity: 0.85, fontSize: "0.9rem" }}>
            Op. #{config.ganador.operacionId}
          </div>
          <Button
            variant="outline-light"
            size="sm"
            className="mt-3"
            onClick={handleLimpiarGanador}
          >
            Limpiar ganador
          </Button>
        </div>
      )}

      {/* ─── Sortear ────────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-5">
        <Button
          onClick={handleSortear}
          disabled={sorteando || aprobados.length === 0}
          style={{ background: "linear-gradient(135deg,#d63384,#f5a524)", border: "none", fontWeight: 700, padding: "0.6rem 1.5rem" }}
        >
          {sorteando ? <Spinner size="sm" animation="border" /> : "🎲 Sortear ganador"}
        </Button>
        <span style={{ fontSize: "0.85rem", color: "var(--cv-text-secondary)" }}>
          {aprobados.length} participante{aprobados.length !== 1 ? "s" : ""} aprobado{aprobados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ─── Add manual participant ───────────────────── */}
      <div className="admin-section mb-5">
        <h5 style={{ fontWeight: 700, marginBottom: "1.25rem", color: "var(--cv-text-primary)" }}>
          Agregar participante manualmente
        </h5>
        <Form onSubmit={handleAgregarManual}>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, fontSize: "0.88rem" }}>Nombre</Form.Label>
                <Form.Control
                  value={manualNombre}
                  onChange={(e) => setManualNombre(e.target.value)}
                  placeholder="Nombre completo"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontWeight: 600, fontSize: "0.88rem" }}>N° de operación</Form.Label>
                <Form.Control
                  value={manualOp}
                  onChange={(e) => setManualOp(e.target.value)}
                  placeholder="Ej: TEST001"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Button
                type="submit"
                disabled={addingManual}
                style={{ background: "linear-gradient(135deg,#d63384,#f5a524)", border: "none", fontWeight: 700, width: "100%" }}
              >
                {addingManual ? <Spinner size="sm" animation="border" /> : "Agregar"}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* ─── Participants ────────────────────────────── */}
      <h5 style={{ fontWeight: 700, marginBottom: "1.25rem", color: "var(--cv-text-primary)" }}>
        Participantes ({participantes.length})
      </h5>

      {participantes.length === 0 ? (
        <p style={{ color: "var(--cv-text-secondary)" }}>No hay participantes aún.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cv-border)" }}>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, color: "var(--cv-text-secondary)" }}>Nombre</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, color: "var(--cv-text-secondary)" }}>Op. ID</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, color: "var(--cv-text-secondary)" }}>Estado</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, color: "var(--cv-text-secondary)" }}>Fecha</th>
                <th style={{ padding: "0.75rem" }} />
              </tr>
            </thead>
            <tbody>
              {participantes.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--cv-border)" }}>
                  <td style={{ padding: "0.75rem", color: "var(--cv-text-primary)", fontWeight: 600 }}>{p.nombre}</td>
                  <td style={{ padding: "0.75rem", fontFamily: "monospace", color: "var(--cv-text-secondary)" }}>{p.operacionId}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <Badge
                      style={{
                        background:
                          p.estado === "aprobado"
                            ? "linear-gradient(135deg,#d63384,#f5a524)"
                            : p.estado === "rechazado"
                            ? "#dc3545"
                            : "#6c757d",
                        fontSize: "0.75rem",
                      }}
                    >
                      {p.estado}
                    </Badge>
                  </td>
                  <td style={{ padding: "0.75rem", color: "var(--cv-text-secondary)", fontSize: "0.8rem" }}>
                    {p.creadoEn?.toDate
                      ? p.creadoEn.toDate().toLocaleDateString("es-AR")
                      : "—"}
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "right" }}>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleEliminar(p.id, p.nombre)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Confirm modal ───────────────────────────── */}
      <Modal show={confirmState.open} onHide={closeConfirm} centered>
        <Modal.Body className="p-4">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: confirmState.danger ? "rgba(214,51,132,0.1)" : "rgba(245,165,36,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.2rem"
            }}>
              {confirmState.danger ? "⚠️" : "❓"}
            </div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem", color: "var(--cv-text-primary)" }}>
              {confirmState.msg}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              onClick={closeConfirm}
              style={{
                padding: "8px 20px", borderRadius: "10px", border: "1.5px solid var(--cv-border)",
                background: "transparent", fontWeight: 600, cursor: "pointer",
                color: "var(--cv-text-primary)", fontSize: "0.9rem"
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmOk}
              style={{
                padding: "8px 20px", borderRadius: "10px", border: "none",
                background: confirmState.danger
                  ? "linear-gradient(135deg,#d63384,#f5a524)"
                  : "linear-gradient(135deg,#d63384,#f5a524)",
                color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem"
              }}
            >
              Confirmar
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ─── Ganador modal ───────────────────────────── */}
      <Modal show={ganadorModal} onHide={() => setGanadorModal(false)} centered>
        <Modal.Body className="text-center p-5">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
          <h3 style={{ fontWeight: 800 }}>¡Ganador sorteado!</h3>
          {nuevoGanador && (
            <>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "1rem", background: "linear-gradient(135deg,#d63384,#f5a524)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {nuevoGanador.nombre}
              </div>
              <div style={{ fontFamily: "monospace", color: "var(--cv-text-secondary)", marginTop: "0.25rem" }}>
                Op. #{nuevoGanador.operacionId}
              </div>
            </>
          )}
          <Button
            className="mt-4"
            style={{ background: "linear-gradient(135deg,#d63384,#f5a524)", border: "none", fontWeight: 700, padding: "0.6rem 2rem" }}
            onClick={() => setGanadorModal(false)}
          >
            Cerrar
          </Button>
        </Modal.Body>
      </Modal>

      {/* ─── Sorteo en Vivo overlay ─────────────────────── */}
      {modoVivo && (
        <SorteoVivo
          config={config}
          onClose={() => setModoVivo(false)}
        />
      )}
    </div>
  );
}
