import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { login, loginWithGoogle } from "../../services/firebase/auth";
import { useAuth } from "../../shared/utils/AuthContext";
import { validateLoginForm } from "../../shared/utils/validators";
import logo from "../../app/assets/images/logo/logo2.png";
import "./Login.css";

const FIREBASE_ERRORS = {
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  "auth/invalid-email": "El email no es válido.",
  "auth/user-not-found": "Email o contraseña incorrectos.",
  "auth/wrong-password": "Email o contraseña incorrectos.",
  "auth/network-request-failed": "Error de red. Verificá tu conexión.",
  "auth/too-many-requests": "Demasiados intentos. Intentá más tarde.",
  "auth/popup-closed-by-user": "Se cerró la ventana de Google. Intentá de nuevo.",
  "auth/popup-blocked": "El navegador bloqueó la ventana emergente. Intentá de nuevo.",
  "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase. Agregá la IP/dominio en Firebase Console → Authentication → Authorized domains.",
  "auth/operation-not-supported-in-this-environment": "El navegador no soporta este método de autenticación.",
  "auth/cancelled-popup-request": "Operación cancelada. Intentá de nuevo.",
};

export default function Login() {
  const { user, role, loading, redirectError } = useAuth();

  const [showAdmin, setShowAdmin] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: null, message: "" });

  // Show error if Google redirect failed (mobile flow)
  useEffect(() => {
    if (redirectError) {
      setStatus({
        type: "error",
        message: FIREBASE_ERRORS[redirectError.code] ?? "No se pudo ingresar con Google.",
      });
    }
  }, [redirectError]);

  if (!loading && user) {
    return <Navigate to={role === "admin" ? "/admin" : "/"} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setStatus({ type: null, message: "" });
  };

  const handleGoogleLogin = async () => {
    setStatus({ type: "loading-google", message: "" });
    try {
      await loginWithGoogle();
    } catch (err) {
      if (import.meta.env.DEV) console.error("[Google Login] code:", err.code, err);
      setStatus({ type: "error", message: FIREBASE_ERRORS[err.code] ?? `No se pudo ingresar con Google. (${err.code ?? "error desconocido"})` });
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const { ok, errors } = validateLoginForm(form);
    if (!ok) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setStatus({ type: "loading-admin", message: "" });
    try {
      await login(form.email, form.password);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      setStatus({ type: "error", message: FIREBASE_ERRORS[err.code] ?? "Ocurrió un error. Intentá de nuevo." });
    }
  };

  const isLoadingGoogle = status.type === "loading-google";
  const isLoadingAdmin = status.type === "loading-admin";
  const isLoading = isLoadingGoogle || isLoadingAdmin;

  return (
    <div className="login-page">
      <Container>
        <div className="login-wrapper">
          <div className="login-brand">
            <img src={logo} alt="CoolVending" className="login-logo" />
          </div>

          <Card className="login-card">
            <Card.Body className="login-card-body">
              {status.type === "error" && (
                <Alert variant="danger" className="mb-3 py-2">
                  {status.message}
                </Alert>
              )}

              <Button
                className="google-btn w-100"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoadingGoogle ? (
                  <><Spinner size="sm" className="me-2" />Ingresando...</>
                ) : (
                  <>
                    <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Ingresar con Google
                  </>
                )}
              </Button>

              <div className="admin-toggle-wrapper">
                <button
                  type="button"
                  className="admin-toggle-btn"
                  onClick={() => {
                    setShowAdmin((v) => !v);
                    setStatus({ type: null, message: "" });
                    setFieldErrors({});
                  }}
                  disabled={isLoading}
                >
                  Acceso administrativo {showAdmin ? "▲" : "▼"}
                </button>
              </div>

              {showAdmin && (
                <Form onSubmit={handleAdminLogin} className="admin-form">
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="admin@email.com"
                      disabled={isLoadingAdmin}
                      className="login-input"
                      isInvalid={!!fieldErrors.email}
                    />
                    <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={isLoadingAdmin}
                      className="login-input"
                      isInvalid={!!fieldErrors.password}
                    />
                    <Form.Control.Feedback type="invalid">{fieldErrors.password}</Form.Control.Feedback>
                  </Form.Group>
                  <Button type="submit" className="login-btn w-100" disabled={isLoadingAdmin}>
                    {isLoadingAdmin ? <><Spinner size="sm" className="me-2" />Ingresando...</> : "Ingresar"}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>

          <p className="login-back">
            <a href="/" className="login-back-link">
              ← Volver al inicio
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}
