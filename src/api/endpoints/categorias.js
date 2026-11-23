import api from "../client";

export async function listarCategorias() {
  const { data } = await api.get("/categorias");
  return data;
}
