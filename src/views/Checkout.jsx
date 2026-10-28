import { useState } from "react";
import { Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useSesion } from "../context/SesionContext";
import { validarCampoCheckout, validarCheckout } from "../validaciones";
import { crearPedido } from "../pedidos";
import CampoFormulario from "../components/CampoFormulario";
import ResumenPedido from "../components/ResumenPedido";
import ConfirmacionPedido from "../components/ConfirmacionPedido";

const DATOS_INICIALES = { nombre: "", correo: "", telefono: "", direccion: "", comuna: "" };

/* Con sesión iniciada, el formulario parte con los datos del usuario
   (la dirección no se pide al registrarse, así que la completa él). */
function datosIniciales(usuario) {
    if (!usuario) return DATOS_INICIALES;
    return {
        ...DATOS_INICIALES,
        nombre: usuario.nombre,
        correo: usuario.correo,
        telefono: usuario.telefono,
        comuna: usuario.comuna,
    };
}

const METODOS_PAGO = [
    { valor: "Tarjeta", etiqueta: "Tarjeta de crédito o débito" },
    { valor: "Transferencia", etiqueta: "Transferencia bancaria" },
];

/* Antes: checkout.html + checkout.js, con tres bloques (#checkout-vacio,
   #checkout-contenido, #checkout-confirmacion) que se mostraban u ocultaban
   con "hidden". Ahora la vista decide cuál dibujar según su estado:

     pedido ya creado        → confirmación
     carrito vacío           → aviso
     en cualquier otro caso  → resumen + formulario */
