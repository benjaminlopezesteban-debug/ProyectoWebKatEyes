/* Antes vivía en carrito.js y data.js dependía de ella (acoplamiento que
   anotaste en el README). Ahora es un módulo propio: quien la necesite,
   la importa, sin depender del orden de carga de scripts. */
export function formatearPrecio(valor) {
    return "$" + valor.toLocaleString("es-CL");
}
