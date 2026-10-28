import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormulario } from "../hooks/useFormulario";
import { useSesion } from "../context/SesionContext";
import { validarCampoLogin, validarLogin } from "../validaciones";
import { autenticar } from "../usuarios";
import CampoFormulario from "../components/CampoFormulario";

const DATOS_INICIALES = { correo: "", password: "" };

/* Antes: iniciarSesion.html + la parte de login de validaciones.js, que solo
   mostraba "Datos válidos (aún no hay servidor)". Ahora comprueba contra los
   usuarios registrados (usuarios.js) y guarda la sesión. */
function IniciarSesion() {
    const navigate = useNavigate();
    const { iniciarSesion } = useSesion();
    const [errorGeneral, setErrorGeneral] = useState(""); // credenciales incorrectas

    // >>> USO DEL HOOK useFormulario: reemplaza los ~25 líneas de manejadores copiados
    const { datos, errores, manejarCambio, manejarBlur, manejarEnvio } = useFormulario({
        datosIniciales: DATOS_INICIALES,
        validarCampo: validarCampoLogin,
        validarTodo: validarLogin,
    });

    // Lo único propio de este formulario: qué hacer cuando los datos ya son válidos
    function procesar(datosValidos) {
        setErrorGeneral("");
        const usuario = autenticar(datosValidos.correo, datosValidos.password);
        if (!usuario) {
            setErrorGeneral("Correo o contraseña incorrectos.");
            return;
        }
        iniciarSesion(usuario);
        navigate("/");
    }

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-sm card-auth">
                        <div className="card-body p-4 p-md-5">
                            <div className="text-center mb-4">
                                <h1 className="h3 mb-3 fw-normal">Iniciar Sesión</h1>
                            </div>

                            <form onSubmit={manejarEnvio(procesar)} noValidate>
                                <CampoFormulario
                                    id="lg-correo" nombre="correo" etiqueta="Correo Electrónico" tipo="email"
                                    valor={datos.correo} error={errores.correo}
                                    onChange={manejarCambio} onBlur={manejarBlur}
                                    placeholder="nombre@ejemplo.com" autoComplete="email"
                                />
                                <CampoFormulario
                                    id="lg-password" nombre="password" etiqueta="Contraseña" tipo="password"
                                    valor={datos.password} error={errores.password}
                                    onChange={manejarCambio} onBlur={manejarBlur}
                                    autoComplete="current-password"
                                />

                                <button className="w-100 btn btn-lg btn-primary" type="submit">
                                    Iniciar Sesión
                                </button>
                            </form>

                            {errorGeneral && (
                                <div className="alert alert-danger mt-4" role="alert">{errorGeneral}</div>
                            )}

                            <hr className="my-4" />
                            <p className="text-center mb-0">
                                ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IniciarSesion;
