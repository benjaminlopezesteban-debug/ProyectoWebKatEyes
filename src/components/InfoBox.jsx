import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";

/* Antes: components/info-box.html + initInfoBox() en loadComponents.js,
   que hacía new bootstrap.Modal(...) y show() a los 1500 ms.

   Aquí aparecen dos hooks nuevos:
   - useRef: guarda una referencia al <div> del modal y a la instancia de
     Bootstrap SIN provocar un nuevo render cuando cambian.
   - useEffect: ejecuta código "de afuera" (crear el modal y el temporizador)
     después de que el componente se dibujó. Lo que devuelve (la función
     de limpieza) se ejecuta cuando el componente desaparece. */
function InfoBox({ retraso = 1500 }) {
    const modalRef = useRef(null);       // el <div id="infoModal">
    const instanciaRef = useRef(null);   // el objeto Modal de Bootstrap

    useEffect(() => {
        instanciaRef.current = new Modal(modalRef.current);
        const temporizador = setTimeout(() => instanciaRef.current.show(), retraso);

        // Limpieza: si el usuario sale de la página antes de los 1500 ms,
        // se cancela el temporizador y se libera el modal.
        return () => {
            clearTimeout(temporizador);
            instanciaRef.current.dispose();
        };
    }, [retraso]);

    return (
        <div
            className="modal fade"
            id="infoModal"
            ref={modalRef}
            tabIndex="-1"
            aria-labelledby="infoModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="infoModalLabel">¡Novedades!</h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <p>
                            Descubre nuestras nuevas colecciones y ofertas exclusivas.
                            Navega por nuestro catálogo para encontrar los productos perfectos para ti.
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                            Cerrar
                        </button>
                        {/* Al ser navegación interna (sin recargar la página),
                            hay que cerrar el modal a mano para que no quede el fondo oscuro. */}
                        <Link
                            to="/productos"
                            className="btn btn-primary"
                            onClick={() => instanciaRef.current.hide()}
                        >
                            Ver catálogo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InfoBox;
