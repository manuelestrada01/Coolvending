import { useRef, useEffect, useState } from "react";
import { Container, Nav, Navbar, NavDropdown, Button } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../utils/ThemeContext";
import { useAuth } from "../utils/AuthContext";
import { logout } from "../../services/firebase/auth";
import logo from "../../app/assets/images/logo/logo2.png";

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function SiteNavbar() {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const prevScrollY = useRef(0);
  const expandedRef = useRef(false);

  const handleToggle = (val) => {
    setExpanded(val);
    expandedRef.current = val;
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > prevScrollY.current && currentY > 80) {
        // scrolling down: hide bar and close menu
        setHidden(true);
        handleToggle(false);
      } else if (currentY < prevScrollY.current) {
        // scrolling up: show bar but always collapsed
        setHidden(false);
        handleToggle(false);
      }
      prevScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  return (
    <Navbar bg="light" expand="lg" expanded={expanded} onToggle={handleToggle} className={`cv-navbar${hidden ? " cv-navbar--hidden" : ""}`}>
      <Container>
        {/* Logo */}
        <Navbar.Brand as={NavLink} to="/" className="cv-brand">
          <img src={logo} alt="CoolVending" className="cv-logo" />
          <span className="visually-hidden">CoolVending</span>
        </Navbar.Brand>

        {/* Theme toggle — mobile only, next to hamburger */}
        <button
          className="cv-theme-toggle d-flex d-lg-none ms-auto me-2"
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          title={isDark ? "Modo claro" : "Modo oscuro"}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        <Navbar.Toggle
          aria-controls="main-navbar"
          className={`cv-hamburger${expanded ? " cv-hamburger--open" : ""}`}
        >
          <span className="cv-hamburger__line" />
          <span className="cv-hamburger__line" />
          <span className="cv-hamburger__line" />
        </Navbar.Toggle>
        <Navbar.Collapse id="main-navbar">
          {/* Centro */}
          <Nav className="mx-auto cv-navlinks" onClick={() => handleToggle(false)}>
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/equipos">
              Equipos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/insumos">
              Insumos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contacto">
              Contacto
            </Nav.Link>
            <Nav.Link as={NavLink} to="/presupuestos">
              Presupuestos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/eventos">
              Eventos
            </Nav.Link>
          </Nav>

          {/* Derecha */}
          <div className="d-flex gap-3 align-items-center cv-navbar-actions">
            {/* Theme toggle — desktop only */}
            <button
              className="cv-theme-toggle d-none d-lg-flex"
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              title={isDark ? "Modo claro" : "Modo oscuro"}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <NavDropdown
                title={user.displayName || user.email}
                id="user-menu"
                align="end"
                className="cv-user-dropdown"
              >
                {isAdmin && (
                  <>
                    <NavDropdown.Item as={NavLink} to="/admin">
                      Panel Admin
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                  </>
                )}
                <NavDropdown.Item onClick={handleLogout}>
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button
                as={NavLink}
                to="/login"
                className="cv-login-btn"
                variant="outline-light"
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

