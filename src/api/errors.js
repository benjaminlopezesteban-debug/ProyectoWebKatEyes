export function normalizarError(error) {
  const respuesta = error?.response;
  const datos = respuesta?.data;

  if (datos && typeof datos === "object") {
    return {
      ...datos,
      estado: respuesta.status,
      mensaje: datos.mensaje ?? datos.error ?? "Error de la API",
    };
  }

  return {
    estado: respuesta?.status ?? 0,
    mensaje: error?.message ?? "No se pudo conectar con la API",
  };
}
