import api from "../client";

export async function listarProductos(params = {}) {
  const { data } = await api.get("/productos", { params });
  return data;
}

export async function obtenerProducto(id) {
  const { data } = await api.get(`/productos/${id}`);
  return data;
}

export async function listarRelacionados(id) {
  const { data } = await api.get(`/productos/${id}/relacionados`);
  return data;
}
