import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PagoFallido from "../components/PagoFallido";

const resultado = {
  numero: "KE-123456",
  codigo: "05",
  motivo: "Pago rechazado por simulacion",
};

function renderizarPagoFallido(onReintentar = () => {}) {
  render(
    <MemoryRouter>
      <PagoFallido resultado={resultado} onReintentar={onReintentar} />
    </MemoryRouter>,
  );
}

describe("PagoFallido", () => {
  it("Avisa que no se pudo realizar el pago como alerta", () => {
    renderizarPagoFallido();

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "No se pudo realizar el pago" }),
    ).toBeInTheDocument();
  });

  it("Muestra el motivo y el código recibidos", () => {
    renderizarPagoFallido();

    expect(
      screen.getByText("Pago rechazado por simulacion"),
    ).toBeInTheDocument();
    expect(screen.getByText("05")).toBeInTheDocument();
  });

  it("Indica que el pedido quedó registrado y no hubo cobro", () => {
    renderizarPagoFallido();

    expect(screen.getByText(/No se realizó ningún cobro/)).toBeInTheDocument();
    expect(screen.getByText("KE-123456")).toBeInTheDocument();
  });

  it("Ejecuta onReintentar al pulsar Reintentar pago", async () => {
    const usuario = userEvent.setup();
    const onReintentar = vi.fn();

    renderizarPagoFallido(onReintentar);
    await usuario.click(
      screen.getByRole("button", { name: "Reintentar pago" }),
    );

    expect(onReintentar).toHaveBeenCalledTimes(1);
  });

  it("Ofrece seguir comprando con un enlace al catálogo", () => {
    renderizarPagoFallido();

    expect(
      screen.getByRole("link", { name: "Seguir comprando" }),
    ).toHaveAttribute("href", "/productos");
  });
});
