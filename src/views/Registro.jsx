import { Link, useNavigate } from "react-router-dom";
import { useFormulario } from "../hooks/useFormulario";
import { useSesion } from "../context/SesionContext";
import { validarCampoRegistro, validarRegistro } from "../validaciones";
import { registrarUsuario } from "../usuarios";
import { REGIONES, obtenerComunas } from "../regiones";
import CampoFormulario from "../components/CampoFormulario";

const DATOS_INICIALES = {
    nombre: "",
    correo: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    region: "",
    comuna: "",
};

/* Antes: registroUsuario.html + validaciones.js. En tu HTML el select de comunas
   quedaba vacío (nunca se llenaba); ahora depende de la región elegida. */
function Registro() {
    const navigate = useNavigate();
    const { iniciarSesion } = useSesion();

    // >>> USO DEL HOOK useFormulario: aquí habría 7 campos con sus manejadores copiados
    const {
        datos, errores, setDatos, setErrores,
        manejarCambio, manejarBlur, manejarEnvio,
    } = useFormulario({
        datosIniciales: DATOS_INICIALES,
        validarCampo: validarCampoRegistro,
        validarTodo: validarRegistro,
    });

    // Dato derivado: las comunas salen de la región elegida (no se guardan aparte)
    const comunas = obtenerComunas(datos.region);

    /* Caso especial que el hook no conoce: al cambiar de región, la comuna
       elegida antes ya no corresponde, así que se borra. Se reutiliza
       manejarCambio para guardar la región y luego se limpia la comuna. */
    function cambiarRegion(e) {
        manejarCambio(e);
        setDatos(prev => ({ ...prev, comuna: "" }));
        setErrores(prev => ({ ...prev, comuna: "" }));
    }

    // Lo único propio de este formulario: qué hacer cuando los datos ya son válidos
    function procesar(d) {
        const resultado = registrarUsuario({
            nombre: d.nombre.trim(),
            correo: d.correo.trim(),
            password: d.password,
            telefono: d.telefono.trim(),
            region: d.region,
            comuna: d.comuna,
        });

        if (!resultado.ok) {
            setErrores({ correo: "Este correo ya está registrado." });
            document.getElementById("rg-correo")?.focus();
            return;
        }

        iniciarSesion(resultado.usuario); // al registrarse queda con la sesión iniciada
        navigate("/");
    }

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-center py-3">
                            <h1 className="h3 mb-0 text-white">Registro de Usuario</h1>
                        </div>
                        <div className="card-body p-4 p-md-5">
                            <form onSubmit={manejarEnvio(procesar)} noValidate>
                                <div className="row g-3">
                                    <CampoFormulario
                                        id="rg-nombre" nombre="nombre" etiqueta="Nombre Completo"
                                        clase="col-12"
                                        valor={datos.nombre} error={errores.nombre}
                                        onChange={manejarCambio} onBlur={manejarBlur}
                                        autoComplete="name"
                                    />
                                    <CampoFormulario
                                        id="rg-correo" nombre="correo" etiqueta="Correo" tipo="email"
                                        clase="col-12"
                                        valor={datos.correo} error={errores.correo}
                                        onChange={manejarCambio} onBlur={manejarBlur}
                                        placeholder="nombre@ejemplo.com" autoComplete="email"
                                    />
                                    <CampoFormulario
                                        id="rg-password" nombre="password" etiqueta="Contraseña" tipo="password"
                                        clase="col-md-6"
                                        valor={datos.password} error={errores.password}
                                        onChange={manejarCambio} onBlur={manejarBlur}
                                        autoComplete="new-password"
                                        ayuda={<div className="form-text">Entre 4 y 10 caracteres.</div>}
                                    />
                                    <CampoFormulario
                                        id="rg-confirmPassword" nombre="confirmPassword"
                                        etiqueta="Confirmar Contraseña" tipo="password"
                                        clase="col-md-6"
                                        valor={datos.confirmPassword} error={errores.confirmPassword}
                                        onChange={manejarCambio} onBlur={manejarBlur}
                                        autoComplete="new-password"
                                    />
                                    <CampoFormulario
                                        id="rg-telefono" nombre="telefono" tipo="tel"
                                        etiqueta="Teléfono (opcional)"
                                        clase="col-12"
                                        valor={datos.telefono} error={errores.telefono}
                                        onChange={manejarCambio} onBlur={manejarBlur}
                                        autoComplete="tel"
                                    />
                                    <CampoFormulario
                                        id="rg-region" nombre="region" etiqueta="Región" tipo="select"
                                        clase="col-md-6"
                                        valor={datos.region} error={errores.region}
                                        onChange={cambiarRegion} onBlur={manejarBlur}
                                    >
                                        <option value="">Selecciona una región...</option>
                                        {REGIONES.map(r => (
                                            <option key={r.id} value={r.id}>{r.nombre}</option>
                                        ))}
                                    </CampoFormulario>
                                    <CampoFormulario
                                        id="rg-comuna" nombre="comuna" etiqueta="Comuna" tipo="select"
                                        clase="col-md-6"
                                        valor={datos.comuna} error={errores.comuna}
                                        onChange={manejarCambio} onBlur={manejarBlur}
                                        disabled={!datos.region}
                                    >
                                        <option value="">Selecciona una comuna...</option>
                                        {comunas.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </CampoFormulario>
                                </div>

                                <hr className="my-4" />
                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary btn-lg">Registrar</button>
                                </div>
                            </form>

                            <p className="text-center mt-3 mb-0">
                                ¿Ya tienes una cuenta? <Link to="/iniciar-sesion">Inicia sesión</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Registro;
