import { Link, NavLink } from "react-router-dom";
import { resolverImagen } from "../utils/imagenes";

/* Antes: components/header.html cargado con fetch() desde loadComponents.js.
   Ahora es un componente que se importa y se dibuja como cualquier otro.

   Las categorías eran 6 <li> copiados a mano; ahora son datos y se
   recorren con .map(). Si mañana agregas una categoría, solo editas este arreglo. */
const CATEGORIAS = [
    { nombre: "Rostro", detalle: "Bases, correctores, polvos" },
    { nombre: "Ojos", detalle: "Delineadores, sombras, máscaras" },
    { nombre: "Labios", detalle: "Labiales, brillos, bálsamos" },
    { nombre: "Uñas", detalle: "Esmaltes y tratamientos" },
    { nombre: "Cuidado de la piel", detalle: "Cremas, limpiadores, protector" },
    { nombre: "Accesorios", detalle: "Brochas, esponjas, organizadores" },
];

/* Props:
   - cantidadCarrito: número que se muestra en la insignia del botón Carrito.
     Antes lo actualizaba updateCartCount() leyendo localStorage; ahora
     lo recibe desde afuera (más adelante vendrá del estado del carrito). */
function Header({ cantidadCarrito = 0, usuario = null, onCerrarSesion }) {
    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img
                        src={resolverImagen("Tienda.jpg")}
                        alt="Logo Kateyes"
                        className="me-2 rounded-circle"
                        style={{ width: 36, height: 36, objectFit: "cover" }}
                    />
                    <span>Kateyes</span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNavDropdown"
                    aria-controls="navbarNavDropdown"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNavDropdown">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {/* NavLink agrega solo la clase "active" a la página actual.
                            "end" evita que "/" quede activo en todas las rutas. */}
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/" end>Inicio</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/productos" end>Productos</NavLink>
                        </li>

                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle"
                                href="#"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Categorías
                            </a>
                            <ul className="dropdown-menu">
                                <li>
                                    <Link className="dropdown-item" to="/productos">
                                        <strong>Ver todo</strong>
                                        <small className="d-block">Todo el catálogo</small>
                                    </Link>
                                </li>
                                {CATEGORIAS.map(c => (
                                    <li key={c.nombre}>
                                        <Link
                                            className="dropdown-item"
                                            to={`/productos?categoria=${encodeURIComponent(c.nombre)}`}
                                        >
                                            <strong>{c.nombre}</strong>
                                            <small className="d-block">{c.detalle}</small>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>

                        <li className="nav-item">
                            <NavLink className="nav-link" to="/blogs">Blogs</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/nosotros">Nosotros</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/contacto">Contacto</NavLink>
                        </li>
                    </ul>

                    <div className="d-flex">
                        {/* Con sesión iniciada: saludo + Salir. Sin sesión: Ingresar y Registrarse. */}
                        {usuario ? (
                            <>
                                <span className="navbar-text me-2">
                                    Hola, {usuario.nombre.split(" ")[0]}
                                </span>
                                <button type="button" className="btn btn-outline-primary" onClick={onCerrarSesion}>
                                    Salir
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/iniciar-sesion" className="btn btn-outline-primary me-2">Ingresar</Link>
                                <Link to="/registro" className="btn btn-primary">Registrarse</Link>
                            </>
                        )}
                        <button
                            type="button"
                            className="btn btn-outline-dark ms-2 btn-header-carrito"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#panel-carrito"
                            aria-controls="panel-carrito"
                            aria-label="Abrir carrito"
                        >
                            <i className="bi-cart-fill me-1"></i>
                            Carrito
                            <span className="badge bg-dark text-white ms-1 rounded-pill cart-count">
                                {cantidadCarrito}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Header;
