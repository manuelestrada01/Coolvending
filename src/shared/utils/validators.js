// ─── Regex patterns ────────────────────────────────────────
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d\s\-().]{6,20}$/;

// ─── Primitives ────────────────────────────────────────────
export function isNonEmptyString(val, max = 1000) {
  return typeof val === "string" && val.trim().length > 0 && val.trim().length <= max;
}

export function isValidEmail(val) {
  return typeof val === "string" && EMAIL_RE.test(val.trim()) && val.length <= 254;
}

export function isValidPhone(val) {
  if (!val || val.trim() === "") return true; // optional field
  return PHONE_RE.test(val.trim());
}

// ─── Image file ────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file) {
  if (!file) return null;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Solo se permiten imágenes JPG, PNG, WebP o GIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "La imagen no puede superar los 5 MB.";
  }
  return null;
}

// ─── Domain validators (return { ok, errors }) ─────────────

export function validateContactForm({ nombre, email, telefono, mensaje }) {
  const errors = {};
  if (!isNonEmptyString(nombre, 100)) errors.nombre = "Nombre requerido (máx. 100 caracteres).";
  if (!isValidEmail(email)) errors.email = "Email inválido.";
  if (!isValidPhone(telefono)) errors.telefono = "Teléfono inválido.";
  if (!isNonEmptyString(mensaje, 2000)) errors.mensaje = "Mensaje requerido (máx. 2000 caracteres).";
  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateNewsletterEmail(email) {
  if (!isValidEmail(email)) return "Email inválido.";
  return null;
}

export function validateRegisterForm({ nombre, email, password, confirm }) {
  const errors = {};
  if (!isNonEmptyString(nombre, 80)) errors.nombre = "Nombre requerido (máx. 80 caracteres).";
  if (!isValidEmail(email)) errors.email = "Email inválido.";
  if (typeof password !== "string" || password.length < 6) errors.password = "Mínimo 6 caracteres.";
  if (password !== confirm) errors.confirm = "Las contraseñas no coinciden.";
  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!isValidEmail(email)) errors.email = "Email inválido.";
  if (!password || password.length === 0) errors.password = "Contraseña requerida.";
  return { ok: Object.keys(errors).length === 0, errors };
}

const CATEGORIAS_VALIDAS = ["Algodón de azúcar", "Café", "Pochoclo", "Globos", "Expendedoras"];

export function validateMaquinaForm({ nombre, categoria, descripcion }) {
  const errors = {};
  if (!isNonEmptyString(nombre, 120)) errors.nombre = "Nombre requerido (máx. 120 caracteres).";
  if (!CATEGORIAS_VALIDAS.includes(categoria)) errors.categoria = "Categoría inválida.";
  if (!isNonEmptyString(descripcion, 3000)) errors.descripcion = "Descripción requerida (máx. 3000 caracteres).";
  return { ok: Object.keys(errors).length === 0, errors };
}

const CATEGORIAS_EVENTO = ["Cumpleaños", "Corporativo", "Social", "Feria", "Escolar", "Casamiento", "Otro"];

export function validateEventoForm({ titulo, ubicacion, detalle, fecha, categoria }) {
  const errors = {};
  if (!isNonEmptyString(titulo, 120)) errors.titulo = "Título requerido (máx. 120 caracteres).";
  if (!isNonEmptyString(ubicacion, 150)) errors.ubicacion = "Ubicación requerida (máx. 150 caracteres).";
  if (!isNonEmptyString(detalle, 2000)) errors.detalle = "Detalle requerido (máx. 2000 caracteres).";
  if (!CATEGORIAS_EVENTO.includes(categoria)) errors.categoria = "Categoría inválida.";
  if (!fecha) errors.fecha = "Fecha requerida.";
  return { ok: Object.keys(errors).length === 0, errors };
}

const MAQUINAS_INSUMO = ["Algodón de azúcar", "Pochoclos", "Ambas"];

export function validateInsumoForm({ nombre, descripcion, precio, maquina }) {
  const errors = {};
  if (!isNonEmptyString(nombre, 120)) errors.nombre = "Nombre requerido (máx. 120 caracteres).";
  if (!isNonEmptyString(descripcion, 2000)) errors.descripcion = "Descripción requerida (máx. 2000 caracteres).";
  const p = Number(precio);
  if (isNaN(p) || p < 0) errors.precio = "El precio debe ser un número positivo.";
  if (!MAQUINAS_INSUMO.includes(maquina)) errors.maquina = "Máquina inválida.";
  return { ok: Object.keys(errors).length === 0, errors };
}
