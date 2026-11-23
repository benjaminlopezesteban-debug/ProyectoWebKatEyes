import axios from "axios";
import { normalizarError } from "./errors";

export const TOKEN_KEY = "kateye_token";

export function crearCliente(baseURL, opciones = {}) {
  const cliente = axios.create({ baseURL, ...opciones });

  cliente.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  cliente.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
      if (error?.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
      }
      return Promise.reject(normalizarError(error));
    },
  );

  return cliente;
}

export const api = crearCliente(import.meta.env.VITE_API_URL ?? "/api/v1");

export default api;
