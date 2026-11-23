import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import SesionProvider from "../context/SesionProvider";
import { useSesion } from "../context/SesionContext";
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

function Consumidor() {
  const { usuario, cargando, iniciarSesion, registrar, cerrarSesion } =
    useSesion();

  return (
    <div>
      <span data-testid="usuario">{usuario?.nombre ?? "anonimo"}</span>
      <span data-testid="cargando">{String(cargando)}</span>
      <button onClick={() => iniciarSesion("ana@gmail.com", "1234")}>
        login
      </button>
      <button
        onClick={() =>
          registrar({
            nombre: "Ana Pérez",
            correo: "ana@gmail.com",
            password: "1234",
            telefono: "912345678",
            regionCodigo: "13",
            comunaCodigo: "13101",
          })
        }
      >
        registro
      </button>
      <button onClick={() => cerrarSesion()}>logout</button>
    </div>
  );
}

function renderizarSesion() {
  render(
    <SesionProvider>
      <Consumidor />
    </SesionProvider>,
  );
}

async function esperarAnonimo() {
  await waitFor(() => {
    expect(screen.getByTestId("usuario")).toHaveTextContent("anonimo");
    expect(screen.getByTestId("cargando")).toHaveTextContent("false");
  });
}

describe("SesionProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("Sin token queda anónimo y sin cargar", async () => {
    renderizarSesion();

    await esperarAnonimo();
  });

  it("Hidrata el usuario con GET /usuarios/me", async () => {
    localStorage.setItem(TOKEN_KEY, "token-valido");
    server.use(
      http.get("*/api/v1/usuarios/me", () => HttpResponse.json(USUARIO)),
    );

    renderizarSesion();

    expect(await screen.findByText(USUARIO.nombre)).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe("token-valido");
  });

  it("Inicia sesión con POST /auth/login y guarda el token", async () => {
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

    renderizarSesion();
    await esperarAnonimo();
    await usuario.click(screen.getByRole("button", { name: "login" }));

    expect(await screen.findByText(USUARIO.nombre)).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe("jwt-login");
  });

  it("Registra con POST /auth/registro y guarda el token", async () => {
    const usuario = userEvent.setup();
    server.use(
      http.post("*/api/v1/auth/registro", () =>
        HttpResponse.json(
          {
            token: "jwt-registro",
            tipo: "Bearer",
            expiraEn: 3600,
            usuario: USUARIO,
          },
          { status: 201 },
        ),
      ),
    );

    renderizarSesion();
    await esperarAnonimo();
    await usuario.click(screen.getByRole("button", { name: "registro" }));

    expect(await screen.findByText(USUARIO.nombre)).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe("jwt-registro");
  });

  it("Cierra sesión con POST /auth/logout y borra el token", async () => {
    const usuario = userEvent.setup();
    localStorage.setItem(TOKEN_KEY, "token-valido");
    server.use(
      http.get("*/api/v1/usuarios/me", () => HttpResponse.json(USUARIO)),
      http.post("*/api/v1/auth/logout", () =>
        HttpResponse.json({ mensaje: "Sesion cerrada" }),
      ),
    );

    renderizarSesion();
    expect(await screen.findByText(USUARIO.nombre)).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "logout" }));

    await esperarAnonimo();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("Limpia la sesión ante un 401 al hidratar", async () => {
    localStorage.setItem(TOKEN_KEY, "token-vencido");
    server.use(
      http.get("*/api/v1/usuarios/me", () =>
        HttpResponse.json(
          { estado: 401, error: "Unauthorized", mensaje: "Token expirado" },
          { status: 401 },
        ),
      ),
    );

    renderizarSesion();

    await esperarAnonimo();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
