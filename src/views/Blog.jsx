import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerBlogPorSlug } from "../blogs";
import { resolverImagen } from "../utils/imagenes";

/* Dibuja UN bloque del contenido según su tipo */
function Bloque({ bloque }) {
    if (bloque.tipo === "titulo") {
        return <h2 className="h4 mt-4">{bloque.texto}</h2>;
    }
    if (bloque.tipo === "lista") {
        return (
            <ul>
                {bloque.items.map(item => (
                    <li key={item.etiqueta}>
                        <strong>{item.etiqueta}:</strong> {item.texto}
                    </li>
                ))}
            </ul>
        );
    }
    return <p>{bloque.texto}</p>;
}

/* Reemplaza a Blog1.html y Blog2.html: una sola vista para todas las entradas.
   La URL /blogs/primavera-tez-clara aporta el "slug"; con él se busca la entrada en blogs.js. */
function Blog() {
    const { slug } = useParams();
    const blog = obtenerBlogPorSlug(slug);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (!blog) {
        return (
            <div className="container my-5">
                <div className="alert alert-warning text-center">
                    <h1 className="h3">Entrada no encontrada</h1>
                    <Link to="/blogs" className="btn btn-primary mt-3">← Volver a Blogs</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Link to="/blogs" className="flecha-regreso" aria-label="Volver a Blogs">&#8592;</Link>

            <article className="noticia">
                <div className="imagen-noticia">
                    <img src={resolverImagen(blog.imagen)} alt={blog.titulo} />
                </div>
                <div className="contenido-noticia">
                    <h1>{blog.titulo}</h1>
                    {/* Los bloques son fijos y no se reordenan, por eso aquí el índice sirve como key */}
                    {blog.contenido.map((bloque, i) => (
                        <Bloque key={i} bloque={bloque} />
                    ))}
                </div>
            </article>
        </>
    );
}

export default Blog;
