import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerProductoPorId, obtenerProductos } from "../productos";
import { useCarrito } from "../context/CarritoContext";
import { MAX_UNIDADES_POR_PRODUCTO } from "../carrito";
import { formatearPrecio } from "../utils/formatearPrecio";
import { resolverImagen } from "../utils/imagenes";
import Precio from "../components/Precio";
import TarjetaRelacionada from "../components/TarjetaRelacionada";

// Mantiene la cantidad entre 1 y el máximo del carrito
const limitar = n => Math.min(MAX_UNIDADES_POR_PRODUCTO, Math.max(1, n));

/* ---------- Detalle de UN producto (galería, cantidad y compra) ---------- */
function Detalle({ producto }) {
    const { agregarAlCarrito } = useCarrito();

    // Estado: lo que el usuario cambia en esta pantalla
    const [imagenActiva, setImagenActiva] = useState(0);
    const [cantidad, setCantidad] = useState(1);
    // null = botón normal | número = cuántas unidades se agregaron (0 = ya estaba en el máximo)
    const [agregadas, setAgregadas] = useState(null);

    // Después de agregar, el mensaje del botón dura 1,2 s
    useEffect(() => {
        if (agregadas === null) return;
        const temporizador = setTimeout(() => setAgregadas(null), 1200);
        return () => clearTimeout(temporizador);
    }, [agregadas]);

    function cambiarCantidadEscrita(e) {
        const n = parseInt(e.target.value, 10);
        setCantidad(limitar(Number.isNaN(n) ? 1 : n));
    }

    function agregar() {
        setAgregadas(agregarAlCarrito(producto, cantidad));
    }

    const textoBoton =
        agregadas === null ? "Añadir al carrito"
        : agregadas > 0 ? `✓ Añadido (${agregadas})`
        : `Máximo ${MAX_UNIDADES_POR_PRODUCTO} por producto`;

    return (
        <div className="container my-5">
            <div className="row">
                {/* Galería */}
                <div className="col-md-6">
                    <img
                        className="img-fluid rounded-3 mb-3"
                        src={resolverImagen(producto.imagenes[imagenActiva])}
                        alt={producto.nombre}
                    />
                    <div className="row g-2">
                        {producto.imagenes.map((nombreArchivo, i) => (
                            <div className="col-3" key={nombreArchivo}>
                                <button
                                    type="button"
                                    className="btn p-0 border-0 d-block"
                                    aria-label={`Ver imagen ${i + 1} de ${producto.nombre}`}
                                    onClick={() => setImagenActiva(i)}
                                >
                                    <img
                                        className={`img-fluid border rounded-3 cursor-pointer ${i === imagenActiva ? "border-primary" : ""}`}
                                        src={resolverImagen(nombreArchivo)}
                                        alt=""
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Información */}
                <div className="col-md-6">
                    <span className="badge bg-secondary mb-2">{producto.categoria}</span>
                    <h1>{producto.nombre}</h1>
                    <p className="mb-3">
                        <Precio producto={producto} tamano="h2" />
                    </p>
                    <p className="lead">{producto.descripcion}</p>

                    {/* Selector de cantidad */}
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
                                    onClick={() => setCantidad(c => limitar(c - 1))}
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
                                    onClick={() => setCantidad(c => limitar(c + 1))}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recuadro añadir al carrito. El subtotal es un dato DERIVADO: no tiene estado propio. */}
                    <div className="card bg-light p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="h5">Subtotal</span>
                            <strong className="h5 text-primary">
                                {formatearPrecio(producto.precio * cantidad)}
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

/* ---------- Envoltorio: lee el :id de la URL, decide qué mostrar ---------- */
function DetalleProducto() {
    const { id } = useParams();           // /productos/3 → id = "3"
    const producto = obtenerProductoPorId(id);

    // Al cambiar de producto (p. ej. desde "relacionados") volvemos arriba de la página
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!producto) {
        return (
            <div className="container my-5">
                <div className="alert alert-warning text-center">
                    <h1 className="h3">Producto no encontrado</h1>
                    <p className="lead">El producto que buscas no está disponible.</p>
                    <Link to="/productos" className="btn btn-primary mt-3">← Volver al catálogo</Link>
                </div>
            </div>
        );
    }

    const relacionados = obtenerProductos().filter(
        p => p.categoria === producto.categoria && p.id !== producto.id
    );

    return (
        <>
            {/* key={producto.id}: al pasar de un producto a otro, React crea un Detalle
                nuevo y reinicia imagen activa, cantidad y mensaje (misma idea que en Productos) */}
            <Detalle key={producto.id} producto={producto} />

            {relacionados.length > 0 && (
                <section className="album py-5 bg-light">
                    <div className="container">
                        <h2 className="text-center mb-5">Productos Relacionados</h2>
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                            {relacionados.map(p => (
                                <TarjetaRelacionada key={p.id} producto={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

export default DetalleProducto;
