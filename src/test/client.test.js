import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { api, TOKEN_KEY } from "../api/client";
import { server } from "./mocks/server";

describe("client HTTP", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("envía el token como Bearer", async () => {
    let autorizacion = null;

    server.use(
      http.get("*/api/v1/productos", ({ request }) => {
        autorizacion = request.headers.get("Authorization");
        return HttpResponse.json([]);
      }),
    );

    localStorage.setItem(TOKEN_KEY, "token-de-prueba");
    await api.get("/productos");

    expect(autorizacion).toBe("Bearer token-de-prueba");
  });

  it("normaliza ErrorResponse y limpia el token ante 401", async () => {
    server.use(
      http.get("*/api/v1/perfil", () =>
        HttpResponse.json(
          { estado: 401, error: "Unauthorized", mensaje: "Token expirado" },
          { status: 401 },
        ),
      ),
    );

    localStorage.setItem(TOKEN_KEY, "token-vencido");

    await expect(api.get("/perfil")).rejects.toMatchObject({
      estado: 401,
      mensaje: "Token expirado",
    });
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("devuelve los datos de una respuesta exitosa", async () => {
    server.use(
      http.get("*/api/v1/productos", () => HttpResponse.json([{ id: 1 }])),
    );

    const respuesta = await api.get("/productos");

    expect(respuesta.data).toEqual([{ id: 1 }]);
  });
});
