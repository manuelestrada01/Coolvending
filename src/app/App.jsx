import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../shared/utils/ThemeContext";
import { AuthProvider } from "../shared/utils/AuthContext";
import ProtectedRoute from "../shared/utils/ProtectedRoute";

import Navbar from "../shared/layout/Navbar";
import Footer from "../shared/layout/Footer";
import WhatsAppFloatButton from "../shared/layout/WhatsAppFloatButton";

import Home from "../pages/Home/Home";
import Servicios from "../pages/Servicios/Servicios";
import Galeria from "../pages/Galeria/Galeria";
import Contacto from "../pages/Contacto/Contacto";
import Productos from "../pages/Productos/Productos";
import Equipos from "../pages/Equipos/Equipos";
import Insumos from "../pages/Insumos/Insumos";
import Presupuestos from "../pages/Presupuestos/Presupuestos";
import News from "../pages/News/News";

import Login from "../pages/Login/Login";
import AdminLayout from "../pages/Admin/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import MaquinasAdmin from "../pages/Admin/MaquinasAdmin";

import ScrollToTop from "../shared/utils/ScrollToTop";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/insumos" element={<Insumos />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/presupuestos" element={<Presupuestos />} />
            <Route path="/news" element={<News />} />
            <Route path="/login" element={<Login />} />

            {/* Admin — solo accesible a usuarios con rol "admin" */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="maquinas" element={<MaquinasAdmin />} />
            </Route>
          </Routes>

          <Footer />
          <WhatsAppFloatButton />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;