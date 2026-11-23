import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import IniciarSesion from "../views/IniciarSesion";
import SesionProvider from "../context/SesionProvider";
import { TOKEN_KEY } from "../api/client";
import { server } from "./mocks/server";

const USUARIO = {
  id: 1,
  nombre: "Ana Pérez",
  correo: "ana@gmail.com",
  telefono: "912345678",
  regionCodigo: "13",
  regionNombre: "Metropolitana de Santiago",
  comunaCodigo: "13101",
  comunaNombre: "Santiago",
  rol: "CLIENTE",
  activo: true,
};

function renderizarLogin() {
  render(
    <MemoryRouter initialEntries={["/iniciar-sesion"]}>
      <SesionProvider>
        <Routes>
          <Route path="/iniciar-sesion" element={<IniciarSesion />} />
          <Route path="/" element={<div>Inicio</div>} />
        </Routes>
      </SesionProvider>
    </MemoryRouter>,
  );
}

async function completarFormulario(usuario) {
  await usuario.type(
    screen.getByLabelText("Correo Electrónico"),
    "ana@gmail.com",
  );
  await usuario.type(screen.getByLabelText("Contraseña"), "1234");
}

describe("IniciarSesion", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("Inicia sesión y navega al inicio", async () => {
    const usuario = userEvent.setup();
    server.use(
      http.post("*/api/v1/auth/login", () =>
        HttpResponse.json({
          token: "jwt-login",
          tipo: "Bearer",
          expiraEn: 3600,
          usuario: USUARIO,
        }),
      ),
    );

    renderizarLogin();
    await completarFormulario(usuario);
    await usuario.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    expect(await screen.findByText("Inicio")).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe("jwt-login");
  });

  it("Muestra el error de la API con credenciales inválidas", async () => {
    const usuario = userEvent.setup();
    server.use(
      http.post("*/api/v1/auth/login", () =>
        HttpResponse.json(
          {
            estado: 401,
            error: "Unauthorized",
            mensaje: "Credenciales inválidas",
          },
          { status: 401 },
        ),
      ),
    );

    renderizarLogin();
    await completarFormulario(usuario);
    await usuario.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Credenciales inválidas",
    );
  });

  it("Valida el dominio del correo antes de llamar a la API", async () => {
    const usuario = userEvent.setup();
    renderizarLogin();

    await usuario.type(
      screen.getByLabelText("Correo Electrónico"),
      "ana@hotmail.com",
    );
    await usuario.type(screen.getByLabelText("Contraseña"), "1234");
    await usuario.click(screen.getByRole("button", { name: "Iniciar Sesión" }));

    expect(
      await screen.findByText(/Solo se permiten correos/),
    ).toBeInTheDocument();
  });
});
