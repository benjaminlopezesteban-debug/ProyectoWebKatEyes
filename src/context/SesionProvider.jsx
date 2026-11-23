import { useCallback, useEffect, useState } from "react";
import { SesionContext } from "./SesionContext";
import { TOKEN_KEY } from "../api/client";
import {
    cerrarSesionApi,
    iniciarSesionApi,
    obtenerPerfil,
    registrarUsuarioApi,
} from "../api/endpoints/usuarios";

function SesionProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        let activo = true;
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
            setCargando(false);
            return () => {
                activo = false;
            };
        }

        obtenerPerfil()
            .then((perfil) => {
                if (activo) setUsuario(perfil);
            })
            .catch((error) => {
                if (error?.estado === 401) {
                    localStorage.removeItem(TOKEN_KEY);
                }
                if (activo) setUsuario(null);
            })
            .finally(() => {
                if (activo) setCargando(false);
            });

        return () => {
            activo = false;
        };
    }, []);

    useEffect(() => {
        function alExpirarSesion() {
            setUsuario(null);
        }

        window.addEventListener("kateye:sesion-expirada", alExpirarSesion);
        return () => window.removeEventListener("kateye:sesion-expirada", alExpirarSesion);
    }, []);

    const iniciarSesion = useCallback(async (correo, password) => {
        const data = await iniciarSesionApi(correo, password);
        localStorage.setItem(TOKEN_KEY, data.token);
        setUsuario(data.usuario);
        return data.usuario;
    }, []);

    const registrar = useCallback(async (datos) => {
        const data = await registrarUsuarioApi(datos);
        localStorage.setItem(TOKEN_KEY, data.token);
        setUsuario(data.usuario);
        return data.usuario;
    }, []);

    const cerrarSesion = useCallback(async () => {
        try {
            await cerrarSesionApi();
        } catch {
            /* la sesión local se cierra igual */
        }
        localStorage.removeItem(TOKEN_KEY);
        setUsuario(null);
    }, []);

    return (
        <SesionContext.Provider value={{ usuario, cargando, iniciarSesion, registrar, cerrarSesion }}>
            {children}
        </SesionContext.Provider>
    );
}

export default SesionProvider;
