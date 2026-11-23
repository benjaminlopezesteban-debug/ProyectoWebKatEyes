import { describe, expect, it } from "vitest";
import {
  validarContacto,
  validarCorreo,
  validarLogin,
  validarPassword,
  validarRegistro,
} from "../validaciones";

describe("validaciones de sesión y contacto", () => {
  it("Acepta los dominios permitidos", () => {
    expect(validarCorreo("ana@gmail.com")).toBe("");
    expect(validarCorreo("ana@duoc.cl")).toBe("");
    expect(validarCorreo("ana@profesor.duoc.cl")).toBe("");
  });

  it("Rechaza dominios no permitidos", () => {
    expect(validarCorreo("ana@hotmail.com")).toMatch(
      /Solo se permiten correos/,
    );
  });

  it("Permite correo vacío cuando es opcional", () => {
    expect(validarCorreo("", false)).toBe("");
  });

  it("Exige contraseña entre 4 y 10 caracteres", () => {
    expect(validarPassword("123")).toMatch(/entre 4 y 10/);
    expect(validarPassword("1234")).toBe("");
    expect(validarPassword("12345678901")).toMatch(/entre 4 y 10/);
  });

  it("Valida el login con correo permitido y contraseña", () => {
    expect(validarLogin({ correo: "ana@gmail.com", password: "1234" })).toEqual(
      {},
    );
    expect(
      validarLogin({ correo: "admin@kateye.cl", password: "1234" }),
    ).toEqual({});
    expect(
      validarLogin({ correo: "ana@hotmail.com", password: "1234" }),
    ).toHaveProperty("correo");
  });

  it("El contacto acepta correo vacío", () => {
    expect(
      validarContacto({ nombre: "Ana", correo: "", contenido: "Hola" }),
    ).toEqual({});
  });

  it("El registro exige región y comuna por código", () => {
    const errores = validarRegistro({
      nombre: "Ana Pérez",
      correo: "ana@gmail.com",
      password: "1234",
      confirmPassword: "1234",
      regionCodigo: "",
      comunaCodigo: "",
    });

    expect(errores).toHaveProperty("regionCodigo");
    expect(errores).toHaveProperty("comunaCodigo");
  });
});
