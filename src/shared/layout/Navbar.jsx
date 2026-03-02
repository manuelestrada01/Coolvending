import { Container, Nav, Navbar, NavDropdown, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import logo from "../../app/assets/images/logo/logo2.png";

export default function SiteNavbar() {
  return (
    <Navbar bg="light" expand="lg" sticky="top" className="cv-navbar">
      <Container>
        {/* Logo */}
        <Navbar.Brand as={NavLink} to="/" className="cv-brand">
          <img src={logo} alt="CoolVending" className="cv-logo" />
          <span className="visually-hidden">CoolVending</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          {/* Centro */}
          <Nav className="mx-auto cv-navlinks">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/equipos">
              Equipos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/insumos">
              Insumos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contactos">
              Contactos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/presupuestos">
              Presupuestos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/news">
              News
            </Nav.Link>
          </Nav>

          {/* Derecha */}
          <div className="d-flex gap-3 align-items-center">
            <Button
              className="cv-login-btn"
              variant="outline-light"
            >
              Iniciar Sesión
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

