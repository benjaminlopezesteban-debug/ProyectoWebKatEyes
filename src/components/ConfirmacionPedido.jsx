import { Link } from "react-router-dom";
import { formatearPrecio } from "../utils/formatearPrecio";

/* Pantalla de "¡Gracias por tu compra!". Recibe el pedido ya creado:
   los datos salen de él y no del carrito, porque a esta altura el carrito
   ya está vacío. */
function ConfirmacionPedido({ pedido }) {
    return (
        <div className="text-center py-5" aria-live="polite">
            <i className="bi bi-check-circle-fill text-success display-3" aria-hidden="true"></i>
            <h2 className="mt-3">¡Gracias por tu compra!</h2>
            <p className="lead mb-1">
                Tu pedido <strong>{pedido.numero}</strong> fue registrado.
            </p>
            <p className="text-muted">
                Total: {formatearPrecio(pedido.total)}. Enviaremos el detalle a {pedido.cliente.correo}.
            </p>
            <Link to="/" className="btn btn-primary mt-3">Volver al inicio</Link>
        </div>
    );
}

export default ConfirmacionPedido;
