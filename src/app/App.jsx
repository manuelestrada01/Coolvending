import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../shared/utils/ThemeContext";
import { AuthProvider } from "../shared/utils/AuthContext";
import ProtectedRoute from "../shared/utils/ProtectedRoute";

import Navbar from "../shared/layout/Navbar";
import Footer from "../shared/layout/Footer";
import WhatsAppFloatButton from "../shared/layout/WhatsAppFloatButton";

import Home from "../pages/Home/Home";
import Contacto from "../pages/Contacto/Contacto";
import Equipos from "../pages/Equipos/Equipos";
import EquipoDetalle from "../pages/Equipos/EquipoDetalle";
import Insumos from "../pages/Insumos/Insumos";
import InsumoDetalle from "../pages/Insumos/InsumoDetalle";
import Presupuestos from "../pages/Presupuestos/Presupuestos";
import Eventos from "../pages/Eventos/Eventos";

import Login from "../pages/Login/Login";
import AdminLayout from "../pages/Admin/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import MaquinasAdmin from "../pages/Admin/MaquinasAdmin";
import EventosAdmin from "../pages/Admin/EventosAdmin";
import InsumosAdmin from "../pages/Admin/InsumosAdmin";
import UsuariosAdmin from "../pages/Admin/UsuariosAdmin";

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
            <Route path="/equipos/:id" element={<EquipoDetalle />} />
            <Route path="/insumos" element={<Insumos />} />
            <Route path="/insumos/:id" element={<InsumoDetalle />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/presupuestos" element={<Presupuestos />} />
            <Route path="/eventos" element={<Eventos />} />
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
              <Route path="eventos" element={<EventosAdmin />} />
              <Route path="insumos" element={<InsumosAdmin />} />
              <Route path="usuarios" element={<UsuariosAdmin />} />
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