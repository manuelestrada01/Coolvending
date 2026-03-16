# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (accessible on network via host: true)
npm run build     # Production build to dist/
npm run preview   # Preview production build
npm run lint      # ESLint check
```

No test suite is configured.

## Architecture

**CoolVending** is a React + Vite SPA for a cotton candy vending machine business. The UI is in Spanish.

### Stack
- **React 19** with React Router v7
- **Firebase** (Auth, Firestore, Storage) — config via `VITE_FIREBASE_*` env vars
- **Bootstrap 5** + `react-bootstrap` for UI components
- **CSS custom properties** for theming (no CSS-in-JS)

### Key Patterns

**Context Providers** (both wrap the entire app in `App.jsx`):
- `ThemeContext` — dark/light mode; toggled via `useTheme()`, applies `data-theme="dark"` to `<html>`
- `AuthContext` — exposes `user`, `role`, `puedeVerPrecios`, `loading`; use `useAuth()` hook

**Routing** — all routes in `App.jsx`. Admin routes (`/admin/*`) are wrapped in `<ProtectedRoute adminOnly>`. Public routes render inside the shared Navbar/Footer layout.

**Service layer** — all Firebase calls live in `src/services/firebase/`:
- `auth.js` — register, login, Google OAuth, logout, getUserRole
- `firestore.js` — contact messages (rate-limited), newsletter, presupuestos
- `maquinas.js`, `eventosService.js`, `insumosService.js`, `usuariosService.js` — domain CRUD

**Form validation** — centralized in `src/shared/utils/validators.js`; functions return error objects keyed by field name.

**Page structure** — each page lives in `src/pages/<PageName>/` with its own `.jsx` and `.css`. Admin pages are under `src/pages/Admin/` sharing a single `AdminLayout.jsx`.

**Shared layout components** — `Navbar`, `Footer`, `PageHero`, `WhatsAppFloatButton` in `src/shared/layout/`. `ScrollToTop` and `useScrollReveal` are utility hooks in `src/shared/utils/`.

### Theming

Global CSS variables are defined in `src/shared/styles/globals.css`. Dark mode overrides use the `[data-theme="dark"]` selector. Primary brand colors: magenta (`--color-primary`), amber (`--color-accent`).

### Auth & Roles

After login/register, a user document is created in the Firestore `users` collection with a `role` field (`"admin"` or `"usuario"`). The `AuthContext` reads this role on auth state change. `puedeVerPrecios` is a per-user Firestore flag controlling price visibility.

---

## Rol y Estándares de Diseño

Actúa como un **Ingeniero Frontend Senior**. Cada página debe sentirse cinematográfica: animaciones con peso, scroll intencional, interacciones que justifiquen su existencia. Erradicar patrones genéricos.

### Identidad Visual CoolVending

**Paleta de marca:**
- Magenta principal: `#d63384` (`--color-primary`)
- Amber acento: `#f5a524` (`--color-accent`)
- Negro fondo: `#0d0d0d` (`--cv-black`)
- Fondo body light: `#fdf8f4`
- Fondo body dark: `#1a1a1a`

**Variables CSS clave** (definidas en `globals.css`):
```
--cv-black, --cv-card-bg, --cv-border
--cv-text-primary, --cv-text-secondary
--cv-gold (usado en badges y labels)
--color-primary, --color-accent
```

**Gradiente de marca** (usar siempre en CTAs, badges activos, dividers):
```css
background: linear-gradient(135deg, #d63384, #f5a524);
```

**Texto gradiente animado** (para palabras destacadas en títulos):
```css
background: linear-gradient(90deg, #d63384, #f5a524, #e040fb, #d63384);
background-size: 250% auto;
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
animation: phGradientShift 4s ease infinite;
```
El keyframe `phGradientShift` está definido en `PageHero.css` (global).

### Convenciones de Animación

- **Scroll reveal**: usar siempre `useScrollReveal` de `src/shared/utils/useScrollReveal.js`. Devuelve `[ref, isVisible]`. Agregar clase CSS condicional para activar la animación.
- **Easing preferido**: `cubic-bezier(0.22, 1, 0.36, 1)` para entradas (suave, con overshoot leve).
- **Duraciones**: entradas 0.7–0.9s, hovers 0.2–0.35s. Nunca más de 1s para interacciones.
- **Stagger**: delays escalonados vía `transition-delay` en CSS o `--eq-delay` custom property.
- **Regla de hooks en listas**: si cada item de una lista necesita su propio `useScrollReveal`, extraerlo como subcomponente (ver patrón `MachineRow` en `Equipos.jsx`).
- **Float animation**: imágenes hero usan `heroFloat` keyframe (translateY 0 → -14px → 0, 7s infinite).

### Estándares de Calidad

- **Hover effects**: todo elemento interactivo debe tener hover visible — no solo `cursor: pointer`. Mínimo: color shift o transform sutil.
- **Mobile first**: siempre verificar que layouts flex/grid colapsen bien. Breakpoints: 575px (xs), 767px (md), 991px (lg).
- **Tipografía**: títulos con `clamp()` para fluid sizing. Nunca tamaño fijo en títulos de sección.
- **Imágenes sin URL**: usar siempre fallback (emoji placeholder o skeleton), nunca `<img>` sin condicional.
- **Dark mode**: todo componente nuevo debe tener overrides `[data-theme="dark"]`. El fondo hero de PageHero en dark: `linear-gradient(135deg, #361a3f, #4a2358, #311b3c)`.
- **Sin texto redundante**: si el título ya comunica el mensaje, no agregar subtítulo. Menos texto = más impacto visual.
- **Límite Home**: la sección de modelos en Home muestra máximo 6 máquinas (`.slice(0, 6)`). El catálogo completo vive en `/equipos`.
