import { Link } from "react-router-dom";

function PagoFallido({ resultado, onReintentar, reintentando = false, error = "" }) {
    return (
        <div className="text-center py-5" role="alert">
            <i className="bi bi-x-circle-fill text-danger display-3" aria-hidden="true"></i>
            <h2 className="mt-3">No se pudo realizar el pago</h2>
            <p className="lead mb-1">{resultado.motivo}</p>
            {resultado.numero && (
                <p className="text-muted">
                    El pedido <strong>{resultado.numero}</strong> quedó registrado.
                </p>
            )}
            <p className="text-muted">
                No se realizó ningún cobro. Código de error: <code>{resultado.codigo}</code>
            </p>

            {error && (
                <div className="alert alert-danger mt-3" role="alert">{error}</div>
            )}

            <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onReintentar}
                    disabled={reintentando}
                >
                    {reintentando ? "Reintentando..." : "Reintentar pago"}
                </button>
                <Link to="/productos" className="btn btn-outline-primary">Seguir comprando</Link>
            </div>
        </div>
    );
}

export default PagoFallido;
