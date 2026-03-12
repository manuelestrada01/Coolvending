import { Container } from "react-bootstrap";
import "./PageHero.css";

/**
 * PageHero — unified inner-page hero used by Insumos, Contacto, Eventos, etc.
 *
 * Props:
 *   badge       — string or JSX shown in the top pill label
 *   title       — string or JSX for the <h1>. Use <span className="ph-gradient-text"> for the gradient word.
 *   description — string or JSX for the subtitle paragraph
 *   children    — optional: CTA buttons rendered below the description
 */
export default function PageHero({ badge, title, description, children }) {
  return (
    <section className="ph-hero">
      <div aria-hidden="true">
        <div className="ph-orb ph-orb--1" />
        <div className="ph-orb ph-orb--2" />
        <div className="ph-orb ph-orb--3" />
        <div className="ph-grid-overlay" />
        <div className="ph-particle ph-particle--1" />
        <div className="ph-particle ph-particle--2" />
        <div className="ph-particle ph-particle--3" />
        <div className="ph-particle ph-particle--4" />
        <div className="ph-particle ph-particle--5" />
        <div className="ph-particle ph-particle--6" />
      </div>

      <Container>
        <div className="ph-inner">
          {badge && <span className="ph-badge ph-fade-0">{badge}</span>}
          <h1 className="ph-title ph-fade-1">{title}</h1>
          {description && <p className="ph-description ph-fade-2">{description}</p>}
          {children && <div className="ph-actions ph-fade-3">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
