import { createContext, useContext } from "react";

/* Mismo patrón que CarritoContext: este archivo define el "canal" y el hook
   para leerlo. Quien lo llena es SesionProvider.jsx.
   Cualquier componente puede saber quién tiene la sesión iniciada con:
       const { usuario } = useSesion();      // usuario es null si nadie inició sesión */
export const SesionContext = createContext(null);

export function useSesion() {
    const contexto = useContext(SesionContext);
    if (!contexto) {
        throw new Error("useSesion debe usarse dentro de <SesionProvider>");
    }
    return contexto;
}
