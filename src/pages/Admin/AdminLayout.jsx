import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../shared/utils/AuthContext";
import "./Admin.css";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "🏠", end: true },
  { to: "/admin/maquinas", label: "Máquinas", icon: "🏭" },
  { to: "/admin/eventos", label: "Eventos", icon: "🎪" },
  { to: "/admin/insumos", label: "Insumos", icon: "📦" },
];

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="admin-sidebar-title">Panel Admin</p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `admin-sidebar-link${isActive ? " active" : ""}`
            }
          >
            <span className="admin-sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ marginTop: "auto", padding: "1rem 1.25rem", borderTop: "1px solid var(--cv-border)" }}>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--cv-text-secondary)" }}>
            Sesión iniciada como
          </p>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--cv-text-primary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.displayName || user?.email}
          </p>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
