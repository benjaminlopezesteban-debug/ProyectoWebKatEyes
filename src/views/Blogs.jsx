import { Link } from "react-router-dom";
import { obtenerBlogs } from "../blogs";
import { resolverImagen } from "../utils/imagenes";

/* Antes: Blogs.html con dos "recuadros" copiados a mano.
   Ahora hay un solo recuadro que se repite con .map() para cada entrada de
   blogs.js: si agregas un tercer blog, aparece aquí sin tocar esta vista. */
function Blogs() {
    const blogs = obtenerBlogs();

    return (
        <>
            <h1 className="titulo-central">Lo Destacado</h1>

            {blogs.map(b => (
                <div className="recuadro" key={b.slug}>
                    <div className="imagen-pequena">
                        <img src={resolverImagen(b.imagen)} alt={b.titulo} />
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
