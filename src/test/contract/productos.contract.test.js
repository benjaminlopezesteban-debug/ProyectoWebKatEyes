import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "node:http";
import { crearCliente } from "../../api/client";
import { server as mswServer } from "../mocks/server";

const PRODUCTO = {
  id: 1,
  codigo: "KAT-002",
  nombre: "Crema Hidratante Ácido Hialurónico",
  descripcion: "Hidratación profunda",
  precio: 14990,
  precioOferta: null,
  precioFinal: 14990,
  stock: 40,
  stockCritico: 8,
  categoriaId: 1,
  categoriaNombre: "Skincare",
  imagenUrl: "/img/productos/kat-002.jpg",
  activo: true,
};

let servidor;
let baseURL;

beforeAll(async () => {
  mswServer.close();

  servidor = createServer((peticion, respuesta) => {
    if (peticion.method === "OPTIONS") {
      respuesta.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "*",
      });
      respuesta.end();
      return;
    }

    if (
      peticion.method === "GET" &&
      peticion.url.startsWith("/api/v1/productos")
    ) {
      respuesta.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      respuesta.end(JSON.stringify([PRODUCTO]));
      return;
    }
    respuesta.writeHead(404, { "Access-Control-Allow-Origin": "*" });
    respuesta.end();
  });

  await new Promise((resolver) => servidor.listen(0, "127.0.0.1", resolver));
  const { port } = servidor.address();
  baseURL = `http://127.0.0.1:${port}/api/v1`;
});

afterAll(async () => {
  await new Promise((resolver) => servidor.close(resolver));
  mswServer.listen({ onUnhandledRequest: "bypass" });
});

describe("contract test GET /productos", () => {
  it("el cliente real consume el contrato y recibe todos los campos", async () => {
    const cliente = crearCliente(baseURL, { adapter: "http" });
    const { data } = await cliente.get("/productos");

    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toMatchObject({
      id: 1,
      codigo: "KAT-002",
      precioFinal: 14990,
      categoriaNombre: "Skincare",
      imagenUrl: "/img/productos/kat-002.jpg",
    });
  });
});
