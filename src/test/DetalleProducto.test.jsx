import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import DetalleProducto from "../views/DetalleProducto";
import CarritoProvider from "../context/CarritoProvider";
import { server } from "./mocks/server";

const PRODUCTO = {
  id: 1,
  codigo: "KAT-002",
  nombre: "Crema Hidratante Ácido Hialurónico",
  descripcion: "Hidratación profunda de 24 horas.",
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

const RELACIONADO = {
  ...PRODUCTO,
  id: 2,
  codigo: "KAT-003",
  nombre: "Protector Solar SPF50",
};

function renderizarDetalle() {
  render(
    <MemoryRouter initialEntries={["/productos/1"]}>
      <CarritoProvider>
        <Routes>
          <Route path="/productos/:id" element={<DetalleProducto />} />
        </Routes>
      </CarritoProvider>
    </MemoryRouter>,
  );
}

describe("DetalleProducto", () => {
  beforeEach(() => {
    localStorage.clear();
    server.use(
      http.get("*/api/v1/productos/1", () => HttpResponse.json(PRODUCTO)),
      http.get("*/api/v1/productos/1/relacionados", () =>
        HttpResponse.json([RELACIONADO]),
      ),
    );
  });

  it("Muestra el producto con la imagenUrl de la API", async () => {
    renderizarDetalle();

    expect(
      await screen.findByRole("heading", { name: PRODUCTO.nombre }),
    ).toBeInTheDocument();
    expect(screen.getByAltText(PRODUCTO.nombre)).toHaveAttribute(
      "src",
      "http://localhost:8080/img/productos/kat-002.jpg",
    );
    expect(screen.getByText("Skincare")).toBeInTheDocument();
  });

  it("Muestra los productos relacionados", async () => {
    renderizarDetalle();

    expect(
      await screen.findByRole("heading", { name: "Productos Relacionados" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: RELACIONADO.nombre }),
    ).toBeInTheDocument();
  });

  it("Agrega el producto al carrito con su snapshot", async () => {
    const usuario = userEvent.setup();
    renderizarDetalle();
    await screen.findByRole("heading", { name: PRODUCTO.nombre });

    await usuario.click(
      screen.getByRole("button", { name: "Añadir al carrito" }),
    );

    const guardado = JSON.parse(localStorage.getItem("kateye_carrito_v2"));
    expect(guardado[0]).toMatchObject({
      id: PRODUCTO.id,
      cantidad: 1,
      producto: { imagenUrl: "/img/productos/kat-002.jpg" },
    });
  });
});
