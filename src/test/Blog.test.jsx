import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import Blog from "../views/Blog";
import { server } from "./mocks/server";

const BLOG = {
  id: 1,
  slug: "rutina-skincare-diaria",
  titulo: "Rutina de skincare para todos los dias",
  resumen: "Tres pasos simples para cuidar la piel.",
  imagen: "Crema Hidratante Facial.jpg",
  contenido: [
    {
      tipo: "parrafo",
      texto: "Una rutina constante vale mas que muchos productos.",
    },
    { tipo: "titulo", texto: "Manana" },
    {
      tipo: "lista",
      items: [
        { etiqueta: "Limpieza", texto: "Usa un limpiador suave." },
        { etiqueta: "Hidratacion", texto: "Aplica crema sobre piel humeda." },
      ],
    },
  ],
  publicada: true,
};

function renderizarBlog(slug = BLOG.slug) {
  render(
    <MemoryRouter initialEntries={[`/blogs/${slug}`]}>
      <Routes>
        <Route path="/blogs/:slug" element={<Blog />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Blog", () => {
  beforeEach(() => {
    server.use(http.get("*/api/v1/blogs/:slug", () => HttpResponse.json(BLOG)));
  });

  it("Muestra el título y la imagen de la entrada", async () => {
    renderizarBlog();

    expect(
      await screen.findByRole("heading", { name: BLOG.titulo }),
    ).toBeInTheDocument();
    expect(screen.getByAltText(BLOG.titulo)).toBeInTheDocument();
  });

  it("Renderiza los bloques de contenido", async () => {
    renderizarBlog();
    await screen.findByRole("heading", { name: BLOG.titulo });

    expect(
      screen.getByText("Una rutina constante vale mas que muchos productos."),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Manana" })).toBeInTheDocument();
    expect(screen.getByText("Limpieza:")).toBeInTheDocument();
    expect(screen.getByText("Hidratacion:")).toBeInTheDocument();
  });

  it("Enlaza de vuelta a Blogs", async () => {
    renderizarBlog();
    await screen.findByRole("heading", { name: BLOG.titulo });

    expect(
      screen.getByRole("link", { name: "Volver a Blogs" }),
    ).toHaveAttribute("href", "/blogs");
  });

  it("Muestra 'Entrada no encontrada' si la API falla", async () => {
    server.use(
      http.get("*/api/v1/blogs/:slug", () =>
        HttpResponse.json({ mensaje: "Entrada inexistente" }, { status: 404 }),
      ),
    );
    renderizarBlog("no-existe");

    expect(
      await screen.findByRole("heading", { name: "Entrada no encontrada" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Entrada inexistente")).toBeInTheDocument();
  });
});
