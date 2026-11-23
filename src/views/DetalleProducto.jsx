import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerProducto, listarRelacionados } from "../api/endpoints/productos";
import { useCarrito } from "../context/CarritoContext";
import { useApi } from "../hooks/useApi";
import { MAX_UNIDADES_POR_PRODUCTO, maximoProducto } from "../carrito";
import { formatearPrecio } from "../utils/formatearPrecio";
import { IMG_PLACEHOLDER, resolverImagenProducto } from "../utils/imagenes";
import { nombreCategoria, precioVigente } from "../utils/producto";
import Precio from "../components/Precio";
import TarjetaRelacionada from "../components/TarjetaRelacionada";

const limitar = (numero, maximo) => Math.min(maximo, Math.max(1, numero));

function Detalle({ producto }) {
    const { agregarAlCarrito } = useCarrito();
    const maximo = maximoProducto(producto) || MAX_UNIDADES_POR_PRODUCTO;
    const [cantidad, setCantidad] = useState(1);
    const [agregadas, setAgregadas] = useState(null);

    useEffect(() => {
        if (agregadas === null) return;
        const temporizador = setTimeout(() => setAgregadas(null), 1200);
        return () => clearTimeout(temporizador);
    }, [agregadas]);

    function cambiarCantidadEscrita(evento) {
        const numero = parseInt(evento.target.value, 10);
        setCantidad(limitar(Number.isNaN(numero) ? 1 : numero, maximo));
    }

    function agregar() {
        setAgregadas(agregarAlCarrito(producto, cantidad));
    }

    const textoBoton =
        agregadas === null ? "Añadir al carrito"
        : agregadas > 0 ? `✓ Añadido (${agregadas})`
        : `Máximo ${maximo} por producto`;

    return (
        <div className="container my-5">
            <div className="row">
                <div className="col-md-6">
                    <img
                        className="img-fluid rounded-3 mb-3"
                        src={resolverImagenProducto(producto)}
                        alt={producto.nombre}
                        onError={(evento) => {
                            evento.currentTarget.src = IMG_PLACEHOLDER;
                        }}
                    />
                </div>

                <div className="col-md-6">
                    <span className="badge bg-secondary mb-2">{nombreCategoria(producto)}</span>
                    <h1>{producto.nombre}</h1>
                    <p className="mb-3">
                        <Precio producto={producto} tamano="h2" />
                    </p>
                    <p className="lead">{producto.descripcion}</p>

                    <div className="row align-items-center mb-4">
                        <div className="col-auto">
                            <label htmlFor="cantidad" className="col-form-label">Cantidad:</label>
                        </div>
                        <div className="col-auto">
                            <div className="input-group" style={{ width: 150 }}>
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    aria-label="Quitar una unidad"
                                    onClick={() => setCantidad((valor) => limitar(valor - 1, maximo))}
                                >
                                    −
                                </button>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    id="cantidad"
                                    className="form-control text-center"
                                    value={cantidad}
                                    onChange={cambiarCantidadEscrita}
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    aria-label="Agregar una unidad"
                                    onClick={() => setCantidad((valor) => limitar(valor + 1, maximo))}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-light p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="h5">Subtotal</span>
                            <strong className="h5 text-primary">
                                {formatearPrecio(precioVigente(producto) * cantidad)}
                            </strong>
                        </div>
                        <div className="d-grid">
                            <button
                                type="button"
                                className={`btn btn-primary btn-lg ${agregadas > 0 ? "agregado" : ""}`}
                                onClick={agregar}
                            >
                                {textoBoton}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetalleProducto() {
    const { id } = useParams();
    const cargar = useCallback(async () => {
        const [producto, relacionados] = await Promise.all([
            obtenerProducto(id),
            listarRelacionados(id),
        ]);
        return { producto, relacionados };
    }, [id]);

    const { data, loading, error } = useApi(cargar);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="container my-5">
                <div className="alert alert-info">Cargando producto...</div>
            </div>
        );
    }

    if (error || !data?.producto) {
        return (
            <div className="container my-5">
                <div className="alert alert-warning text-center">
                    <h1 className="h3">Producto no encontrado</h1>
                    <p className="lead">{error?.mensaje ?? "El producto que buscas no está disponible."}</p>
                    <Link to="/productos" className="btn btn-primary mt-3">← Volver al catálogo</Link>
                </div>
            </div>
        );
    }

    const { producto, relacionados } = data;

    return (
        <>
            <Detalle key={producto.id} producto={producto} />

            {relacionados.length > 0 && (
                <section className="album py-5 bg-light">
                    <div className="container">
                        <h2 className="text-center mb-5">Productos Relacionados</h2>
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                            {relacionados.map((relacionado) => (
                                <TarjetaRelacionada key={relacionado.id} producto={relacionado} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

export default DetalleProducto;
