import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import TarjetaProducto from "../components/TarjetaProducto";
import { obtenerProductos, obtenerCategorias } from "../productos";
import { useCarrito } from "../context/CarritoContext";

const PRECIO_MIN_INICIAL = "0";
const PRECIO_MAX_INICIAL = "100000";

/* ---------- Catálogo (la vista real, con su estado) ---------- */
function Catalogo({ categoriaInicial, onAgregar }) {
    const productos = obtenerProductos();
    const categorias = obtenerCategorias();

    /* ESTADO: solo lo que el usuario puede cambiar.
       Sin categoría en la URL → todas marcadas; con categoría → solo esa. */
    const [seleccionadas, setSeleccionadas] = useState(
        categoriaInicial ? [categoriaInicial] : categorias
    );
    const [precioMin, setPrecioMin] = useState(PRECIO_MIN_INICIAL);
    const [precioMax, setPrecioMax] = useState(PRECIO_MAX_INICIAL);

    /* ESTADO DERIVADO: la lista visible NO es estado; se calcula en cada
       render a partir de los filtros. Antes eran aplicarFiltros() +
       renderProductos() llamadas a mano en cada evento; ahora, cuando
       cambia un filtro, React vuelve a ejecutar esto solo. */
    const min = Number(precioMin) || 0;
    const max = Number(precioMax) || Infinity;
    const visibles = productos.filter(p => {
        // Igual que en tu versión HTML: sin ninguna categoría marcada, no se filtra por categoría
        const okCategoria = seleccionadas.length === 0 || seleccionadas.includes(p.categoria);
        const okPrecio = p.precio >= min && p.precio <= max;
        return okCategoria && okPrecio;
    });

    function alternarCategoria(categoria) {
        // Nunca se modifica el arreglo existente: se crea uno nuevo
        setSeleccionadas(prev =>
            prev.includes(categoria)
                ? prev.filter(c => c !== categoria)
                : [...prev, categoria]
        );
    }

    function limpiarFiltros() {
        setSeleccionadas(categorias);
        setPrecioMin(PRECIO_MIN_INICIAL);
        setPrecioMax(PRECIO_MAX_INICIAL);
    }

    return (
        <div className="container my-5">
            <div className="row">
                {/* ================= FILTROS ================= */}
                <aside className="col-lg-3">
                    <div className="p-3 border rounded-3 panel-filtros">
                        <h2 className="h4 mb-3">Filtros</h2>

                        <div className="grupo-filtro mb-4">
                            <h3 className="h5">Categorías</h3>
                            {categorias.map(c => {
                                const id = `cat-${c.replace(/\s/g, "-")}`;
                                return (
                                    <div className="form-check" key={c}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={id}
                                            checked={seleccionadas.includes(c)}
                                            onChange={() => alternarCategoria(c)}
                                        />
                                        <label className="form-check-label" htmlFor={id}>{c}</label>
                                    </div>
                                );
                            })}
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
                                    onChange={e => setPrecioMin(e.target.value)}
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
                                    onChange={e => setPrecioMax(e.target.value)}
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

                {/* ================= CATÁLOGO ================= */}
                <section className="col-lg-9">
                    <h1 className="mb-4">Productos</h1>

                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {visibles.map(p => (
                            <TarjetaProducto key={p.id} producto={p} onAgregar={onAgregar} />
                        ))}
                    </div>

                    {/* Renderizado condicional: antes era el atributo "hidden" que se activaba por JS */}
                    {visibles.length === 0 && (
                        <div className="alert alert-info mt-4">
                            No hay productos que coincidan con los filtros.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

/* ---------- Envoltorio: lee la URL y reinicia el catálogo si cambia ----------
   productos?categoria=Labios llega desde el menú del header.
   El estado inicial de Catalogo se calcula UNA sola vez. Si el usuario ya está
   en /productos y elige otra categoría del menú, la ruta es la misma y React
   no vuelve a montar el componente. El truco es la prop "key": cuando cambia,
   React desmonta el componente y crea uno nuevo, con el estado reiniciado. */
function Productos() {
    // Ya no hay función provisoria: se usa la del carrito real
    const { agregarAlCarrito } = useCarrito();
    const [searchParams] = useSearchParams();
    const parametro = searchParams.get("categoria");
    const categoriaInicial = obtenerCategorias().includes(parametro) ? parametro : null;

    return (
        <Catalogo
            key={categoriaInicial ?? "todas"}
            categoriaInicial={categoriaInicial}
            onAgregar={agregarAlCarrito}
        />
    );
}

export default Productos;
