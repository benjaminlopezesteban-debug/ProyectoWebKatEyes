import { formatearPrecio } from "../utils/formatearPrecio";

/* Antes: precioHTML(p, tamano) en data.js, que devolvía un STRING de HTML.
   Ahora es un componente que devuelve JSX: ya no hay que armar texto con
   template strings ni preocuparse de escapar contenido. */
function Precio({ producto, tamano = "h4" }) {
    const actual = producto.precioFinal ?? producto.precio;
    const anterior = producto.precioOferta != null ? producto.precio : producto.precioAnterior;

    // Sin descuento: solo el precio
    if (!anterior || anterior <= actual) {
        return <span className={`${tamano} text-primary`}>{formatearPrecio(actual)}</span>;
    }

    // Con descuento: precio tachado + precio actual + insignia con el %
    const descuento = Math.round((1 - actual / anterior) * 100);
    return (
        <>
            <span className="text-muted text-decoration-line-through small">
                {formatearPrecio(anterior)}
            </span>
            <span className={`${tamano} text-danger ms-1`}>{formatearPrecio(actual)}</span>
            <span className="badge bg-danger ms-1">-{descuento}%</span>
        </>
    );
}

export default Precio;
