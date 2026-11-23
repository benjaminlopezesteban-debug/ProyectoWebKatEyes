import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import Blogs from "../views/Blogs";
import { server } from "./mocks/server";

const BLOGS = [
  {
    id: 1,
    slug: "rutina-skincare-diaria",
    titulo: "Rutina de skincare para todos los dias",
    resumen: "Tres pasos simples para cuidar la piel.",
    imagen: "Crema Hidratante Facial.jpg",
    contenido: [],
    publicada: true,
  },
  {
    id: 2,
    slug: "como-elegir-tu-base-liquida",
    titulo: "Como elegir tu base liquida",
    resumen: "Cobertura, acabado y tono.",
    imagen: "Base líquida mate.jpg",
    contenido: [],
    publicada: true,
  },
];

function renderizarBlogs() {
  render(
    <MemoryRouter>
      <Blogs />
    </MemoryRouter>,
  );
}

describe("Blogs", () => {
  beforeEach(() => {
    server.use(http.get("*/api/v1/blogs", () => HttpResponse.json(BLOGS)));
  });

  it("Muestra todas las entradas del blog", async () => {
    renderizarBlogs();

    expect(
      await screen.findByRole("heading", { name: BLOGS[0].titulo }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: BLOGS[1].titulo }),
    ).toBeInTheDocument();
  });

  it("Muestra el resumen y la imagen de cada entrada", async () => {
    renderizarBlogs();
    await screen.findByRole("heading", { name: BLOGS[0].titulo });

    expect(screen.getByText(BLOGS[0].resumen)).toBeInTheDocument();
    expect(screen.getByAltText(BLOGS[0].titulo)).toBeInTheDocument();
  });

  it("Enlaza cada entrada con su slug", async () => {
    renderizarBlogs();
    await screen.findByRole("heading", { name: BLOGS[0].titulo });

    expect(screen.getByRole("link", { name: BLOGS[0].titulo })).toHaveAttribute(
      "href",
      `/blogs/${BLOGS[0].slug}`,
    );
  });

  it("Muestra un error cuando la API falla", async () => {
    server.use(
      http.get("*/api/v1/blogs", () =>
        HttpResponse.json({ mensaje: "Fallo de blogs" }, { status: 500 }),
      ),
    );
    renderizarBlogs();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Fallo de blogs",
    );
  });
});
