/* src/pedidos.js — pedidos confirmados (JavaScript puro, sin React).
   Antes este código estaba dentro del evento "submit" de checkout.js.
   Separarlo permite probarlo y reutilizarlo (por ejemplo, en un panel de pedidos). */

export const CLAVE_PEDIDO = "kateye_ultimo_pedido";

/* Arma el pedido, lo guarda en localStorage y lo devuelve.
   No hay backend: el pedido queda solo en el navegador.

   Recibe:
   - cliente: { nombre, correo, telefono, direccion, comuna } (ya recortados)
   - pago:    "Tarjeta" | "Transferencia"
   - lineas:  las líneas del carrito (de useCarrito)
   - total:   número */
export function crearPedido({ cliente, pago, lineas, total }) {
    const pedido = {
        numero: "KE-" + Date.now().toString().slice(-6),
        fecha: new Date().toISOString(),
        cliente,
        pago,
        items: lineas.map(l => ({
            id: l.id,
            nombre: l.nombre,
            precio: l.precio,
            cantidad: l.cantidad,
        })),
        total,
    };

    try {
        localStorage.setItem(CLAVE_PEDIDO, JSON.stringify(pedido));
    } catch {
        /* sin almacenamiento: el pedido igual se muestra en pantalla */
    }

    return pedido;
}
