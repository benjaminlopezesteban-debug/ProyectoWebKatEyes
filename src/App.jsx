import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PanelCarrito from "./components/PanelCarrito";
import CarritoFlotante from "./components/CarritoFlotante";
import { useCarrito } from "./context/CarritoContext";
import { useSesion } from "./context/SesionContext";

import Inicio from "./views/Inicio";
import Productos from "./views/Productos";
import DetalleProducto from "./views/DetalleProducto";
import Checkout from "./views/Checkout";
import Blogs from "./views/Blogs";
import Blog from "./views/Blog";
import Nosotros from "./views/Nosotros";
import Contacto from "./views/Contacto";
import IniciarSesion from "./views/IniciarSesion";
import Registro from "./views/Registro";

/* Rutas inexistentes (y, más adelante, el panel de administración que aún no se migra) */
function EnConstruccion() {
    return (
        <div className="container my-5">
            <p className="lead">Esta página aún no se ha migrado.</p>
        </div>
    );
}

function App() {
    const { cantidadTotal } = useCarrito();
    const { usuario, cerrarSesion } = useSesion();

    return (
        <>
            {/* Header y Footer quedan fuera de <Routes>: se ven en todas las páginas.
                Es lo que antes lograbas cargándolos con fetch() en cada HTML. */}
            <Header cantidadCarrito={cantidadTotal} usuario={usuario} onCerrarSesion={cerrarSesion} />

            <main>
                <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/productos" element={<Productos />} />
                    <Route path="/productos/:id" element={<DetalleProducto />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blogs/:slug" element={<Blog />} />
                    <Route path="/nosotros" element={<Nosotros />} />
                    <Route path="/contacto" element={<Contacto />} />
                    <Route path="/iniciar-sesion" element={<IniciarSesion />} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="*" element={<EnConstruccion />} />
                </Routes>
            </main>

            <Footer />

            {/* Una sola vez para toda la app (antes se copiaban en cada HTML) */}
            <PanelCarrito />
            <CarritoFlotante />
        </>
    );
}

export default App;
