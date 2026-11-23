import api from "../client";

export async function simularPago(pedidoId, metodo, idempotencyKey) {
  const { data } = await api.post(
    "/pagos/simular",
    { pedidoId, metodo },
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return data;
}

export async function reintentarPago(numero, correo, idempotencyKey) {
  const { data } = await api.post(`/pagos/${numero}/reintentar`, null, {
    params: correo ? { correo } : undefined,
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return data;
}

export async function obtenerPago(id) {
  const { data } = await api.get(`/pagos/${id}`);
  return data;
}

export async function listarPagos(numero) {
  const { data } = await api.get(`/pagos/pedido/${numero}`);
  return data;
}
