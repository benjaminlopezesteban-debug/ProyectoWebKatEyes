import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import Productos from "../views/Productos";
import CarritoProvider from "../context/CarritoProvider";
import { server } from "./mocks/server";

const CATEGORIAS = [
  { id: 1, nombre: "Skincare", slug: "skincare", orden: 1 },
  { id: 2, nombre: "Maquillaje", slug: "maquillaje", orden: 2 },
];

const PRODUCTOS = [
  {
    id: 1,
    codigo: "KAT-001",
    nombre: "Sérum Vitamina C",
    descripcion: "Sérum facial iluminador.",
    precio: 19990,
    precioOferta: null,
    precioFinal: 19990,
    stock: 25,
    stockCritico: 5,
    categoriaId: 1,
    categoriaNombre: "Skincare",
    imagenUrl: "/img/productos/kat-001.jpg",
    activo: true,
  },
  {
    id: 2,
    codigo: "KAT-004",
    nombre: "Base Líquida HD",
    descripcion: "Cobertura media modulable.",
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

function catalogoHandler(productos = PRODUCTOS) {
  return http.get("*/api/v1/productos", ({ request }) => {
    const url = new URL(request.url);
    const categoriaId = url.searchParams.get("categoriaId");
    const precioMin = Number(url.searchParams.get("precioMin") ?? 0);
    const precioMax = Number(url.searchParams.get("precioMax") ?? Infinity);

    const resultado = productos.filter((producto) => {
      const okCategoria =
        !categoriaId || String(producto.categoriaId) === categoriaId;
      const okPrecio =
        producto.precioFinal >= precioMin && producto.precioFinal <= precioMax;
      return okCategoria && okPrecio;
    });

    return HttpResponse.json(resultado);
  });
}

function usarCatalogo(productos = PRODUCTOS) {
  server.use(
    http.get("*/api/v1/categorias", () => HttpResponse.json(CATEGORIAS)),
    catalogoHandler(productos),
  );
}

function renderizarProductos(ruta = "/productos") {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <CarritoProvider>
        <Productos />
      </CarritoProvider>
    </MemoryRouter>,
  );
}

async function esperarProductos() {
  await screen.findByRole("heading", { name: "Sérum Vitamina C" });
  await screen.findByRole("heading", { name: "Base Líquida HD" });
}

describe("Productos", () => {
  beforeEach(() => {
    localStorage.clear();
    usarCatalogo();
  });

  it("Renderiza todos los productos del catálogo", async () => {
    renderizarProductos();
    await esperarProductos();

    expect(
      screen.getAllByRole("button", { name: "Añadir al carrito" }),
    ).toHaveLength(2);
  });

  it("Muestra el nombre de cada producto", async () => {
    renderizarProductos();
    await esperarProductos();

    PRODUCTOS.forEach((producto) => {
      expect(
        screen.getByRole("heading", { name: producto.nombre }),
      ).toBeInTheDocument();
    });
  });

  it("Ofrece una opción por categoría más la opción Todas", async () => {
    renderizarProductos();
    await screen.findByRole("option", { name: "Skincare" });

    expect(screen.getByRole("option", { name: "Todas" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Skincare" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Maquillaje" }),
    ).toBeInTheDocument();
  });

  it("Filtra por la categoría recibida por la URL", async () => {
    renderizarProductos("/productos?categoria=Skincare");
    await screen.findByRole("heading", { name: "Sérum Vitamina C" });

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Base Líquida HD" }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText("Categoría")).toHaveValue("1");
  });

  it("Filtra por precio máximo", async () => {
    const usuario = userEvent.setup();
    renderizarProductos();
    await esperarProductos();

    const maximo = screen.getByLabelText("Máximo");
    await usuario.clear(maximo);
    await usuario.type(maximo, "15000");

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Sérum Vitamina C" }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { name: "Base Líquida HD" }),
    ).toBeInTheDocument();
  });

  it("Muestra el aviso solo cuando ningún producto cumple los filtros", async () => {
    const usuario = userEvent.setup();
    renderizarProductos();
    await esperarProductos();

    const maximo = screen.getByLabelText("Máximo");
    await usuario.clear(maximo);
    await usuario.type(maximo, "1");

    expect(
      await screen.findByText(/No hay productos que coincidan/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Añadir al carrito" }),
    ).not.toBeInTheDocument();
  });

  it("Limpiar filtros restaura todos los productos y oculta el aviso", async () => {
    const usuario = userEvent.setup();
    renderizarProductos();
    await esperarProductos();

    const maximo = screen.getByLabelText("Máximo");
    await usuario.clear(maximo);
    await usuario.type(maximo, "1");
    await screen.findByText(/No hay productos que coincidan/);

    await usuario.click(
      screen.getByRole("button", { name: "Limpiar filtros" }),
    );

    await esperarProductos();
    expect(
      screen.queryByText(/No hay productos que coincidan/),
    ).not.toBeInTheDocument();
  });

  it("Muestra un error cuando la API falla", async () => {
    server.use(
      http.get("*/api/v1/categorias", () => HttpResponse.json(CATEGORIAS)),
      http.get("*/api/v1/productos", () =>
        HttpResponse.json({ mensaje: "Fallo del catálogo" }, { status: 500 }),
      ),
    );
    renderizarProductos();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Fallo del catálogo",
    );
  });

  it("Confirma con '✓ Añadido' al agregar un producto", async () => {
    const usuario = userEvent.setup();
    renderizarProductos();
    await esperarProductos();

    await usuario.click(
      screen.getAllByRole("button", { name: "Añadir al carrito" })[0],
    );

    expect(screen.getByText("✓ Añadido")).toBeInTheDocument();
  });

  it("Guarda el producto agregado en el carrito con su snapshot", async () => {
    const usuario = userEvent.setup();
    renderizarProductos();
    await esperarProductos();

    await usuario.click(
      screen.getAllByRole("button", { name: "Añadir al carrito" })[0],
    );

    const guardado = JSON.parse(localStorage.getItem("kateye_carrito"));
    expect(guardado).toHaveLength(1);
    expect(guardado[0].id).toBe(1);
    expect(guardado[0].cantidad).toBe(1);
    expect(guardado[0].producto.nombre).toBe("Sérum Vitamina C");
  });
});
