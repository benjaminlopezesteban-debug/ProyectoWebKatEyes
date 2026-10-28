import { Link } from "react-router-dom";
import { formatearPrecio } from "../utils/formatearPrecio";
import { resolverImagen } from "../utils/imagenes";

/* Resumen del pedido (la tarjeta de la derecha en el checkout).
   Solo muestra datos: no sabe de dónde vienen (carrito, pedido guardado...). */
function ResumenPedido({ lineas, total, ahorro }) {
    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h2 id="titulo-resumen" className="h5 mb-3">Resumen del pedido</h2>

                {lineas.map(l => (
                    <div className="d-flex align-items-center mb-3" key={l.id}>
                        <img
                            src={resolverImagen(l.imagen)}
                            alt={l.nombre}
                            className="rounded me-3"
                            style={{ width: 64, height: 64, objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                            <div className="fw-semibold">{l.nombre}</div>
                            <small className="text-muted">
                                {l.cantidad} × {formatearPrecio(l.precio)}
                            </small>
                        </div>
                        <strong>{formatearPrecio(l.precio * l.cantidad)}</strong>
                    </div>
                ))}

                <hr />

                {/* Antes: la fila existía siempre y se ocultaba con "hidden" */}
                {ahorro > 0 && (
                    <div className="d-flex justify-content-between">
                        <span>Ahorras</span>
                        <span className="text-success">{formatearPrecio(ahorro)}</span>
                    </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="h5 m-0">Total</span>
                    <strong className="h4 m-0 text-primary">{formatearPrecio(total)}</strong>
                </div>

                <Link to="/productos" className="btn btn-link px-0 mt-3">← Seguir comprando</Link>
            </div>
        </div>
    );
}

export default ResumenPedido;
