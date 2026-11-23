import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Inicio from "../views/Inicio";
import CarritoProvider from "../context/CarritoProvider";
import { server } from "./mocks/server";

vi.mock("bootstrap", () => ({
  Modal: class {
    show() {}
    hide() {}
    dispose() {}
  },
}));

const PRODUCTOS = [
  {
    id: 1,
    codigo: "KAT-002",
    nombre: "Crema Hidratante Ácido Hialurónico",
    descripcion: "Hidratación profunda.",
    precio: 14990,
    precioOferta: null,
    precioFinal: 14990,
    stock: 40,
    stockCritico: 8,
    categoriaId: 1,
    categoriaNombre: "Skincare",
    imagenUrl: "/img/productos/kat-002.jpg",
    activo: true,
  },
  {
    id: 2,
    codigo: "KAT-004",
    nombre: "Base Líquida HD",
    descripcion: "Cobertura media.",
    precio: 16990,
    precioOferta: 12990,
    precioFinal: 12990,
    stock: 20,
    stockCritico: 4,
    categoriaId: 2,
    categoriaNombre: "Maquillaje",
    imagenUrl: "/img/productos/kat-004.jpg",
    activo: true,
  },
];

function renderizarInicio() {
  render(
    <MemoryRouter>
      <CarritoProvider>
        <Inicio />
      </CarritoProvider>
    </MemoryRouter>,
  );
}

describe("Inicio", () => {
  beforeEach(() => {
    localStorage.clear();
    server.use(
      http.get("*/api/v1/productos", () => HttpResponse.json(PRODUCTOS)),
    );
  });

  it("Muestra los productos del catálogo real", async () => {
    renderizarInicio();

    expect(
      await screen.findByRole("heading", { name: PRODUCTOS[0].nombre }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: PRODUCTOS[1].nombre }),
    ).toBeInTheDocument();
  });

  it("Muestra la categoría de cada producto", async () => {
    renderizarInicio();
    await screen.findByRole("heading", { name: PRODUCTOS[0].nombre });

    expect(screen.getByText("Skincare")).toBeInTheDocument();
    expect(screen.getByText("Maquillaje")).toBeInTheDocument();
  });

  it("Agrega un producto al carrito", async () => {
    const usuario = userEvent.setup();
    renderizarInicio();
    await screen.findByRole("heading", { name: PRODUCTOS[0].nombre });

    await usuario.click(
      screen.getAllByRole("button", { name: "Agregar al carrito" })[0],
    );

    const guardado = JSON.parse(localStorage.getItem("kateye_carrito_v2"));
    expect(guardado[0]).toMatchObject({
      id: PRODUCTOS[0].id,
      cantidad: 1,
      producto: { nombre: PRODUCTOS[0].nombre },
    });
  });

  it("Muestra un error cuando la API falla", async () => {
    server.use(
      http.get("*/api/v1/productos", () =>
        HttpResponse.json({ mensaje: "No se pudo cargar" }, { status: 500 }),
      ),
    );
    renderizarInicio();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar",
    );
  });
});
