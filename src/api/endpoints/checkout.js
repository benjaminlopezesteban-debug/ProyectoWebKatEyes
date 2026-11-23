import api from "../client";

export async function crearPedido(payload, idempotencyKey) {
  const { data } = await api.post("/checkout", payload, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return data;
}

export async function obtenerPedido(numero, correo) {
  const ruta = correo ? `/pedidos/${numero}/invitado` : `/pedidos/${numero}`;
  const { data } = await api.get(ruta, {
    params: correo ? { correo } : undefined,
  });
  return data;
}
