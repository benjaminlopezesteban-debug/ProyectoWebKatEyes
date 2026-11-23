import api from "../client";

export async function enviarMensaje({ nombre, correo, comentario }) {
  const { data } = await api.post("/contacto", { nombre, correo, comentario });
  return data;
}
