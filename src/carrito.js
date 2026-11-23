export const CLAVE_CARRITO = "kateye_carrito_v2";
export const CLAVE_CARRITO_LEGADO = "kateye_carrito";
export const MAX_UNIDADES_POR_PRODUCTO = 10;

export function maximoProducto(producto) {
    const stock = Number(producto?.stock);
    return Number.isFinite(stock) && stock > 0
        ? Math.min(MAX_UNIDADES_POR_PRODUCTO, stock)
        : MAX_UNIDADES_POR_PRODUCTO;
}

export function agregarItem(carrito, id, cantidad = 1, producto = null) {
    const existente = carrito.find(i => i.id === id);
    const actual = existente ? existente.cantidad : 0;
    const maximo = maximoProducto(producto ?? existente?.producto);
    const permitido = Math.max(0, Math.min(cantidad, maximo - actual));
    if (permitido === 0) return { carrito, agregadas: 0 };

    const nuevo = existente
        ? carrito.map(i => (i.id === id
            ? { ...i, cantidad: i.cantidad + permitido, ...(producto ? { producto } : {}) }
            : i))
        : [...carrito, { id, cantidad: permitido, ...(producto ? { producto } : {}) }];
    return { carrito: nuevo, agregadas: permitido };
}

export function cambiarCantidadItem(carrito, id, delta) {
    return carrito
        .map(i => (i.id === id
            ? { ...i, cantidad: Math.min(i.cantidad + delta, maximoProducto(i.producto)) }
            : i))
        .filter(i => i.cantidad > 0);
}

export function eliminarItem(carrito, id) {
    return carrito.filter(i => i.id !== id);
}

export function sanearCarrito(guardado) {
    if (!Array.isArray(guardado)) return [];

    return guardado.reduce((lista, item) => {
        const producto = item?.producto;
        const cantidad = Math.floor(Number(item?.cantidad));
        if (!producto?.id || !(cantidad >= 1)) return lista;
        return agregarItem(lista, producto.id, cantidad, producto).carrito;
    }, []);
}

export function reconciliarCarrito(carrito, productos) {
    const porId = new Map(productos.map(producto => [producto.id, producto]));

    return carrito.reduce((lista, item) => {
        const producto = porId.get(item.id);
        if (!producto || !producto.activo || Number(producto.stock) <= 0) return lista;
        const cantidad = Math.min(Math.max(1, Number(item.cantidad) || 1), maximoProducto(producto));
        return agregarItem(lista, producto.id, cantidad, producto).carrito;
    }, []);
}

export function detallarCarrito(carrito) {
    return carrito.reduce((lineas, item) => {
        const p = item.producto;
        if (!p) return lineas;
        const precio = p.precioFinal ?? p.precio;
        const precioAnterior = p.precioOferta != null
            ? p.precio
            : (p.precioAnterior > precio ? p.precioAnterior : null);
        lineas.push({
            id: p.id,
            nombre: p.nombre,
            precio,
            precioAnterior,
            imagen: p.imagenUrl ?? p.imagenes?.[0],
            imagenUrl: p.imagenUrl ?? null,
            stock: p.stock,
            max: maximoProducto(p),
            cantidad: item.cantidad,
        });
        return lineas;
    }, []);
}

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

export function leerCarritoGuardado() {
    try {
        const actual = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
        if (Array.isArray(actual)) return sanearCarrito(actual);

        const legado = JSON.parse(localStorage.getItem(CLAVE_CARRITO_LEGADO));
        if (Array.isArray(legado)) {
            const migrado = sanearCarrito(legado);
            localStorage.removeItem(CLAVE_CARRITO_LEGADO);
            return migrado;
        }

        return [];
    } catch {
        return [];
    }
}

export function guardarCarritoEnStorage(carrito) {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch {
        /* sin almacenamiento: el carrito sigue funcionando en memoria */
    }
}
