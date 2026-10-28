import { useEffect, useState } from "react";
import { MAX_UNIDADES_POR_PRODUCTO } from "../carrito";

/* Botón "Añadir al carrito" con su mensaje temporal ("✓ Añadido").
   Esta lógica estaba dentro de TarjetaProducto; ahora que la necesitan
   también las filas de la página de inicio, se extrae a su propio componente
   (así hay una sola copia que mantener).

   Props:
   - producto:  el producto a agregar
   - onAgregar: función(producto) que devuelve cuántas unidades se agregaron
   - texto:     texto normal del botón
   - className: clases extra (por ejemplo "w-100") */
function BotonAgregar({ producto, onAgregar, texto = "Añadir al carrito", className = "" }) {
    // null (normal) | "ok" (se añadió) | "maximo" (ya estaba en el máximo)
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
        if (resultado === null) return;
        const temporizador = setTimeout(() => setResultado(null), 1200);
        return () => clearTimeout(temporizador);
    }, [resultado]);

    function manejarClick() {
        const agregadas = onAgregar(producto);
        setResultado(agregadas > 0 ? "ok" : "maximo");
    }

    const textoBoton =
        resultado === "ok" ? "✓ Añadido"
        : resultado === "maximo" ? `Máx. ${MAX_UNIDADES_POR_PRODUCTO} unidades`
        : texto;

    return (
        <button
            type="button"
            className={`btn btn-primary btn-agregar ${resultado === "ok" ? "agregado" : ""} ${className}`}
            onClick={manejarClick}
        >
            {textoBoton}
        </button>
    );
}

export default BotonAgregar;
