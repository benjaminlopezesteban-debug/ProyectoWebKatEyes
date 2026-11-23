import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useSesion } from "../context/SesionContext";
import { validarCampoCheckout, validarCheckout } from "../validaciones";
import { crearPedido } from "../api/endpoints/checkout";
import { reintentarPago, simularPago } from "../api/endpoints/pagos";
import { listarComunas, listarRegiones } from "../api/endpoints/regiones";
import { useApi } from "../hooks/useApi";
import CampoFormulario from "../components/CampoFormulario";
import ResumenPedido from "../components/ResumenPedido";
import ConfirmacionPedido from "../components/ConfirmacionPedido";
import PagoFallido from "../components/PagoFallido";

const DATOS_INICIALES = {
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    regionCodigo: "",
    comunaCodigo: "",
};

const METODOS_PAGO = [
    { valor: "TARJETA", etiqueta: "Tarjeta de crédito o débito" },
    { valor: "TRANSFERENCIA", etiqueta: "Transferencia bancaria" },
];

function crearClaveIdempotencia() {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }
    return `kateye-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function datosIniciales(usuario) {
    if (!usuario) return DATOS_INICIALES;
    return {
        ...DATOS_INICIALES,
        nombre: usuario.nombre ?? "",
        correo: usuario.correo ?? "",
        telefono: usuario.telefono ?? "",
        regionCodigo: usuario.regionCodigo ?? "",
        comunaCodigo: usuario.comunaCodigo ?? "",
    };
}

function Checkout() {
    const { lineas, total, ahorro, cargando, error: errorCarrito, vaciarCarrito } = useCarrito();
    const { usuario } = useSesion();

    const [datos, setDatos] = useState(() => datosIniciales(usuario));
    const [errores, setErrores] = useState({});
    const [pago, setPago] = useState("TARJETA");
    const [pedidoCreado, setPedidoCreado] = useState(null);
    const [pagado, setPagado] = useState(null);
    const [pagoFallido, setPagoFallido] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [errorGeneral, setErrorGeneral] = useState("");

    const checkoutKeyRef = useRef(crearClaveIdempotencia());
    const pagoKeyRef = useRef(null);
    const retryKeyRef = useRef(null);

    useEffect(() => {
        if (!usuario) return;
        setDatos(prev => ({
            ...prev,
            nombre: prev.nombre || usuario.nombre || "",
            correo: prev.correo || usuario.correo || "",
            telefono: prev.telefono || usuario.telefono || "",
            regionCodigo: prev.regionCodigo || usuario.regionCodigo || "",
            comunaCodigo: prev.comunaCodigo || usuario.comunaCodigo || "",
        }));
    }, [usuario]);

    const firmaCarrito = lineas.map(linea => `${linea.id}:${linea.cantidad}`).join("|");

    useEffect(() => {
        checkoutKeyRef.current = crearClaveIdempotencia();
        if (!pedidoCreado && !pagoFallido && !pagado) {
            pagoKeyRef.current = null;
            retryKeyRef.current = null;
        }
    }, [firmaCarrito, pedidoCreado, pagoFallido, pagado]);

    const cargarRegiones = useCallback(() => listarRegiones(), []);
    const { data: regiones } = useApi(cargarRegiones);
    const cargarComunas = useCallback(
        () => (datos.regionCodigo ? listarComunas(datos.regionCodigo) : Promise.resolve([])),
        [datos.regionCodigo]
    );
    const { data: comunas } = useApi(cargarComunas);

    function manejarCambio(evento) {
        const { name, value } = evento.target;
        setDatos(prev => ({ ...prev, [name]: value }));
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: validarCampoCheckout(name, value) }));
        }
    }

    function manejarBlur(evento) {
        const { name, value } = evento.target;
        setErrores(prev => ({ ...prev, [name]: validarCampoCheckout(name, value) }));
    }

    function cambiarRegion(evento) {
        manejarCambio(evento);
        setDatos(prev => ({ ...prev, comunaCodigo: "" }));
        setErrores(prev => ({ ...prev, comunaCodigo: "" }));
    }

    async function confirmarCompra(evento) {
        evento.preventDefault();
        const nuevosErrores = validarCheckout(datos);
        setErrores(nuevosErrores);

        const primerCampoInvalido = Object.keys(nuevosErrores)[0];
        if (primerCampoInvalido) {
            evento.currentTarget.elements[primerCampoInvalido].focus();
            return;
        }
        if (lineas.length === 0) return;

        setErrorGeneral("");
        setEnviando(true);
        let pedido = pedidoCreado;

        try {
            if (!pedido) {
                pedido = await crearPedido({
                    tipoEntrega: "DESPACHO",
                    contactoNombre: datos.nombre.trim(),
                    contactoCorreo: datos.correo.trim(),
                    contactoTelefono: datos.telefono.trim(),
                    direccion: datos.direccion.trim(),
                    regionCodigo: datos.regionCodigo,
                    comunaCodigo: datos.comunaCodigo,
                    metodoPago: pago,
                    items: lineas.map(linea => ({
                        productoId: linea.id,
                        cantidad: linea.cantidad,
                    })),
                }, checkoutKeyRef.current);

                setPedidoCreado(pedido);
                vaciarCarrito();
            }

            if (!pagoKeyRef.current) {
                pagoKeyRef.current = crearClaveIdempotencia();
            }

            const resultado = await simularPago(pedido.pedidoId, pago, pagoKeyRef.current);

            if (resultado.estado === "APROBADA") {
                setPagado({
                    numero: resultado.numeroPedido,
                    total: resultado.monto,
                    correo: datos.correo.trim(),
                });
                setPagoFallido(null);
            } else {
                retryKeyRef.current = crearClaveIdempotencia();
                setPagoFallido({
                    numero: resultado.numeroPedido,
                    codigo: resultado.codigoRespuesta,
                    motivo: resultado.motivo,
                });
            }
        } catch (error) {
            if (pedido) {
                retryKeyRef.current = retryKeyRef.current ?? crearClaveIdempotencia();
                setPagoFallido({
                    numero: pedido.numero,
                    codigo: "PAGO-NO-CONFIRMADO",
                    motivo: error?.mensaje ?? "No se pudo confirmar el pago.",
                });
            } else {
                setErrorGeneral(error?.mensaje ?? "No se pudo crear el pedido.");
            }
        } finally {
            setEnviando(false);
        }
    }

    async function reintentar() {
        if (!pagoFallido) return;

        setErrorGeneral("");
        setEnviando(true);

        try {
            if (!retryKeyRef.current) {
                retryKeyRef.current = crearClaveIdempotencia();
            }

            const resultado = await reintentarPago(
                pagoFallido.numero,
                datos.correo.trim() || undefined,
                retryKeyRef.current
            );

            if (resultado.estado === "APROBADA") {
                setPagado({
                    numero: resultado.numeroPedido,
                    total: resultado.monto,
                    correo: datos.correo.trim(),
                });
                setPagoFallido(null);
            } else {
                retryKeyRef.current = null;
                setPagoFallido({
                    numero: resultado.numeroPedido,
                    codigo: resultado.codigoRespuesta,
                    motivo: resultado.motivo,
                });
            }
        } catch (error) {
            setErrorGeneral(error?.mensaje ?? "No se pudo reintentar el pago.");
        } finally {
            setEnviando(false);
        }
    }

    if (pagado) {
        return (
            <div className="container my-5">
                <ConfirmacionPedido pedido={pagado} />
            </div>
        );
    }

    if (pagoFallido) {
        return (
            <div className="container my-5">
                <PagoFallido
                    resultado={pagoFallido}
                    onReintentar={reintentar}
                    reintentando={enviando}
                    error={errorGeneral}
                />
            </div>
        );
    }

    if (cargando) {
        return (
            <div className="container my-5">
                <div className="alert alert-info">Cargando carrito...</div>
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
                <section className="col-lg-5 order-lg-2" aria-labelledby="titulo-resumen">
                    <ResumenPedido lineas={lineas} total={total} ahorro={ahorro} />
                </section>

                <section className="col-lg-7 order-lg-1" aria-labelledby="titulo-datos">
                    <form onSubmit={confirmarCompra} noValidate>
                        <h2 id="titulo-datos" className="h5 mb-3">Datos de contacto y envío</h2>

                        {errorCarrito && (
                            <div className="alert alert-warning">
                                No se pudo actualizar el carrito con el catálogo: {errorCarrito.mensaje}
                            </div>
                        )}

                        {errorGeneral && (
                            <div className="alert alert-danger" role="alert">{errorGeneral}</div>
                        )}

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

                        <CampoFormulario
                            id="co-direccion" nombre="direccion" etiqueta="Dirección"
                            valor={datos.direccion} error={errores.direccion}
                            onChange={manejarCambio} onBlur={manejarBlur}
                            maxLength={150} autoComplete="street-address"
                        />

                        <div className="row">
                            <CampoFormulario
                                id="co-region" nombre="regionCodigo" etiqueta="Región" tipo="select"
                                clase="col-md-6 mb-3"
                                valor={datos.regionCodigo} error={errores.regionCodigo}
                                onChange={cambiarRegion} onBlur={manejarBlur}
                            >
                                <option value="">Selecciona una región...</option>
                                {regiones?.map(region => (
                                    <option key={region.codigo} value={region.codigo}>{region.nombre}</option>
                                ))}
                            </CampoFormulario>
                            <CampoFormulario
                                id="co-comuna" nombre="comunaCodigo" etiqueta="Comuna" tipo="select"
                                clase="col-md-6 mb-3"
                                valor={datos.comunaCodigo} error={errores.comunaCodigo}
                                onChange={manejarCambio} onBlur={manejarBlur}
                                disabled={!datos.regionCodigo}
                            >
                                <option value="">Selecciona una comuna...</option>
                                {comunas?.map(comuna => (
                                    <option key={comuna.codigo} value={comuna.codigo}>{comuna.nombre}</option>
                                ))}
                            </CampoFormulario>
                        </div>

                        <fieldset className="mb-4">
                            <legend className="h6">Método de pago</legend>
                            {METODOS_PAGO.map(metodo => (
                                <div className="form-check" key={metodo.valor}>
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="pago"
                                        id={`pago-${metodo.valor.toLowerCase()}`}
                                        value={metodo.valor}
                                        checked={pago === metodo.valor}
                                        onChange={() => setPago(metodo.valor)}
                                    />
                                    <label className="form-check-label" htmlFor={`pago-${metodo.valor.toLowerCase()}`}>
                                        {metodo.etiqueta}
                                    </label>
                                </div>
                            ))}
                        </fieldset>

                        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={enviando}>
                            {enviando ? "Procesando..." : "Confirmar compra"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default Checkout;
