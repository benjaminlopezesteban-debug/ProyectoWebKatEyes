import api from "../client";

export async function iniciarSesionApi(correo, password) {
  const { data } = await api.post("/auth/login", { correo, password });
  return data;
}

export async function registrarUsuarioApi(datos) {
  const { data } = await api.post("/auth/registro", datos);
  return data;
}

export async function cerrarSesionApi() {
  const { data } = await api.post("/auth/logout");
  return data;
}

export async function obtenerPerfil() {
  const { data } = await api.get("/usuarios/me");
  return data;
}
