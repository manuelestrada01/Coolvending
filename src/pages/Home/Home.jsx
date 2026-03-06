import { Container, Row, Col, Button, Carousel } from "react-bootstrap";
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
 const [ctaRef, ctaVisible] = useScrollReveal({ rootMargin: "0px 0px -40px 0px" });
 const [aboutRef, aboutVisible] = useScrollReveal();

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

 <div className="home-canvas">
 <div className="home-deco" aria-hidden="true">
 <span className="sdeco sdeco-models--1" />
 <span className="sdeco sdeco-models--2" />
 <span className="sdeco sdeco-models--3" />
 <span className="sdeco sdeco-benefits--1" />
 <span className="sdeco sdeco-benefits--2" />
 <span className="sdeco sdeco-benefits--3" />
 <span className="sdeco sdeco-vending--1" />
 <span className="sdeco sdeco-vending--2" />
 <span className="sdeco sdeco-cta--1" />
 <span className="sdeco sdeco-cta--2" />
 <span className="sdeco sdeco-cta--3" />
 <span className="sdeco sdeco-about--1" />
 <span className="sdeco sdeco-about--2" />
 </div>

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
 <div className="why-vending-carousel-wrap">
 <Carousel fade interval={3000} indicators controls className="why-vending-carousel">
 {models.map((m, i) => (
 <Carousel.Item key={i}>
 <div className="why-vending-carousel-slide" style={{ background: m.gradient }}>
 <img src={m.image} alt={m.name} className="why-vending-carousel-img" />
 </div>
 <Carousel.Caption className="why-vending-carousel-caption">
 <span>{m.name}</span>
 </Carousel.Caption>
 </Carousel.Item>
 ))}
 </Carousel>
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

 {/* ===== CONTACT CTA SECTION ===== */}
 <section ref={ctaRef} className={`contact-cta py-5 reveal-section${ctaVisible ? " visible" : ""}`}>
 <Container>
 <div className="contact-cta-header text-center mb-5 models-header">
 <h2 className="contact-cta-title models-title">¿Querés <span className="contact-cta-highlight">saber más?</span></h2>
 <div className="contact-cta-divider"><span>▼</span></div>
 </div>
 <Row className="g-4 justify-content-center">
 <Col md={4}>
 <div className="contact-cta-card reveal-card" style={{ transitionDelay: "0s" }}>
 <div className="contact-cta-icon">
 <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
 </div>
 <p className="contact-cta-text">Completá un formulario y nuestro equipo te contacta a la brevedad.</p>
 <button className="contact-cta-btn">Solicitar info</button>
 </div>
 </Col>
 <Col md={4}>
 <div className="contact-cta-card contact-cta-card--center reveal-card" style={{ transitionDelay: "0.12s" }}>
 <div className="contact-cta-icon">
 <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
 </div>
 <p className="contact-cta-text">Contáctanos instantáneamente por WhatsApp y resolvemos tus dudas.</p>
 <a href="https://wa.me/" target="_blank" rel="noreferrer" className="contact-cta-btn">Chatear ahora</a>
 </div>
 </Col>
 <Col md={4}>
 <div className="contact-cta-card reveal-card" style={{ transitionDelay: "0.24s" }}>
 <div className="contact-cta-icon">
 <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/><polyline points="14.05 3 14.05 9 20.05 9"/><line x1="20" y1="3" x2="14" y2="9"/></svg>
 </div>
 <p className="contact-cta-text">Agendá una videollamada con un experto en vending y despejá todas tus dudas.</p>
 <button className="contact-cta-btn">Agendar llamada</button>
 </div>
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
 </div>

 </>
 );
}
