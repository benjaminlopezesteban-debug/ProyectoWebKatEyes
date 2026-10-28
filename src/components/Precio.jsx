import { formatearPrecio } from "../utils/formatearPrecio";

/* Antes: precioHTML(p, tamano) en data.js, que devolvía un STRING de HTML.
   Ahora es un componente que devuelve JSX: ya no hay que armar texto con
   template strings ni preocuparse de escapar contenido. */
function Precio({ producto, tamano = "h4" }) {
    const { precio, precioAnterior } = producto;

    // Sin descuento: solo el precio
    if (!precioAnterior || precioAnterior <= precio) {
        return <span className={`${tamano} text-primary`}>{formatearPrecio(precio)}</span>;
    }

    // Con descuento: precio tachado + precio actual + insignia con el %
    const descuento = Math.round((1 - precio / precioAnterior) * 100);
    return (
        <>
            <span className="text-muted text-decoration-line-through small">
                {formatearPrecio(precioAnterior)}
            </span>
            <span className={`${tamano} text-danger ms-1`}>{formatearPrecio(precio)}</span>
            <span className="badge bg-danger ms-1">-{descuento}%</span>
        </>
    );
}

export default Precio;
