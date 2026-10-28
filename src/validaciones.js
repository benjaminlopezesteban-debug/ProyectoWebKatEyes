/* src/validaciones.js — reglas de validación (JavaScript puro, sin React).
   Migración de las reglas de js/checkout.js. Cada regla recibe el texto
   YA recortado (sin espacios al inicio/final) y devuelve "" si es válido
   o el mensaje de error. Al no depender de React ni del DOM, se pueden
   probar con Jasmine directamente. */

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^(\+?56)?\s?9[\s\d]{8,10}$/; // celular chileno

/* Las claves coinciden con los campos del formulario (atributo name).
   El orden de las claves es el orden de los campos en pantalla. */
export const reglasCheckout = {
    nombre: v => (!v ? "Ingresa tu nombre." : ""),
    correo: v =>
        !v ? "Ingresa tu correo."
        : !REGEX_CORREO.test(v) ? "Ingresa un correo válido."
        : "",
    telefono: v =>
        !v ? "Ingresa tu teléfono."
        : !REGEX_TELEFONO.test(v) ? "Ingresa un celular chileno válido."
        : "",
    direccion: v => (!v ? "Ingresa tu dirección." : ""),
    comuna: v => (!v ? "Ingresa tu comuna." : ""),
};

/* Valida UN campo (se usa al salir del campo y mientras se corrige) */
export function validarCampoCheckout(campo, valor) {
    return reglasCheckout[campo](valor.trim());
}

/* Valida TODO el formulario. Devuelve un objeto solo con los campos que
   tienen error, por ejemplo { correo: "Ingresa un correo válido." }.
   Objeto vacío = formulario válido. */
export function validarCheckout(datos) {
    const errores = {};
    Object.keys(reglasCheckout).forEach(campo => {
        const mensaje = validarCampoCheckout(campo, datos[campo]);
        if (mensaje) errores[campo] = mensaje;
    });
    return errores;
}

/* ==========================================================
   CONTACTO (migrado de js/validaciones.js)
   ========================================================== */

export const DOMINIOS_PERMITIDOS = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

export const LIMITES = {
    correoMax: 100,
    nombreMax: 100,
    comentarioMax: 500,
    passMin: 4,
    passMax: 10,
};

/* "requerido = false" permite dejarlo vacío (en contacto el correo es opcional),
   pero si se escribe algo, igual se valida. */
export function validarCorreo(valor, requerido = true) {
    const v = valor.trim();
    if (v === "") return requerido ? "El correo es obligatorio." : "";
    if (v.length > LIMITES.correoMax) {
        return `El correo no puede superar los ${LIMITES.correoMax} caracteres.`;
    }
    if (!REGEX_CORREO.test(v)) {
        return "Ingresa un correo válido (ej: nombre@gmail.com).";
    }
    const dominio = v.split("@")[1].toLowerCase();
    if (!DOMINIOS_PERMITIDOS.includes(dominio)) {
        return "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    }
    return "";
}

export function validarTextoRequerido(valor, max, sujeto) {
    const v = valor.trim();
    if (v === "") return `${sujeto} es obligatorio.`;
    if (v.length > max) return `${sujeto} no puede superar los ${max} caracteres.`;
    return "";
}

export const reglasContacto = {
    nombre: v => validarTextoRequerido(v, LIMITES.nombreMax, "El nombre"),
    correo: v => validarCorreo(v, false),
    contenido: v => validarTextoRequerido(v, LIMITES.comentarioMax, "El comentario"),
};

export function validarCampoContacto(campo, valor) {
    return reglasContacto[campo](valor);
}

/* Igual que validarCheckout: devuelve solo los campos con error */
export function validarContacto(datos) {
    const errores = {};
    Object.keys(reglasContacto).forEach(campo => {
        const mensaje = validarCampoContacto(campo, datos[campo]);
        if (mensaje) errores[campo] = mensaje;
    });
    return errores;
}

/* ==========================================================
   LOGIN Y REGISTRO (migrado de js/validaciones.js)
   ========================================================== */

export function validarPassword(valor) {
    if (valor === "") return "La contraseña es obligatoria.";
    if (valor.length < LIMITES.passMin || valor.length > LIMITES.passMax) {
        return `La contraseña debe tener entre ${LIMITES.passMin} y ${LIMITES.passMax} caracteres.`;
    }
    return "";
}

/* Recorre un conjunto de reglas y devuelve solo los campos con error.
   Cada regla recibe (valor, datosCompletos): el segundo parámetro permite
   reglas que dependen de otro campo (confirmar contraseña). */
function validarConReglas(reglas, datos) {
    const errores = {};
    Object.keys(reglas).forEach(campo => {
        const mensaje = reglas[campo](datos[campo] ?? "", datos);
        if (mensaje) errores[campo] = mensaje;
    });
    return errores;
}

/* ---------- Login ---------- */
export const reglasLogin = {
    correo: v => validarCorreo(v, true),
    password: v => validarPassword(v),
};
export const validarCampoLogin = (campo, valor, datos) => reglasLogin[campo](valor, datos);
export const validarLogin = datos => validarConReglas(reglasLogin, datos);

/* ---------- Registro ---------- (el teléfono es opcional y no tiene regla) */
export const reglasRegistro = {
    nombre: v => validarTextoRequerido(v, LIMITES.nombreMax, "El nombre completo"),
    correo: v => validarCorreo(v, true),
    password: v => validarPassword(v),
    confirmPassword: (v, datos) => (v !== datos.password ? "Las contraseñas no coinciden." : ""),
    region: v => (v ? "" : "Debes seleccionar una región."),
    comuna: v => (v ? "" : "Debes seleccionar una comuna."),
};
export const validarCampoRegistro = (campo, valor, datos) => {
    // El teléfono no tiene regla: se acepta cualquier valor
    return reglasRegistro[campo] ? reglasRegistro[campo](valor, datos) : "";
};
export const validarRegistro = datos => validarConReglas(reglasRegistro, datos);
