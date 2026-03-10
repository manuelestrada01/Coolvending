import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Spinner } from "react-bootstrap";
import { countCollection } from "../../services/firebase/maquinas";

const STATS = [
  { key: "maquinas", label: "Máquinas", icon: "🏭", col: "maquinas" },
  { key: "contactos", label: "Mensajes de contacto", icon: "✉️", col: "contactos" },
  { key: "newsletter", label: "Suscriptores newsletter", icon: "📧", col: "newsletter" },
];

const ACTIONS = [
  {
    to: "/admin/maquinas",
    icon: "🏭",
    title: "Gestionar Máquinas",
    desc: "Agregá, editá o eliminá máquinas y sus fotos.",
  },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      STATS.map(async (s) => {
        const count = await countCollection(s.col);
        return [s.key, count];
      })
    )
      .then((entries) => setCounts(Object.fromEntries(entries)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
      </div>

      <Row className="g-3 mb-4">
        {STATS.map((s) => (
          <Col key={s.key} xs={12} sm={6} lg={4}>
            <div className="admin-stat-card">
              <div className="admin-stat-icon">{s.icon}</div>
              <div>
                <p className="admin-stat-label">{s.label}</p>
                {loading ? (
                  <Spinner size="sm" style={{ color: "var(--cv-gold)" }} />
                ) : (
                  <p className="admin-stat-value">{counts[s.key] ?? 0}</p>
                )}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <h2
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--cv-text-secondary)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: "1rem",
        }}
      >
        Acciones rápidas
      </h2>

      <Row className="g-3">
        {ACTIONS.map((a) => (
          <Col key={a.to} xs={12} sm={6} md={4}>
            <Link to={a.to} className="admin-action-card">
              <div className="admin-action-icon">{a.icon}</div>
              <p className="admin-action-title">{a.title}</p>
              <p className="admin-action-desc">{a.desc}</p>
            </Link>
          </Col>
        ))}
      </Row>
    </>
  );
}
