import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import Contacto from "../views/Contacto";
import { server } from "./mocks/server";

async function completarFormulario(usuario, correo = "") {
  await usuario.type(screen.getByLabelText("Nombre Completo"), "Ana Pérez");
  if (correo) {
    await usuario.type(screen.getByLabelText("Correo (opcional)"), correo);
  }
  await usuario.type(
    screen.getByLabelText("Comentario"),
    "Quiero consultar por un producto.",
  );
}

describe("Contacto", () => {
  beforeEach(() => {
    server.use(
      http.post("*/api/v1/contacto", () =>
        HttpResponse.json(
          {
            id: 1,
            nombre: "Ana Pérez",
            correo: "",
            comentario: "Consulta",
            estado: "NUEVO",
          },
          { status: 201 },
        ),
      ),
    );
  });

  it("Envía el mensaje con correo opcional vacío", async () => {
    const usuario = userEvent.setup();
    let cuerpo = null;

    server.use(
      http.post("*/api/v1/contacto", async ({ request }) => {
        cuerpo = await request.json();
        return HttpResponse.json({ id: 1 }, { status: 201 });
      }),
    );

    render(<Contacto />);
    await completarFormulario(usuario);
    await usuario.click(screen.getByRole("button", { name: "Enviar Mensaje" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Tu mensaje fue enviado correctamente.",
    );
    expect(cuerpo).toMatchObject({
      nombre: "Ana Pérez",
      correo: "",
      comentario: "Quiero consultar por un producto.",
    });
  });

  it("Envía el correo cuando el usuario lo completa", async () => {
    const usuario = userEvent.setup();
    let cuerpo = null;

    server.use(
      http.post("*/api/v1/contacto", async ({ request }) => {
        cuerpo = await request.json();
        return HttpResponse.json({ id: 1 }, { status: 201 });
      }),
    );

    render(<Contacto />);
    await completarFormulario(usuario, "ana@gmail.com");
    await usuario.click(screen.getByRole("button", { name: "Enviar Mensaje" }));

    await screen.findByRole("status");
    expect(cuerpo.correo).toBe("ana@gmail.com");
  });

  it("Muestra el error de la API", async () => {
    const usuario = userEvent.setup();
    server.use(
      http.post("*/api/v1/contacto", () =>
        HttpResponse.json({ mensaje: "No se pudo enviar" }, { status: 500 }),
      ),
    );

    render(<Contacto />);
    await completarFormulario(usuario);
    await usuario.click(screen.getByRole("button", { name: "Enviar Mensaje" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo enviar",
    );
  });

  it("Valida un correo no permitido", async () => {
    const usuario = userEvent.setup();
    render(<Contacto />);

    await completarFormulario(usuario, "ana@hotmail.com");
    await usuario.click(screen.getByRole("button", { name: "Enviar Mensaje" }));

    expect(
      await screen.findByText(/Solo se permiten correos/),
    ).toBeInTheDocument();
  });
});
