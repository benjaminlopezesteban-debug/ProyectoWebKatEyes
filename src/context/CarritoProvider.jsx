import { useEffect, useMemo, useState } from "react";
import { CarritoContext } from "./CarritoContext";
import { listarProductos } from "../api/endpoints/productos";
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
    reconciliarCarrito,
} from "../carrito";

function CarritoProvider({ children }) {
    const [carrito, setCarrito] = useState(leerCarritoGuardado);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let activo = true;

        listarProductos()
            .then((productos) => {
                if (!activo) return;
                setCarrito(prev => reconciliarCarrito(prev, productos));
                setError(null);
            })
            .catch((fallo) => {
                if (activo) setError(fallo);
            })
            .finally(() => {
                if (activo) setCargando(false);
            });

        return () => {
            activo = false;
        };
    }, []);

    useEffect(() => {
        guardarCarritoEnStorage(carrito);
    }, [carrito]);

    const lineas = useMemo(() => detallarCarrito(carrito), [carrito]);

    function agregarAlCarrito(producto, cantidad = 1) {
        const { carrito: nuevo, agregadas } = agregarItem(carrito, producto.id, cantidad, producto);
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
        setCarrito([]);
    }

    const valor = {
        lineas,
        cargando,
        error,
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
