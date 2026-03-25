import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { saveNewsletterEmail } from "../../services/firebase/firestore";
import { getMaquinas } from "../../services/firebase/maquinas";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState(null); // null | "loading" | "success" | "error"
  const [maquinas, setMaquinas] = useState([]);

  useEffect(() => {
    getMaquinas().then(setMaquinas).catch(() => {});
  }, []);

  async function handleNewsletter(e) {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("loading");
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8000)
      );
      await Promise.race([saveNewsletterEmail(newsletterEmail), timeout]);
      setNewsletterEmail("");
      setNewsletterStatus("success");
    } catch (err) {
      console.error("Newsletter error:", err);
      setNewsletterStatus("error");
    }
  }

  return (
    <footer className="footer">
      <div className="footer-accent" aria-hidden="true" />
      <Container>
        <Row className="footer-content g-4">
          <Col lg={4} md={12} className="footer-section footer-brand-col">
            <span className="footer-kicker">COOLVENDING</span>
            <h5 className="footer-brand">Máquinas vending de última tecnología</h5>
            <p className="footer-text">
              Soluciones vending automáticas para emprendedores, eventos y negocios de todo tipo.
            </p>
            <div className="footer-meta">
              <span>Soporte remoto</span>
              <span>Instalación guiada</span>
              <span>ROI estimado 4-6 meses</span>
            </div>
          </Col>

          <Col lg={2} md={6} className="footer-section footer-right-col">
            <h5 className="footer-title">Modelos</h5>
            <ul className="footer-links">
              {maquinas.map((m) => (
                <li key={m.id}><Link to="/equipos">{m.nombre}</Link></li>
              ))}
            </ul>
          </Col>

          <Col lg={4} md={12} className="footer-section footer-newsletter-col">
            <div className="footer-newsletter-card">
              <h5 className="footer-title">Newsletter</h5>
              <p className="footer-text">Recibí novedades, promociones y lanzamientos.</p>
              {newsletterStatus === "success" ? (
                <p className="footer-text" style={{ color: "var(--cv-gold)", fontWeight: 600 }}>
                  ¡Gracias por suscribirte! 🎉
                </p>
              ) : (
                <Form className="newsletter-form" onSubmit={handleNewsletter}>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="email"
                      placeholder="Tu correo"
                      className="footer-input"
                      value={newsletterEmail ?? ""}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  {newsletterStatus === "error" && (
                    <p style={{ color: "#dc3545", fontSize: "0.78rem", marginBottom: "0.4rem" }}>
                      Error al suscribirse. Intentá de nuevo.
                    </p>
                  )}
                  <Button className="footer-btn" type="submit" disabled={newsletterStatus === "loading"}>
                    {newsletterStatus === "loading" ? "Enviando..." : "Suscribirme"}
                  </Button>
                </Form>
              )}
            </div>
          </Col>
        </Row>

        <Row className="footer-bottom">
          <Col md={6} className="footer-copyright">
            <p>© {currentYear} Coolvending. Todos los derechos reservados.</p>
          </Col>
          <Col md={6} className="footer-links-bottom">
            <Link to="/">Privacidad</Link>
            <Link to="/">Términos</Link>
            <Link to="/">Cookies</Link>
          </Col>
        </Row>
        <Row className="footer-powered">
          <Col className="text-center">
            <p className="footer-powered-text">
              Powered by <span className="footer-powered-name">Manuel Estrada</span>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}