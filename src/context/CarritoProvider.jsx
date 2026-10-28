import { useEffect, useMemo, useState } from "react";
import { CarritoContext } from "./CarritoContext";
import {
    agregarItem,
    cambiarCantidadItem,
    eliminarItem,
    detallarCarrito,
    totalCarrito,
    ahorroCarrito,
    contarUnidades,
    leerCarritoGuardado,
    guardarCarritoEnStorage,
} from "../carrito";

/* Dueño del estado del carrito. Reemplaza a obtenerCarrito()/guardarCarrito()
   que leían y escribían localStorage en cada operación.
   Ahora: el estado vive en React y localStorage solo es el respaldo. */
function CarritoProvider({ children }) {
    // Función dentro de useState = "inicialización perezosa": se ejecuta UNA vez
    // (al abrir la app) y no en cada render.
    const [carrito, setCarrito] = useState(leerCarritoGuardado);

    // Cada vez que el carrito cambia, se respalda (regla 7)
    useEffect(() => {
        guardarCarritoEnStorage(carrito);
    }, [carrito]);

    // Datos derivados: se calculan a partir del estado, no se guardan aparte
    const lineas = useMemo(() => detallarCarrito(carrito), [carrito]);

    /* Devuelve cuántas unidades se agregaron (0 si ya estaba en el máximo),
       porque TarjetaProducto usa ese número para decir "✓ Añadido" o "Máximo alcanzado". */
    function agregarAlCarrito(producto, cantidad = 1) {
        const { carrito: nuevo, agregadas } = agregarItem(carrito, producto.id, cantidad);
        if (agregadas > 0) setCarrito(nuevo);
        return agregadas;
    }

    function cambiarCantidad(id, delta) {
        setCarrito(prev => cambiarCantidadItem(prev, id, delta));
    }

    function eliminarDelCarrito(id) {
        setCarrito(prev => eliminarItem(prev, id));
    }

    function vaciarCarrito() {
        setCarrito([]); // lo usará el checkout al confirmar la compra
    }

    const valor = {
        lineas,
        cantidadTotal: contarUnidades(carrito),
        total: totalCarrito(lineas),
        ahorro: ahorroCarrito(lineas),
        agregarAlCarrito,
        cambiarCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
    };

    return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export default CarritoProvider;
