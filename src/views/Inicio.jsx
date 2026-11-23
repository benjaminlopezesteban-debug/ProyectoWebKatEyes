import { useCallback } from "react";
import { Link } from "react-router-dom";
import { listarProductos } from "../api/endpoints/productos";
import { useCarrito } from "../context/CarritoContext";
import { useApi } from "../hooks/useApi";
import FilaProducto from "../components/FilaProducto";
import InfoBox from "../components/InfoBox";

function Inicio() {
    const { agregarAlCarrito } = useCarrito();
    const cargarProductos = useCallback(() => listarProductos(), []);
    const { data: productos, loading, error } = useApi(cargarProductos);

    return (
        <>
            <InfoBox />

            <section className="hero-bienvenida text-center py-5">
                <div className="container">
                    <div className="row py-lg-4">
                        <div className="col-lg-6 col-md-8 mx-auto">
                            <h1 className="fw-light mb-3">Kateyes Cosméticos</h1>
                            <p className="lead mb-4 text-dark-emphasis">
                                Belleza natural, para una mujer moderna y consciente. Descubre nuestras
                                colecciones y abraza tu esencia.
                            </p>
                            <p className="mb-0">
                                <Link to="/productos" className="btn btn-primary me-2 my-1">Ver catálogo</Link>
                                <Link to="/nosotros" className="btn btn-secondary my-1">Sobre nosotras</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="album py-5 bg-light">
                <div className="container">
                    <h2 className="text-center mb-5">Nuestros Productos</h2>

                    {loading && <p className="text-center text-muted">Cargando productos...</p>}

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            No se pudo cargar el catálogo: {error.mensaje}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="d-flex flex-column gap-3">
                            {productos?.map((producto) => (
                                <FilaProducto
                                    key={producto.id}
                                    producto={producto}
                                    onAgregar={agregarAlCarrito}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default Inicio;