function Checkout() {
    const { lineas, total, ahorro, vaciarCarrito } = useCarrito();
    const { usuario } = useSesion();

    // Estado del formulario (todos los hooks van ANTES de cualquier return)
    // La función dentro de useState se ejecuta una sola vez, al abrir el checkout
    const [datos, setDatos] = useState(() => datosIniciales(usuario));
    const [errores, setErrores] = useState({}); // { correo: "Ingresa un correo válido." }
    const [pago, setPago] = useState("Tarjeta");
    const [pedido, setPedido] = useState(null); // null hasta que se confirma la compra

    /* >>> PENDIENTE: MIGRAR A useFormulario (src/hooks/useFormulario.js) <<<
       Los estados "datos" y "errores" de arriba y las funciones manejarCambio,
       manejarBlur y confirmarCompra (la parte de validar) de aquí abajo hacen lo
       mismo que el hook:
           const { datos, errores, manejarCambio, manejarBlur, manejarEnvio } =
               useFormulario({ datosIniciales: datosIniciales(usuario),
                               validarCampo: validarCampoCheckout,
                               validarTodo: validarCheckout });
           <form onSubmit={manejarEnvio(confirmarCompra)}>
       Solo quedaría en confirmarCompra lo propio: crear el pedido y vaciar el carrito.

       Un solo manejador para todos los campos: usa el atributo "name" del input
       como clave del dato. [name] entre corchetes = "usa el valor de la variable como clave". */
    function manejarCambio(e) {
        const { name, value } = e.target;
        setDatos(prev => ({ ...prev, [name]: value }));
        // Si el campo ya mostraba error, se revalida mientras el usuario corrige
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: validarCampoCheckout(name, value) }));
        }
    }

    // Al salir del campo se valida
    function manejarBlur(e) {
        const { name, value } = e.target;
        setErrores(prev => ({ ...prev, [name]: validarCampoCheckout(name, value) }));
    }

    function confirmarCompra(e) {
        e.preventDefault();

        const nuevosErrores = validarCheckout(datos);
        setErrores(nuevosErrores);

        // Si hay errores, el foco va al primer campo inválido y no se continúa
        const primerCampoInvalido = Object.keys(nuevosErrores)[0];
        if (primerCampoInvalido) {
            e.currentTarget.elements[primerCampoInvalido].focus();
            return;
        }
        if (lineas.length === 0) return;

        const cliente = {
            nombre: datos.nombre.trim(),
            correo: datos.correo.trim(),
            telefono: datos.telefono.trim(),
            direccion: datos.direccion.trim(),
            comuna: datos.comuna.trim(),
        };

        const nuevoPedido = crearPedido({ cliente, pago, lineas, total });
        vaciarCarrito();          // vacía el carrito (el contador baja a 0 en todos lados)
        setPedido(nuevoPedido);   // muestra la confirmación
        window.scrollTo(0, 0);
    }

    /* ---------- Qué pantalla mostrar ---------- */
    // La confirmación va primero: al vaciar el carrito, "lineas" queda vacío
    // y, sin este orden, aparecería el aviso de carrito vacío en su lugar.
    if (pedido) {
        return (
            <div className="container my-5">
                <ConfirmacionPedido pedido={pedido} />
            </div>
        );
    }

    if (lineas.length === 0) {
        return (
            <div className="container my-5">
                <h1 className="mb-4">Finalizar compra</h1>
                <div className="alert alert-warning text-center py-5">
                    <h2 className="h4">Tu carrito está vacío</h2>
                    <p>Agrega productos para poder continuar con la compra.</p>
                    <Link to="/productos" className="btn btn-primary">Ver productos</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h1 className="mb-4">Finalizar compra</h1>

            <div className="row g-4">
                {/* Resumen del pedido (en pantallas grandes va a la derecha) */}
                <section className="col-lg-5 order-lg-2" aria-labelledby="titulo-resumen">
                    <ResumenPedido lineas={lineas} total={total} ahorro={ahorro} />
                </section>

                {/* Formulario */}
                <section className="col-lg-7 order-lg-1" aria-labelledby="titulo-datos">
                    <form onSubmit={confirmarCompra} noValidate>
                        <h2 id="titulo-datos" className="h5 mb-3">Datos de contacto y envío</h2>

                        <CampoFormulario
                            id="co-nombre" nombre="nombre" etiqueta="Nombre completo"
                            valor={datos.nombre} error={errores.nombre}
                            onChange={manejarCambio} onBlur={manejarBlur}
                            maxLength={100} autoComplete="name"
                        />

                        <div className="row">
                            <CampoFormulario
                                id="co-correo" nombre="correo" etiqueta="Correo" tipo="email"
                                clase="col-md-6 mb-3"
                                valor={datos.correo} error={errores.correo}
                                onChange={manejarCambio} onBlur={manejarBlur}
                                maxLength={100} autoComplete="email"
                            />
                            <CampoFormulario
                                id="co-telefono" nombre="telefono" etiqueta="Teléfono" tipo="tel"
                                clase="col-md-6 mb-3"
                                valor={datos.telefono} error={errores.telefono}
                                onChange={manejarCambio} onBlur={manejarBlur}
                                placeholder="+56 9 1234 5678" autoComplete="tel"
                            />
                        </div>

                        <div className="row">
                            <CampoFormulario
                                id="co-direccion" nombre="direccion" etiqueta="Dirección"
                                clase="col-md-8 mb-3"
                                valor={datos.direccion} error={errores.direccion}
                                onChange={manejarCambio} onBlur={manejarBlur}
                                maxLength={150} autoComplete="street-address"
                            />
                            <CampoFormulario
                                id="co-comuna" nombre="comuna" etiqueta="Comuna"
                                clase="col-md-4 mb-3"
                                valor={datos.comuna} error={errores.comuna}
                                onChange={manejarCambio} onBlur={manejarBlur}
                                maxLength={60}
                            />
                        </div>

                        <fieldset className="mb-4">
                            <legend className="h6">Método de pago</legend>
                            {METODOS_PAGO.map(m => (
                                <div className="form-check" key={m.valor}>
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="pago"
                                        id={`pago-${m.valor.toLowerCase()}`}
                                        value={m.valor}
                                        checked={pago === m.valor}
                                        onChange={() => setPago(m.valor)}
                                    />
                                    <label className="form-check-label" htmlFor={`pago-${m.valor.toLowerCase()}`}>
                                        {m.etiqueta}
                                    </label>
                                </div>
                            ))}
                            <div className="form-text">Prototipo: no se realiza ningún cobro real.</div>
                        </fieldset>

                        <button type="submit" className="btn btn-primary btn-lg w-100">
                            Confirmar compra
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default Checkout;
