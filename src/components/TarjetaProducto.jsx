import { Link } from "react-router-dom";
import Precio from "./Precio";
import BotonAgregar from "./BotonAgregar";
import { resolverImagen } from "../utils/imagenes";

/* Una tarjeta = un producto. Su única responsabilidad es mostrarlo; el
   botón de compra (con su estado y mensaje) vive en BotonAgregar.

   Props:
   - producto:  el objeto del catálogo
   - onAgregar: función(producto) → unidades agregadas (la entrega quien usa la tarjeta) */
function TarjetaProducto({ producto, onAgregar }) {
    return (
        <div className="col">
            <div className="card h-100 shadow-sm">
                <Link to={`/productos/${producto.id}`} className="text-decoration-none text-dark">
                    <img
                        src={resolverImagen(producto.imagenes[0])}
                        className="card-img-top"
                        alt={producto.nombre}
                        style={{ height: 250, objectFit: "cover" }}
                    />
                </Link>

                <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{producto.nombre}</h5>
                    <p className="card-text mb-0">
                        <Precio producto={producto} />
                    </p>
                </div>

                <div className="card-footer bg-transparent border-top-0 pt-0">
                    <BotonAgregar producto={producto} onAgregar={onAgregar} className="w-100" />
                </div>
            </div>
        </div>
    );
}

export default TarjetaProducto;
