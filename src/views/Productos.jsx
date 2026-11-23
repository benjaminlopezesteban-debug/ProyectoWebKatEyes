import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TarjetaProducto from "../components/TarjetaProducto";
import { listarCategorias } from "../api/endpoints/categorias";
import { listarProductos } from "../api/endpoints/productos";
import { useCarrito } from "../context/CarritoContext";
import { useApi } from "../hooks/useApi";

const PRECIO_MIN_INICIAL = "0";
const PRECIO_MAX_INICIAL = "100000";

function Productos() {
    const { agregarAlCarrito } = useCarrito();
    const [searchParams] = useSearchParams();
    const categoriaParam = searchParams.get("categoria");

    const cargarCategorias = useCallback(() => listarCategorias(), []);
    const { data: categorias } = useApi(cargarCategorias);

    const [categoriaId, setCategoriaId] = useState("");
    const [precioMin, setPrecioMin] = useState(PRECIO_MIN_INICIAL);
    const [precioMax, setPrecioMax] = useState(PRECIO_MAX_INICIAL);

    useEffect(() => {
        if (!categorias) return;
        const encontrada = categorias.find((categoria) =>
            String(categoria.id) === categoriaParam ||
            categoria.nombre?.toLowerCase() === categoriaParam?.toLowerCase() ||
            categoria.slug?.toLowerCase() === categoriaParam?.toLowerCase()
        );
        setCategoriaId(encontrada ? String(encontrada.id) : "");
    }, [categorias, categoriaParam]);

    const cargarProductos = useCallback(
        () => listarProductos({
            categoriaId: categoriaId || undefined,
            precioMin: precioMin !== "" ? precioMin : undefined,
            precioMax: precioMax !== "" ? precioMax : undefined,
        }),
        [categoriaId, precioMin, precioMax]
    );

    const { data: productos, loading, error } = useApi(cargarProductos);

    function limpiarFiltros() {
        setCategoriaId("");
        setPrecioMin(PRECIO_MIN_INICIAL);
        setPrecioMax(PRECIO_MAX_INICIAL);
    }

    return (
        <div className="container my-5">
            <div className="row">
                <aside className="col-lg-3">
                    <div className="p-3 border rounded-3 panel-filtros">
                        <h2 className="h4 mb-3">Filtros</h2>

                        <div className="grupo-filtro mb-4">
                            <label className="form-label" htmlFor="categoria">Categoría</label>
                            <select
                                id="categoria"
                                className="form-select"
                                value={categoriaId}
                                onChange={(evento) => setCategoriaId(evento.target.value)}
                            >
                                <option value="">Todas</option>
                                {categorias?.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grupo-filtro mb-4">
                            <h3 className="h5">Precio</h3>
                            <div className="mb-2">
                                <label htmlFor="precio-min" className="form-label">Mínimo</label>
                                <input
                                    type="number"
                                    id="precio-min"
                                    className="form-control"
                                    min="0"
                                    step="1000"
                                    value={precioMin}
                                    onChange={(evento) => setPrecioMin(evento.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="precio-max" className="form-label">Máximo</label>
                                <input
                                    type="number"
                                    id="precio-max"
                                    className="form-control"
                                    min="0"
                                    step="1000"
                                    value={precioMax}
                                    onChange={(evento) => setPrecioMax(evento.target.value)}
                                />
                            </div>
                        </div>

                        <div className="d-grid">
                            <button type="button" className="btn btn-secondary" onClick={limpiarFiltros}>
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                </aside>

                <section className="col-lg-9">
                    <h1 className="mb-4">Productos</h1>

                    {loading && <div className="alert alert-info">Cargando catálogo...</div>}

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            No se pudo cargar el catálogo: {error.mensaje}
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                                {productos?.map((producto) => (
                                    <TarjetaProducto
                                        key={producto.id}
                                        producto={producto}
                                        onAgregar={agregarAlCarrito}
                                    />
                                ))}
                            </div>

                            {productos?.length === 0 && (
                                <div className="alert alert-info mt-4">
                                    No hay productos que coincidan con los filtros.
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Productos;
