import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Orden importante: Bootstrap primero, tus estilos después (para que ganen)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // dropdown, collapse, offcanvas, modal

import App from "./App.jsx";
import CarritoProvider from "./context/CarritoProvider.jsx";
import SesionProvider from "./context/SesionProvider.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        {/* BrowserRouter habilita <Link>, <NavLink> y <Routes> en toda la app */}
        <BrowserRouter>
            {/* CarritoProvider: todo lo que esté adentro puede usar useCarrito() */}
            <SesionProvider>
                <CarritoProvider>
                    <App />
                </CarritoProvider>
            </SesionProvider>
        </BrowserRouter>
    </StrictMode>
);
