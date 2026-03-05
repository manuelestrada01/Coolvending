import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useScrollReveal } from "../../shared/utils/useScrollReveal";
import HeroImage from "../../app/assets/images/hero.svg";
import Algodon from "../../app/assets/images/algodon.png";
import AlgodonVideo from "../../app/assets/images/algodon.mp4";
import AlgodonPororoVideo from "../../app/assets/images/algodon-pororo.mp4";
import Logo from "../../app/assets/images/logo/logo.png";
import LogoAlt from "../../app/assets/images/logo/logo2.png";
import AlgodonM4 from "../../app/assets/images/models/algodonM4_s.png";
import AlgodonM5 from "../../app/assets/images/models/algodonM5.png";
import PororoM from "../../app/assets/images/models/pororoM.png";
import AlgodonM from "../../app/assets/images/models/algodonM.png";
import AlgodonM2 from "../../app/assets/images/models/algodonM2.png";
import AlgodonM3 from "../../app/assets/images/models/algodonM3.png";
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
 {
   image: AlgodonM,
   name: "CloudMaker Pro",
   badge: "Más vendido",
   tags: ["Automática", "Alta capacidad", "WiFi"],
   gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
   orb: "rgba(124, 58, 237, 0.35)",
 },
 {
   image: AlgodonM2,
   name: "SugarCube Mini",
   badge: "Compacta",
   tags: ["Portátil", "Silenciosa", "Fácil uso"],
   gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
   orb: "rgba(236, 72, 153, 0.3)",
 },
 {
   image: AlgodonM3,
   name: "Artisan All",
   badge: "Premium",
   tags: ["Táctil", "Multi-función", "Pro"],
   gradient: "linear-gradient(135deg, #f9d976 0%, #f39f86 100%)",
   orb: "rgba(251, 146, 60, 0.35)",
 },
 {
   image: AlgodonM4,
   name: "CloudMaker Lite",
   badge: "Nuevo",
   tags: ["Liviana", "Económica", "Plug & Play"],
   gradient: "linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)",
   orb: "rgba(16, 185, 129, 0.32)",
 },
 {
   image: AlgodonM5,
   name: "CubeMini Pro",
   badge: "Best value",
   tags: ["Auto-limpieza", "Autonomía", "Eficiente"],
   gradient: "linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)",
   orb: "rgba(245, 158, 11, 0.3)",
 },
 {
   image: PororoM,
   name: "Artisan Event",
   badge: "Edición especial",
   tags: ["Alta producción", "LED", "Eventos"],
   gradient: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #ffecd2 100%)",
   orb: "rgba(239, 68, 68, 0.3)",
 },
 ];

 const [modelsRef, modelsVisible] = useScrollReveal();
 const [benefitsRef, benefitsVisible] = useScrollReveal();
 const [vendingRef, vendingVisible] = useScrollReveal();
 const [aboutRef, aboutVisible] = useScrollReveal();
 const [featuresRef, featuresVisible] = useScrollReveal();

 const heroFrames = [
 { key: "main", type: "video", src: AlgodonVideo, poster: Algodon, alt: "Máquina en acción", frameClass: "hero-frame-main" },
 { key: "top", type: "image", src: LogoAlt, alt: "Marca Coolvending", frameClass: "hero-frame-top" },
 { key: "bottom", type: "video", src: AlgodonPororoVideo, poster: Logo, alt: "Experiencia del producto", frameClass: "hero-frame-bottom" },
 ];

 return (
 <>
 <section className="hero hero-bg-magenta py-5">
 <div className="hero-circles" aria-hidden="true">
   <span className="hero-circle hero-circle--1" />
   <span className="hero-circle hero-circle--2" />
   <span className="hero-circle hero-circle--3" />
   <span className="hero-circle hero-circle--4" />
   <span className="hero-circle hero-circle--5" />
 </div>
 <Container>
 <Row className="align-items-center">
 <Col md={5}>
 <h1 className="hero-title-animated">Reinventamos la magia del algodón de azúcar</h1>
 <p className="hero-text-animated">
 Máquinas de última tecnología para emprendedores y eventos.
 Tecnología punta para un negocio dulce y rentable.
 </p>
 <div className="d-flex gap-2 hero-buttons-animated">
 <Button variant="light" className="hero-btn-primary">Solicitar presupuesto</Button>
 <Button variant="outline-secondary">Ver demostración</Button>
 </div>
 </Col>
 <Col md={7} className="text-center hero-media-col">
 <div className="hero-collage hero-media-animated" aria-label="Galería de medios enmarcados">
 {heroFrames.map((frame) => (
 <figure key={frame.key} className={`hero-frame ${frame.frameClass}`}>
 {frame.type === "video" && frame.src ? (
 <video autoPlay muted loop playsInline controls={false} preload="metadata" poster={frame.poster || ""}>
 <source src={frame.src} type="video/mp4" />
 </video>
 ) : (
 <img src={frame.src} alt={frame.alt} className="img-fluid" />
 )}
 </figure>
 ))}
 </div>
 </Col>
 </Row>
 </Container>
 </section>

 <section ref={modelsRef} className={`models py-5 reveal-section${modelsVisible ? " visible" : ""}`}>
 <Container>
 <div className="models-header text-center mb-5">
 <span className="models-label">CATÁLOGO</span>
 <h2 className="models-title">Nuestros Modelos</h2>
 <p className="models-subtitle">Elegí la máquina que mejor se adapta a tu negocio</p>
 </div>
 <Row className="g-4 justify-content-center">
 {models.map((m, idx) => (
 <Col xs={11} sm={8} md={5} lg={4} key={idx}>
 <div className="product-card reveal-card" style={{ transitionDelay: `${idx * 0.12}s` }}>
 <div className="product-card-img-wrap" style={{ background: m.gradient }}>
 <div className="product-card-orb" style={{ background: m.orb }} />
 <img src={m.image} alt={m.name} className="product-card-img" />
 <span className="product-card-badge">{m.badge}</span>
 </div>
 <div className="product-card-body">
 <h3 className="product-card-title">{m.name}</h3>
 <div className="product-card-tags">
 {m.tags.map((tag) => (
 <span key={tag} className="product-card-tag">{tag}</span>
 ))}
 </div>
 <button className="product-card-btn">Ver detalles →</button>
 </div>
 </div>
 </Col>
 ))}
 </Row>
 </Container>
 </section>

 <section ref={benefitsRef} className={`why-benefits py-5 reveal-section${benefitsVisible ? " visible" : ""}`}>
 <Container>
 <div className="models-header text-center mb-5">
 <span className="models-label">BENEFICIOS</span>
 <h2 className="models-title">¿Por qué sumar una vending machine?</h2>
 <p className="models-subtitle">Un negocio que trabaja para vos, incluso cuando no estás</p>
 </div>
 <Row className="g-4">
 {[
 { icon: "💰", title: "Ingresos pasivos reales", text: "La máquina genera ventas las 24hs, los 7 días de la semana, sin necesidad de personal dedicado." },
 { icon: "📍", title: "Ubicación estratégica", text: "Shoppings, ferias, parques, eventos — cualquier lugar con tráfico es una oportunidad de venta." },
 { icon: "⚡", title: "Bajo costo operativo", text: "Sin local, sin empleados fijos. Solo insumos y mantenimiento mínimo para maximizar tu margen." },
 { icon: "📈", title: "ROI en meses, no años", text: "Nuestros clientes recuperan la inversión en un promedio de 4 a 6 meses según el punto de venta." },
 { icon: "🎯", title: "Producto con alta demanda", text: "El algodón de azúcar atrae a todas las edades. Es una experiencia, no solo un producto." },
 { icon: "🔧", title: "Soporte incluido", text: "Acompañamos cada paso: instalación, capacitación y soporte técnico remoto cuando lo necesitás." },
 ].map((item, i) => (
 <Col key={i} xs={12} sm={6} lg={4}>
 <div className="why-card reveal-card" style={{ transitionDelay: `${i * 0.1}s` }}>
 <div className="why-card-icon">{item.icon}</div>
 <h4 className="why-card-title">{item.title}</h4>
 <p className="why-card-text">{item.text}</p>
 </div>
 </Col>
 ))}
 </Row>
 </Container>
 </section>

 <section ref={vendingRef} className={`why-vending py-5 reveal-section${vendingVisible ? " visible" : ""}`}>
 <Container>
 <div className="models-header text-center mb-5">
 <span className="models-label">BENEFICIOS</span>
 <h2 className="models-title">Potenciá tu negocio con una vending machine</h2>
 <p className="models-subtitle">Un negocio que trabaja para vos, incluso cuando no estás</p>
 </div>
 <Row className="align-items-center g-5">
 <Col md={6} className="reveal-col--left">
 <div className="why-vending-img-wrap">
 <img src={AlgodonM} alt="Máquina Coolvending" className="why-vending-img" />
 </div>
 </Col>
 <Col md={6} className="reveal-col--right">
 <p className="why-vending-intro">
 Desde emprendedores hasta dueños de locales, Coolvending ofrece una forma simple y rentable de sumar ingresos con máquinas expendedoras automáticas que atraen clientes y generan experiencias únicas.
 </p>
 <p className="why-vending-intro">Nuestras máquinas están diseñadas para el éxito:</p>
 <ul className="why-vending-list">
 {[
 "Baja inversión con alto retorno",
 "Mínimo costo de mantenimiento y operación",
 "Márgenes de ganancia comprobados con recupero rápido",
 "Operación 100% automática, sin personal dedicado",
 "Ubicable en shoppings, ferias, parques y eventos",
 "Soporte técnico remoto incluido en todo momento",
 ].map((item, i) => (
 <li key={i} className="why-vending-item">
 <span className="why-check">✔</span>
 {item}
 </li>
 ))}
 </ul>
 <p className="why-vending-closing">
 Un negocio que trabaja para vos las 24hs, los 7 días de la semana, fácil de operar y imposible de ignorar.
 </p>
 <button className="why-vending-cta">Hablemos de negocios →</button>
 </Col>
 </Row>
 </Container>
 </section>

 <section ref={aboutRef} className={`about py-5 reveal-section${aboutVisible ? " visible" : ""}`}>
 <Container>
 <Row className="align-items-center">
 <Col md={6} className="reveal-col--left">
 <div className="about-label">NUESTRA VISIÓN</div>
 <h2 className="about-title">Innovación en cada algodón</h2>
 <p className="about-text">
 En Coolvending creemos en la magia del entretenimiento sano y rentable. Nos esforzamos por
 llevar tecnología de punta a cada emprendedor, feria y evento, facilitando operaciones automáticas
 y diseños profesionales que marquan la diferencia.
 </p>
 <div className="about-metrics">
 <div className="metric-item">
 <div className="metric-value">100%</div>
 <div className="metric-label">AUTOMÁTICO</div>
 </div>
 <div className="metric-item">
 <div className="metric-value">6 Mes.</div>
 <div className="metric-label">ROI PROMEDIO</div>
 </div>
 <div className="metric-item">
 <div className="metric-value">500+</div>
 <div className="metric-label">UNIDADES/DÍA</div>
 </div>
 </div>
 </Col>
 <Col md={6} className="text-center reveal-col--right">
 <img src={HeroImage} alt="Visión Coolvending" className="img-fluid about-img" />
 </Col>
 </Row>
 </Container>
 </section>

 <section ref={featuresRef} className={`features py-5 bg-light reveal-section${featuresVisible ? " visible" : ""}`}>
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

 </>
 );
}
