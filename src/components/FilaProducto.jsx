import { Link } from "react-router-dom";
import Precio from "./Precio";
import BotonAgregar from "./BotonAgregar";
import { resolverImagen } from "../utils/imagenes";

/* Un producto en formato "fila" (imagen | descripción | precio y botones).
   Antes lo generaba renderListaProductos() de index.js con template strings.
   Mismas props que TarjetaProducto: producto y onAgregar. */
function FilaProducto({ producto, onAgregar }) {
    return (
        <div className="card shadow-sm">
            <div className="row g-0 align-items-center">
                <div className="col-md-3">
                    <img
                        src={resolverImagen(producto.imagenes[0])}
                        className="img-fluid rounded-start w-100"
                        alt={producto.nombre}
                        style={{ height: 200, objectFit: "cover" }}
                    />
                </div>

                <div className="col-md-6">
                    <div className="card-body">
                        <h5 className="card-title">{producto.nombre}</h5>
                        <p className="card-text text-muted mb-1">{producto.categoria}</p>
                        <p className="card-text">{producto.descripcion}</p>
                    </div>
                </div>

                <div className="col-md-3 p-3 text-center">
                    <p className="card-text mb-2">
                        <Precio producto={producto} />
                    </p>
                    <BotonAgregar
                        producto={producto}
                        onAgregar={onAgregar}
                        texto="Agregar al carrito"
                        className="w-100 mb-2"
                    />
                    <Link to={`/productos/${producto.id}`} className="btn btn-outline-primary w-100">
                        Ver detalle
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default FilaProducto;
