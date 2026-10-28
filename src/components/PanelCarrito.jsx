import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { MAX_UNIDADES_POR_PRODUCTO } from "../carrito";
import { formatearPrecio } from "../utils/formatearPrecio";
import { resolverImagen } from "../utils/imagenes";
import Precio from "./Precio";

/* Antes: el mismo bloque <div id="panel-carrito"> copiado en index.html,
   productos.html y detalleProductos.html, más renderCarrito() en carrito.js.
   Ahora existe UNA sola vez (se monta en App.jsx) y se dibuja a partir
   de los datos del contexto. Bootstrap lo abre y cierra con los atributos
   data-bs-* (el botón del Header y el flotante apuntan a #panel-carrito). */
function PanelCarrito() {
    const { lineas, total, ahorro, cambiarCantidad, eliminarDelCarrito } = useCarrito();
    const navigate = useNavigate();
    const vacio = lineas.length === 0;

    return (
        <div
            className="offcanvas offcanvas-end"
            tabIndex="-1"
            id="panel-carrito"
            aria-labelledby="panel-carrito-label"
        >
            <div className="offcanvas-header border-bottom">
                <h5 className="offcanvas-title" id="panel-carrito-label">Tu Carrito</h5>
                <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
            </div>

            <div className="offcanvas-body">
                <div className="items-carrito">
                    {vacio && <p className="text-center text-muted mt-4">Tu carrito está vacío</p>}

                    {lineas.map(l => (
                        <div className="d-flex align-items-center mb-3" key={l.id}>
                            <img
                                src={resolverImagen(l.imagen)}
                                alt={l.nombre}
                                className="img-fluid rounded me-3"
                                style={{ width: 80, height: 80, objectFit: "cover" }}
                            />
                            <div className="flex-grow-1">
                                <h6 className="mb-1">{l.nombre}</h6>
                                <p className="mb-1">
                                    <Precio producto={l} tamano="fs-6" />
                                </p>
                                <div className="d-flex align-items-center">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        aria-label={`Quitar una unidad de ${l.nombre}`}
                                        onClick={() => cambiarCantidad(l.id, -1)}
                                    >
                                        −
                                    </button>
                                    <span className="mx-2">{l.cantidad}</span>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        aria-label={`Agregar una unidad de ${l.nombre}`}
                                        disabled={l.cantidad >= MAX_UNIDADES_POR_PRODUCTO}
                                        onClick={() => cambiarCantidad(l.id, 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger ms-3"
                                aria-label={`Eliminar ${l.nombre}`}
                                onClick={() => eliminarDelCarrito(l.id)}
                            >
                                <i className="bi-trash-fill"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="offcanvas-footer p-3 border-top">
                {ahorro > 0 && (
                    <div className="d-flex justify-content-between text-success fw-bold mb-2">
                        <span>Ahorro total:</span>
                        <span>{formatearPrecio(ahorro)}</span>
                    </div>
                )}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <p className="h5 m-0">Total:</p>
                    <p className="h5 m-0">{formatearPrecio(total)}</p>
                </div>
                <div className="d-grid">
                    {/* Regla 8: con el carrito vacío el botón está deshabilitado.
                        data-bs-dismiss cierra el panel antes de cambiar de página. */}
                    <button
                        type="button"
                        className="btn btn-primary"
                        disabled={vacio}
                        data-bs-dismiss="offcanvas"
                        onClick={() => navigate("/checkout")}
                    >
                        Ir a pagar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PanelCarrito;
