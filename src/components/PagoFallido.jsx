import { Link } from "react-router-dom";

/* Pantalla "No se pudo realizar el pago" (Figura 8 del PDF de la evaluación).
   Es la contraparte de ConfirmacionPedido.

   Props:
   - resultado:   { codigo, motivo } que devolvió procesarPago()
   - onReintentar: función que vuelve al formulario (con los datos intactos) */
function PagoFallido({ resultado, onReintentar }) {
    return (
        <div className="text-center py-5" role="alert">
            <i className="bi bi-x-circle-fill text-danger display-3" aria-hidden="true"></i>
            <h2 className="mt-3">No se pudo realizar el pago</h2>
            <p className="lead mb-1">{resultado.motivo}</p>
            <p className="text-muted">
                No se realizó ningún cobro y tu carrito sigue intacto.
                Código de error: <code>{resultado.codigo}</code>
            </p>

            <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">
                <button type="button" className="btn btn-primary" onClick={onReintentar}>
                    Reintentar pago
                </button>
                <Link to="/productos" className="btn btn-outline-primary">Seguir comprando</Link>
            </div>
        </div>
    );
}

export default PagoFallido;
