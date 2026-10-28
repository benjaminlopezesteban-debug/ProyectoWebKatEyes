import { useState } from "react";
import CampoFormulario from "../components/CampoFormulario";
import { LIMITES, validarCampoContacto, validarContacto } from "../validaciones";

const DATOS_INICIALES = { nombre: "", correo: "", contenido: "" };

/* Antes: contacto.html + la parte de contacto de validaciones.js.
   Es el mismo patrón que el Checkout: formulario controlado, un solo
   manejador de cambios para todos los campos y errores en un objeto. */
function Contacto() {
    const [datos, setDatos] = useState(DATOS_INICIALES);
    const [errores, setErrores] = useState({});
    const [enviado, setEnviado] = useState(false); // muestra el aviso de éxito

    /* >>> PENDIENTE: MIGRAR A useFormulario (src/hooks/useFormulario.js) <<<
       "datos", "errores", manejarCambio, manejarBlur y la validación de enviar()
       son lo mismo que hace el hook:
           const { datos, errores, manejarCambio, manejarBlur, manejarEnvio, reiniciar } =
               useFormulario({ datosIniciales: DATOS_INICIALES,
                               validarCampo: validarCampoContacto,
                               validarTodo: validarContacto });
           <form onSubmit={manejarEnvio(procesar)}>
       Lo propio de Contacto que se queda: setEnviado(true) y reiniciar(). */
    function manejarCambio(e) {
        const { name, value } = e.target;
        setDatos(prev => ({ ...prev, [name]: value }));
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: validarCampoContacto(name, value) }));
        }
    }

    function manejarBlur(e) {
        const { name, value } = e.target;
        setErrores(prev => ({ ...prev, [name]: validarCampoContacto(name, value) }));
    }

    function enviar(e) {
        e.preventDefault();
        setEnviado(false);

        const nuevosErrores = validarContacto(datos);
        setErrores(nuevosErrores);

        const primerCampoInvalido = Object.keys(nuevosErrores)[0];
        if (primerCampoInvalido) {
            e.currentTarget.elements[primerCampoInvalido].focus();
            return;
        }

        // Sin servidor todavía: solo se confirma que los datos son válidos
        setEnviado(true);
        setDatos(DATOS_INICIALES); // limpia los campos (y, de paso, el contador)
        setErrores({});
    }

    // El contador es un dato derivado: se calcula del texto, no tiene estado propio
    const largo = datos.contenido.length;
    const excede = largo > LIMITES.comentarioMax;

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-center py-3">
                            <h1 className="h3 mb-0 text-white">Formulario de Contacto</h1>
                        </div>
                        <div className="card-body p-4 p-md-5">
                            <form onSubmit={enviar} noValidate>
                                <CampoFormulario
                                    id="ct-nombre" nombre="nombre" etiqueta="Nombre Completo"
                                    valor={datos.nombre} error={errores.nombre}
                                    onChange={manejarCambio} onBlur={manejarBlur}
                                    placeholder="Escribe tu nombre completo"
                                />

                                <CampoFormulario
                                    id="ct-correo" nombre="correo" etiqueta="Correo (opcional)" tipo="email"
                                    valor={datos.correo} error={errores.correo}
                                    onChange={manejarCambio} onBlur={manejarBlur}
                                    placeholder="ejemplo@gmail.com"
                                />

                                <CampoFormulario
                                    id="ct-contenido" nombre="contenido" etiqueta="Comentario" tipo="textarea"
                                    valor={datos.contenido} error={errores.contenido}
                                    onChange={manejarCambio} onBlur={manejarBlur}
                                    rows={5} placeholder="Escribe tu comentario aquí..."
                                    ayuda={
                                        <div className={`form-text text-end ${excede ? "text-danger" : ""}`}>
                                            {largo}/{LIMITES.comentarioMax}
                                        </div>
                                    }
                                />

                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary btn-lg">
                                        Enviar Mensaje
                                    </button>
                                </div>
                            </form>

                            {enviado && (
                                <div className="alert alert-success mt-4" role="status">
                                    Tu mensaje fue validado correctamente.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contacto;
