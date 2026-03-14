import { useEffect, useState } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { getUsuarios, setPuedeVerPrecios } from "../../services/firebase/usuariosService";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(null); // uid en proceso

  useEffect(() => {
    getUsuarios()
      .then(setUsuarios)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(uid, current) {
    setToggling(uid);
    try {
      await setPuedeVerPrecios(uid, !current);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, puedeVerPrecios: !current } : u))
      );
    } catch (e) {
      alert("Error al actualizar: " + e.message);
    } finally {
      setToggling(null);
    }
  }

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Usuarios</h1>
        <p style={{ color: "var(--cv-text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Habilitá o deshabilitá el acceso a precios de insumos para cada cliente.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner style={{ color: "var(--cv-gold)" }} />
        </div>
      ) : usuarios.length === 0 ? (
        <p style={{ color: "var(--cv-text-secondary)" }}>No hay usuarios registrados todavía.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Ver precios</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const habilitado = u.puedeVerPrecios === true;
                return (
                  <tr key={u.id}>
                    <td>{u.nombre || <span style={{ color: "var(--cv-text-secondary)" }}>—</span>}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{u.email}</td>
                    <td>
                      <span className={`admin-role-badge${u.role === "admin" ? " admin-role-badge--admin" : ""}`}>
                        {u.role ?? "usuario"}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-precio-badge${habilitado ? " admin-precio-badge--on" : " admin-precio-badge--off"}`}>
                        {habilitado ? "✓ Habilitado" : "✗ Sin acceso"}
                      </span>
                    </td>
                    <td>
                      {u.role !== "admin" && (
                        <button
                          className={`admin-toggle-btn${habilitado ? " admin-toggle-btn--off" : " admin-toggle-btn--on"}`}
                          onClick={() => handleToggle(u.id, habilitado)}
                          disabled={toggling === u.id}
                        >
                          {toggling === u.id
                            ? "..."
                            : habilitado
                            ? "Revocar acceso"
                            : "Habilitar acceso"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
