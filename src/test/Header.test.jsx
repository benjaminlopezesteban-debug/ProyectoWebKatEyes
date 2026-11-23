import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "../components/Header";
import { server } from "./mocks/server";

const CATEGORIAS = [
  { id: 1, slug: "skincare", nombre: "Skincare", orden: 1 },
  { id: 2, slug: "maquillaje", nombre: "Maquillaje", orden: 2 },
  { id: 3, slug: "perfumes", nombre: "Perfumes", orden: 3 },
  { id: 4, slug: "cabello", nombre: "Cabello", orden: 4 },
  { id: 5, slug: "accesorios", nombre: "Accesorios", orden: 5 },
];

function renderizarHeader(props = {}, ruta = "/") {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Header {...props} />
    </MemoryRouter>,
  );
}

async function esperarCategorias() {
  await screen.findByText("Skincare");
}

describe("Header", () => {
  beforeEach(() => {
    server.use(
      http.get("*/api/v1/categorias", () => HttpResponse.json(CATEGORIAS)),
    );
  });

  describe("Renderizado condicional según la sesión", () => {
    it("Sin sesión muestra Ingresar y Registrarse, pero no Salir", async () => {
      renderizarHeader();
      await esperarCategorias();

      expect(
        screen.getByRole("link", { name: "Ingresar" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Registrarse" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Salir" }),
      ).not.toBeInTheDocument();
    });

    it("Con sesión saluda con el primer nombre y muestra Salir", async () => {
      renderizarHeader({ usuario: { nombre: "Ana Pérez" } });
      await esperarCategorias();

      expect(screen.getByText("Hola, Ana")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Salir" })).toBeInTheDocument();
    });

    it("Con sesión oculta Ingresar y Registrarse", async () => {
      renderizarHeader({ usuario: { nombre: "Ana Pérez" } });
      await esperarCategorias();

      expect(
        screen.queryByRole("link", { name: "Ingresar" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "Registrarse" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Eventos", () => {
    it("Ejecuta onCerrarSesion al pulsar Salir", async () => {
      const usuario = userEvent.setup();
      const onCerrarSesion = vi.fn();

      renderizarHeader({ usuario: { nombre: "Ana Pérez" }, onCerrarSesion });
      await esperarCategorias();
      await usuario.click(screen.getByRole("button", { name: "Salir" }));

      expect(onCerrarSesion).toHaveBeenCalledTimes(1);
    });
  });

  describe("Props", () => {
    it("Muestra la cantidad del carrito recibida", async () => {
      renderizarHeader({ cantidadCarrito: 3 });
      await esperarCategorias();

      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("Muestra 0 en el carrito si no recibe cantidad", async () => {
      renderizarHeader();
      await esperarCategorias();

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("Listas y navegación", () => {
    it("Lista todas las categorías del menú", async () => {
      renderizarHeader();
      await esperarCategorias();

      CATEGORIAS.forEach((categoria) => {
        expect(screen.getByText(categoria.nombre)).toBeInTheDocument();
      });
    });

    it("Cada categoría enlaza al catálogo filtrado por slug", async () => {
      renderizarHeader();
      await esperarCategorias();

      expect(screen.getByRole("link", { name: "Skincare" })).toHaveAttribute(
        "href",
        "/productos?categoria=skincare",
      );
    });

    it("Marca como activo el enlace de la página actual", async () => {
      renderizarHeader({}, "/nosotros");
      await esperarCategorias();

      expect(screen.getByRole("link", { name: "Nosotros" })).toHaveClass(
        "active",
      );
      expect(screen.getByRole("link", { name: "Contacto" })).not.toHaveClass(
        "active",
      );
    });
  });
});
