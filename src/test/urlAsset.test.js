import { describe, expect, it } from "vitest";
import { urlAsset } from "../api/urlAsset";

describe("urlAsset", () => {
  it("antepone VITE_ASSETS_URL a las rutas relativas", () => {
    expect(urlAsset("/img/productos/kat-002.jpg")).toBe(
      "http://localhost:8080/img/productos/kat-002.jpg",
    );
  });

  it("respeta las URLs absolutas", () => {
    expect(urlAsset("https://cdn.example.com/foto.jpg")).toBe(
      "https://cdn.example.com/foto.jpg",
    );
  });

  it("devuelve una cadena vacía cuando no hay ruta", () => {
    expect(urlAsset(null)).toBe("");
    expect(urlAsset(undefined)).toBe("");
  });
});
