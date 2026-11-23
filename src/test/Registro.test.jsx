import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import Registro from "../views/Registro";
import SesionProvider from "../context/SesionProvider";
import { server } from "./mocks/server";

const REGIONES = [
  { codigo: "13", nombre: "Metropolitana de Santiago" },
  { codigo: "05", nombre: "Valparaíso" },
];

const COMUNAS = {
  13: [
    {
      codigo: "13101",
      nombre: "Santiago",
      regionCodigo: "13",
      regionNombre: "Metropolitana de Santiago",
    },
    {
      codigo: "13114",
      nombre: "Providencia",
      regionCodigo: "13",
      regionNombre: "Metropolitana de Santiago",
    },
  ],
  "05": [
    {
      codigo: "05101",
      nombre: "Valparaíso",
      regionCodigo: "05",
      regionNombre: "Valparaíso",
    },
  ],
};

function renderizarRegistro() {
  render(
    <MemoryRouter>
      <SesionProvider>
        <Registro />
      </SesionProvider>
    </MemoryRouter>,
  );
}

describe("Registro — selects de ubicación", () => {
  beforeEach(() => {
    localStorage.clear();
    server.use(
      http.get("*/api/v1/regiones", () => HttpResponse.json(REGIONES)),
      http.get("*/api/v1/regiones/:codigo/comunas", ({ params }) => {
        return HttpResponse.json(COMUNAS[params.codigo] ?? []);
      }),
    );
  });

  it("Carga las regiones desde la API", async () => {
    renderizarRegistro();

    expect(
      await screen.findByRole("option", { name: "Metropolitana de Santiago" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Valparaíso" }),
    ).toBeInTheDocument();
  });

  it("Carga las comunas de la región seleccionada", async () => {
    const usuario = userEvent.setup();
    renderizarRegistro();
    await screen.findByRole("option", { name: "Metropolitana de Santiago" });

    const comuna = screen.getByLabelText("Comuna");
    expect(comuna).toBeDisabled();

    await usuario.selectOptions(screen.getByLabelText("Región"), "13");

    expect(
      await screen.findByRole("option", { name: "Santiago" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Providencia" }),
    ).toBeInTheDocument();
    expect(comuna).toBeEnabled();
  });

  it("Limpia la comuna al cambiar de región", async () => {
    const usuario = userEvent.setup();
    renderizarRegistro();
    await screen.findByRole("option", { name: "Metropolitana de Santiago" });

    await usuario.selectOptions(screen.getByLabelText("Región"), "13");
    await screen.findByRole("option", { name: "Santiago" });
    await usuario.selectOptions(screen.getByLabelText("Comuna"), "13101");

    expect(screen.getByLabelText("Comuna")).toHaveValue("13101");

    await usuario.selectOptions(screen.getByLabelText("Región"), "05");

    await waitFor(() => {
      expect(screen.getByLabelText("Comuna")).toHaveValue("");
    });
    expect(
      within(screen.getByLabelText("Comuna")).getByRole("option", {
        name: "Valparaíso",
      }),
    ).toBeInTheDocument();
  });
});
