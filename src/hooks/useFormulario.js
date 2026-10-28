import { useState } from "react";

/* ==========================================================================
   >>> AQUÍ VIVE EL HOOK useFormulario  (src/hooks/useFormulario.js) <<<

   PROBLEMA QUE RESUELVE
   Checkout y Contacto escribían a mano lo mismo:
     - useState para los datos y para los errores
     - manejarCambio (guardar lo escrito y revalidar si ya había error)
     - manejarBlur   (validar al salir del campo)
     - el submit     (validar todo, enfocar el primer error, continuar si es válido)
   Con Login y Registro serían cuatro copias. Un "hook personalizado" es una
   función cuyo nombre empieza con "use" y que usa otros hooks por dentro:
   permite reutilizar LÓGICA con estado (los componentes reutilizan interfaz).

   CÓMO SE USA
     const { datos, errores, manejarCambio, manejarBlur, manejarEnvio } =
         useFormulario({
             datosIniciales: { correo: "", password: "" },
             validarCampo:   (campo, valor, datos) => "mensaje de error o ''",
             validarTodo:    datos => ({ campo: "mensaje" })   // {} = válido
         });

     <form onSubmit={manejarEnvio(procesar)} noValidate>
         <CampoFormulario nombre="correo" valor={datos.correo} error={errores.correo}
                          onChange={manejarCambio} onBlur={manejarBlur} ... />

   "procesar" es lo ÚNICO propio de cada formulario: qué hacer cuando los
   datos ya son válidos (iniciar sesión, guardar un pedido, etc.).

   También devuelve setDatos y setErrores para los casos especiales
   (p. ej. borrar la comuna al cambiar de región, o marcar "correo ya registrado"). */
export function useFormulario({ datosIniciales, validarCampo, validarTodo }) {
    const [datos, setDatos] = useState(datosIniciales);
    const [errores, setErrores] = useState({});

    // Un solo manejador para todos los campos: la clave del dato es el atributo "name"
    function manejarCambio(e) {
        const { name, value } = e.target;
        const nuevosDatos = { ...datos, [name]: value };
        setDatos(nuevosDatos);
        // Si el campo ya mostraba error, se revalida mientras el usuario corrige.
        // Se pasan los datos completos por si la regla depende de otro campo
        // (p. ej. "confirmar contraseña" compara con "contraseña").
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: validarCampo(name, value, nuevosDatos) }));
        }
    }

    // Al salir de un campo se valida
    function manejarBlur(e) {
        const { name, value } = e.target;
        setErrores(prev => ({ ...prev, [name]: validarCampo(name, value, datos) }));
    }

    /* Devuelve el manejador del submit. alExito(datos) se ejecuta solo si todo es válido.
       Uso: <form onSubmit={manejarEnvio(procesar)}> */
    function manejarEnvio(alExito) {
        return e => {
            e.preventDefault();

            const nuevosErrores = validarTodo(datos);
            setErrores(nuevosErrores);

            // El foco va al primer campo inválido (se busca por su atributo "name")
            const primerCampoInvalido = Object.keys(nuevosErrores)[0];
            if (primerCampoInvalido) {
                e.currentTarget.elements[primerCampoInvalido].focus();
                return;
            }

            alExito(datos);
        };
    }

    // Vuelve al estado inicial (datos vacíos y sin errores)
    function reiniciar() {
        setDatos(datosIniciales);
        setErrores({});
    }

    return {
        datos,
        errores,
        setDatos,
        setErrores,
        manejarCambio,
        manejarBlur,
        manejarEnvio,
        reiniciar,
    };
}
