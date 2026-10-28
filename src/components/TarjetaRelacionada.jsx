import { Link } from "react-router-dom";
import Precio from "./Precio";
import { resolverImagen } from "../utils/imagenes";

/* Versión compacta de la tarjeta: imagen + nombre + precio, sin botón de compra.
   Se usa en "Productos relacionados" del detalle. Es otro componente (y no una
   variante de TarjetaProducto) porque tiene otra responsabilidad: solo navegar. */
function TarjetaRelacionada({ producto }) {
    const destino = `/productos/${producto.id}`;

    return (
        <div className="col">
            <div className="card h-100 shadow-sm">
                <Link to={destino} className="text-decoration-none text-dark">
                    <img
                        src={resolverImagen(producto.imagenes[0])}
                        className="card-img-top"
                        alt={producto.nombre}
                        style={{ height: 150, objectFit: "cover" }}
                    />
                </Link>
                <div className="card-body">
                    <h6 className="card-title">
                        <Link to={destino} className="text-decoration-none text-dark">
                            {producto.nombre}
                        </Link>
                    </h6>
                    <p className="card-text mb-0">
                        <Precio producto={producto} tamano="fs-6" />
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TarjetaRelacionada;
