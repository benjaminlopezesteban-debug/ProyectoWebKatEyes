import { useCallback } from "react";
import { Link } from "react-router-dom";
import { listarBlogs } from "../api/endpoints/blogs";
import { useApi } from "../hooks/useApi";
import { IMG_PLACEHOLDER, resolverImagen } from "../utils/imagenes";

function Blogs() {
    const cargarBlogs = useCallback(() => listarBlogs(), []);
    const { data: blogs, loading, error } = useApi(cargarBlogs);

    return (
        <>
            <h1 className="titulo-central">Lo Destacado</h1>

            {loading && <p className="text-center text-muted">Cargando entradas...</p>}

            {error && (
                <div className="alert alert-danger" role="alert">
                    No se pudieron cargar las entradas: {error.mensaje}
                </div>
            )}

            {blogs?.map(b => (
                <div className="recuadro" key={b.slug}>
                    <div className="imagen-pequena">
                        <img
                            src={resolverImagen(b.imagen)}
                            alt={b.titulo}
                            onError={(evento) => {
                                evento.currentTarget.src = IMG_PLACEHOLDER;
                            }}
                        />
                    </div>
                    <div className="contenido">
                        <h2>
                            <Link to={`/blogs/${b.slug}`}>{b.titulo}</Link>
                        </h2>
                        <p>{b.resumen}</p>
                    </div>
                </div>
            ))}
        </>
    );
}

export default Blogs;
