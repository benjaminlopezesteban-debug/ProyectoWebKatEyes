import { http, HttpResponse } from "msw";

const api = "*/api/v1";

export const handlers = [
  http.get(`${api}/productos`, () => HttpResponse.json([])),
  http.get(`${api}/productos/:id`, () => HttpResponse.json({})),
  http.get(`${api}/productos/:id/relacionados`, () => HttpResponse.json([])),
  http.get(`${api}/categorias`, () => HttpResponse.json([])),
  http.get(`${api}/blogs`, () => HttpResponse.json([])),
  http.get(`${api}/regiones`, () => HttpResponse.json([])),
  http.get(`${api}/regiones/:codigo/comunas`, () => HttpResponse.json([])),
];
