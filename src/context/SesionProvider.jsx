import { useState } from "react";
import { SesionContext } from "./SesionContext";
import { obtenerUsuarioPorId } from "../usuarios";

const CLAVE_SESION = "kateye_sesion";

/* Al abrir la app se recupera la sesión guardada. Solo se guarda el ID:
   los datos se leen de usuarios.js, así que si el usuario ya no existe
   la sesión se descarta (igual que el carrito descarta productos inexistentes). */
function leerSesionGuardada() {
    try {
        const id = JSON.parse(localStorage.getItem(CLAVE_SESION));
        return id ? obtenerUsuarioPorId(id) : null;
    } catch {
        return null;
    }
}

function SesionProvider({ children }) {
    const [usuario, setUsuario] = useState(leerSesionGuardada);

    function iniciarSesion(nuevoUsuario) {
        setUsuario(nuevoUsuario);
        try {
            localStorage.setItem(CLAVE_SESION, JSON.stringify(nuevoUsuario.id));
        } catch {
            /* sin almacenamiento: la sesión dura hasta recargar */
        }
    }

    function cerrarSesion() {
        setUsuario(null);
        try {
            localStorage.removeItem(CLAVE_SESION);
        } catch {
            /* nada que hacer */
        }
    }

    return (
        <SesionContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
            {children}
        </SesionContext.Provider>
    );
}

export default SesionProvider;
