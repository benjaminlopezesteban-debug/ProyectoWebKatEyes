/* src/pagos.js — simulación de la pasarela de pago (JavaScript puro, sin React).
   No hay backend ni cobro real: esta función hace de "banco". Cuando exista un
   servidor, solo hay que reemplazar el cuerpo de procesarPago() por una llamada
   fetch(); el Checkout seguirá funcionando igual porque depende del resultado.

   Devuelve siempre un objeto:
     { ok: true }
     { ok: false, codigo: "PAGO-RECHAZADO", motivo: "Texto para mostrar al usuario" }

   "forzarFallo" existe para poder DEMOSTRAR y PROBAR la pantalla de pago
   fallido: sin un banco real no hay otra forma de provocar un rechazo. */

function fallo(codigo, motivo) {
    return { ok: false, codigo, motivo };
}

export function procesarPago({ metodo, total, forzarFallo = false }) {
    if (!(total > 0)) {
        return fallo("MONTO-INVALIDO", "El monto del pedido no es válido.");
    }

    if (forzarFallo) {
        return metodo === "Transferencia"
            ? fallo("TRANSFERENCIA-NO-CONFIRMADA", "No pudimos confirmar tu transferencia bancaria.")
            : fallo("PAGO-RECHAZADO", "Tu banco rechazó la transacción.");
    }

    return { ok: true };
}
