/* src/carrito.js — reglas del carrito (JavaScript puro, sin React).
   Migración de js/carrito.js. Aquí vive la LÓGICA; el estado y la interfaz
   están en context/ y components/. Al ser funciones puras (reciben datos y
   devuelven datos nuevos, sin tocar el DOM) son fáciles de probar con Jasmine.

   REGLAS DEL CARRITO (las mismas de tu versión HTML)
   1. La cantidad de cada producto es un entero entre 1 y MAX_UNIDADES_POR_PRODUCTO.
   2. Si se intenta superar el máximo, se limita (y se avisa al usuario).
   3. Un producto que llega a 0 unidades se elimina del carrito.
   4. Un mismo producto no se duplica: se suma a su línea existente.
   5. Nombre, precio e imagen se leen siempre del catálogo, no de localStorage.
   6. Los ítems corruptos o cuyo id ya no existe en el catálogo se descartan.
   7. El carrito se guarda en localStorage y se comparte entre todas las páginas.
   8. No se puede ir a pagar con el carrito vacío (botón deshabilitado en el panel).

   FORMATO: el carrito es un arreglo de { id, cantidad }. Lo demás (nombre,
   precio, imagen) se obtiene del catálogo con detallarCarrito(): así
   cumplimos la regla 5 de forma natural, porque ni siquiera se guarda. */

import { obtenerProductoPorId } from "./productos";

export const CLAVE_CARRITO = "kateye_carrito";
export const MAX_UNIDADES_POR_PRODUCTO = 10;

/* ---------- Operaciones sobre el carrito (devuelven un carrito NUEVO) ---------- */

/* Devuelve { carrito, agregadas }. "agregadas" es cuántas unidades se
   sumaron de verdad (0 si ya estaba en el máximo). Reglas 1, 2 y 4. */
export function agregarItem(carrito, id, cantidad = 1) {
    const existente = carrito.find(i => i.id === id);
    const actual = existente ? existente.cantidad : 0;
    const permitido = Math.max(0, Math.min(cantidad, MAX_UNIDADES_POR_PRODUCTO - actual));
    if (permitido === 0) return { carrito, agregadas: 0 };

    const nuevo = existente
        ? carrito.map(i => (i.id === id ? { ...i, cantidad: i.cantidad + permitido } : i))
        : [...carrito, { id, cantidad: permitido }];
    return { carrito: nuevo, agregadas: permitido };
}

/* Suma o resta unidades (delta = +1 / -1). Reglas 1, 2 y 3. */
export function cambiarCantidadItem(carrito, id, delta) {
    return carrito
        .map(i => (i.id === id
            ? { ...i, cantidad: Math.min(i.cantidad + delta, MAX_UNIDADES_POR_PRODUCTO) }
            : i))
        .filter(i => i.cantidad > 0);
}

export function eliminarItem(carrito, id) {
    return carrito.filter(i => i.id !== id);
}

/* ---------- Saneamiento: de lo guardado a un carrito válido (reglas 1, 4 y 6) ---------- */
export function sanearCarrito(guardado) {
    if (!Array.isArray(guardado)) return [];

    return guardado.reduce((lista, item) => {
        const producto = obtenerProductoPorId(item?.id);
        const cantidad = Math.floor(Number(item?.cantidad));
        if (!producto || !(cantidad >= 1)) return lista;       // regla 6
        return agregarItem(lista, producto.id, cantidad).carrito; // reglas 1, 2 y 4
    }, []);
}

/* ---------- Datos derivados ---------- */

/* Une cada { id, cantidad } con los datos reales del catálogo (regla 5).
   Si el producto ya no existe, esa línea se descarta (regla 6). */
export function detallarCarrito(carrito) {
    return carrito.reduce((lineas, item) => {
        const p = obtenerProductoPorId(item.id);
        if (!p) return lineas;
        lineas.push({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,
            precioAnterior: p.precioAnterior > p.precio ? p.precioAnterior : null,
            imagen: p.imagenes[0],
            cantidad: item.cantidad,
        });
        return lineas;
    }, []);
}

// Los tres reciben las "líneas" que devuelve detallarCarrito()
export function totalCarrito(lineas) {
    return lineas.reduce((acc, l) => acc + l.precio * l.cantidad, 0);
}

export function ahorroCarrito(lineas) {
    return lineas.reduce(
        (acc, l) => acc + (l.precioAnterior ? (l.precioAnterior - l.precio) * l.cantidad : 0),
        0
    );
}

export function contarUnidades(carrito) {
    return carrito.reduce((acc, i) => acc + i.cantidad, 0);
}

/* ---------- localStorage (regla 7) ---------- */
export function leerCarritoGuardado() {
    try {
        return sanearCarrito(JSON.parse(localStorage.getItem(CLAVE_CARRITO)));
    } catch {
        return []; // JSON roto o localStorage no disponible
    }
}

export function guardarCarritoEnStorage(carrito) {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch {
        /* sin almacenamiento: el carrito sigue funcionando en memoria */
    }
}
