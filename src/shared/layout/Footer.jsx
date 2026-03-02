import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <Container>
        {/* Main Footer Content */}
        <Row className="footer-content">
          {/* About Section */}
          <Col lg={3} md={6} className="footer-section">
            <h5 className="footer-title">Coolvending</h5>
            <p className="footer-text">
              Máquinas de algodón de azúcar de última tecnología para emprendedores y eventos.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noreferrer">f</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">📷</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer">▶</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer">📺</a>
            </div>
          </Col>

          {/* Products */}
          <Col lg={2} md={6} className="footer-section">
            <h5 className="footer-title">Productos</h5>
            <ul className="footer-links">
              <li><Link to="/productos">CloudMaker Pro</Link></li>
              <li><Link to="/productos">SugarCube Mini</Link></li>
              <li><Link to="/productos">Artisan All</Link></li>
              <li><Link to="/productos">Equipos</Link></li>
            </ul>
          </Col>

          {/* Services */}
          <Col lg={2} md={6} className="footer-section">
            <h5 className="footer-title">Servicios</h5>
            <ul className="footer-links">
              <li><Link to="/servicios">Algodón Azúcar</Link></li>
              <li><Link to="/servicios">Pochoclos</Link></li>
              <li><Link to="/galeria">Galería</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </Col>

          {/* Newsletter */}
          <Col lg={3} md={6} className="footer-section">
            <h5 className="footer-title">Newsletter</h5>
            <p className="footer-text">Suscribete para ofertas y news</p>
            <Form className="newsletter-form">
              <Form.Group className="mb-2">
                <Form.Control
                  type="email"
                  placeholder="Tu email"
                  className="footer-input"
                />
              </Form.Group>
              <Button className="footer-btn" type="submit">
                Suscribir
              </Button>
            </Form>
          </Col>
        </Row>

        {/* Bottom Footer */}
        <Row className="footer-bottom">
          <Col md={6} className="footer-text">
            <p>© 2026 Coolvending. Todos los derechos reservados.</p>
          </Col>
          <Col md={6} className="footer-links-bottom">
            <Link to="/">Privacidad</Link>
            <Link to="/">Términos</Link>
            <Link to="/">Cookies</Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}