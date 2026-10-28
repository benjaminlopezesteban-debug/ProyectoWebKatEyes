/* src/usuarios.js — usuarios simulados (JavaScript puro, sin React).
   Hace de "base de datos" de usuarios mientras no exista un backend.

   ⚠ SOLO PROTOTIPO: la contraseña se guarda en texto plano en localStorage.
   En una aplicación real NUNCA se hace así: la contraseña se envía al servidor,
   que guarda únicamente un hash (bcrypt/argon2) y entrega una sesión/token. */

const CLAVE_USUARIOS = "kateye_usuarios";

function leerUsuarios() {
    try {
        const guardados = JSON.parse(localStorage.getItem(CLAVE_USUARIOS));
        return Array.isArray(guardados) ? guardados : [];
    } catch {
        return [];
    }
}

function guardarUsuarios(usuarios) {
    try {
        localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    } catch {
        /* sin almacenamiento: no se puede persistir el registro */
    }
}

/* Lo que el resto de la app puede ver de un usuario: NUNCA la contraseña */
function publico(u) {
    return {
        id: u.id,
        nombre: u.nombre,
        correo: u.correo,
        telefono: u.telefono,
        region: u.region,   // id de la región (ver regiones.js)
        comuna: u.comuna,   // nombre de la comuna
    };
}

const mismoCorreo = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function obtenerUsuarioPorId(id) {
    const u = leerUsuarios().find(x => x.id === Number(id));
    return u ? publico(u) : null;
}

/* Devuelve { ok: true, usuario } o { ok: false, error: "correo-duplicado" } */
export function registrarUsuario({ nombre, correo, password, telefono, region, comuna }) {
    const usuarios = leerUsuarios();

    if (usuarios.some(u => mismoCorreo(u.correo, correo))) {
        return { ok: false, error: "correo-duplicado" };
    }

    const id = usuarios.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    const nuevo = { id, nombre, correo, password, telefono, region, comuna };
    guardarUsuarios([...usuarios, nuevo]);

    return { ok: true, usuario: publico(nuevo) };
}

/* Devuelve el usuario si el correo y la contraseña coinciden; si no, null */
export function autenticar(correo, password) {
    const u = leerUsuarios().find(x => mismoCorreo(x.correo, correo) && x.password === password);
    return u ? publico(u) : null;
}
