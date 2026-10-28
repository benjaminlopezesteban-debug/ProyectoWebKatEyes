import { createContext, useContext } from "react";

/* Un Context es un "canal" por el que el carrito llega a cualquier
   componente sin pasarlo de padre a hijo en cada nivel (prop drilling).
   Header, Productos, PanelCarrito y el futuro Checkout lo leerán del mismo sitio.

   Este archivo solo define el canal y el hook para leerlo.
   Quien llena el canal es CarritoProvider.jsx. */
export const CarritoContext = createContext(null);

export function useCarrito() {
    const contexto = useContext(CarritoContext);
    if (!contexto) {
        throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
    }
    return contexto;
}
