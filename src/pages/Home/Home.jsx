import { Container, Row, Col, Button, Card } from "react-bootstrap";
import HeroImage from "../../app/assets/images/hero.svg";
import Algodon from "../../app/assets/images/algodon.png";
import CloudMaker from "../../app/assets/images/models/cloudmaker.svg";
import CubeMini from "../../app/assets/images/models/cubemini.svg";
import ArtisanAll from "../../app/assets/images/models/artisan.svg";
import "./Home.css";

export default function Home() {
 const features = [
 {
 icon: "⚙️",
 title: "Operación 100% automática",
 description: "Carga tu algodón y la máquina hace el resto sin necesidad de supervisión continua.",
 },
 {
 icon: "💡",
 title: "Diseño profesional",
 description: "Nuestros equipos tienen look moderno y son fáciles de limpiar y transportar.",
 },
 {
 icon: "⚡",
 title: "Alta rentabilidad",
 description: "Baja inversión inicial y costos operativos, ideal para eventos y ferias.",
 },
 {
 icon: "🛠️",
 title: "Soporte técnico premium",
 description: "Asistencia remota y piezas de repuesto disponibles en todo momento.",
 },
 ];

 const models = [
 { image: CloudMaker, name: "CloudMaker Pro" },
 { image: CubeMini, name: "SugarCube Mini" },
 { image: ArtisanAll, name: "Artisan All" },
 ];

 return (
 <>
 <section className="hero py-5">
 <Container>
 <Row className="align-items-center">
 <Col md={6}>
 <h1>Reinventamos la magia del algodón de azúcar</h1>
 <p>
 Máquinas de última tecnología para emprendedores y eventos.
 Tecnología punta para un negocio dulce y rentable.
 </p>
 <div className="d-flex gap-2">
 <Button variant="warning">Solicitar presupuesto</Button>
 <Button variant="outline-secondary">Ver demostración</Button>
 </div>
 </Col>
 <Col md={6} className="text-center">
 <img src={Algodon} alt="Máquina de algodón" className="img-fluid hero-img-small" />
 </Col>
 </Row>
 </Container>
 </section>

 <section className="features py-5 bg-light">
 <Container>
 <h2 className="text-center mb-4">Por qué elegir Coolvending</h2>
 <Row xs={1} md={2} lg={4} className="g-4">
 {features.map((f, idx) => (
 <Col key={idx}>
 <Card>
 <div className="icon">{f.icon}</div>
 <Card.Body>
 <Card.Title>{f.title}</Card.Title>
 <Card.Text>{f.description}</Card.Text>
 </Card.Body>
 </Card>
 </Col>
 ))}
 </Row>
 </Container>
 </section>

 <section className="models py-5">
 <Container>
 <h2 className="text-center mb-4">Nuestros Modelos</h2>
 <Row xs={1} md={3} className="g-4">
 {models.map((m, idx) => (
 <Col key={idx}>
 <Card className="h-100">
 <Card.Img variant="top" src={m.image} alt={m.name} />
 <Card.Body className="d-flex flex-column">
 <Card.Title>{m.name}</Card.Title>
 <Button variant="outline-primary" className="mt-auto">
 Ver detalles
 </Button>
 </Card.Body>
 </Card>
 </Col>
 ))}
 </Row>
 </Container>
 </section>
 </>
 );
}
