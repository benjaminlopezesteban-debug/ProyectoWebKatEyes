import { useCarrito } from "../context/CarritoContext";

/* Antes: <button id="btn-carrito"> copiado en cada página, con su contador
   actualizado por actualizarContadorCarrito(). Ahora el número viene
   directo del contexto y React lo mantiene al día solo. */
function CarritoFlotante() {
    const { cantidadTotal } = useCarrito();

    return (
        <button
            type="button"
            className="btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-3 p-3 lh-1"
            data-bs-toggle="offcanvas"
            data-bs-target="#panel-carrito"
            aria-controls="panel-carrito"
            aria-label="Abrir carrito"
        >
            <i className="bi-cart-fill fs-4"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cantidadTotal}
            </span>
        </button>
    );
}

export default CarritoFlotante;
