import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "../shared/layout/Navbar";
import Footer from "../shared/layout/Footer";

import Home from "../pages/Home/Home";
import Servicios from "../pages/Servicios/Servicios";
import Galeria from "../pages/Galeria/Galeria";
import Contacto from "../pages/Contacto/Contacto";
import Productos from "../pages/Productos/Productos";
import Equipos from "../pages/Equipos/Equipos";
import Insumos from "../pages/Insumos/Insumos";
import Contactos from "../pages/Contactos/Contactos";
import Presupuestos from "../pages/Presupuestos/Presupuestos";
import News from "../pages/News/News";

import ScrollToTop from "../shared/utils/ScrollToTop";

function App() {
  return (
    <BrowserRouter>

      <ScrollToTop />

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/insumos" element={<Insumos />} />
        <Route path="/contactos" element={<Contactos />} />
        <Route path="/presupuestos" element={<Presupuestos />} />
        <Route path="/news" element={<News />} />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}

export default App;