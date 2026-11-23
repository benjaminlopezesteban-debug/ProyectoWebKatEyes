import api from "../client";

export async function listarRegiones() {
  const { data } = await api.get("/regiones");
  return data;
}

export async function listarComunas(codigoRegion) {
  const { data } = await api.get(`/regiones/${codigoRegion}/comunas`);
  return data;
}
