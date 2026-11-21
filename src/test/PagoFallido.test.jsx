import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import PagoFallido from "../components/PagoFallido"

const resultado = { codigo: "PAGO-RECHAZADO", motivo: "Tu banco rechazó la transacción." }

function renderizarPagoFallido(onReintentar = () => {}) {
    render(
        <MemoryRouter>
            <PagoFallido resultado={resultado} onReintentar={onReintentar} />
        </MemoryRouter>
    )
}

describe("PagoFallido", () => {
    it("Avisa que no se pudo realizar el pago como alerta", () => {
        renderizarPagoFallido()

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "No se pudo realizar el pago" })).toBeInTheDocument();
    })

    it("Muestra el motivo y el código recibidos", () => {
        renderizarPagoFallido()

        expect(screen.getByText("Tu banco rechazó la transacción.")).toBeInTheDocument();
        expect(screen.getByText("PAGO-RECHAZADO")).toBeInTheDocument();
    })

    it("Tranquiliza al usuario: no hubo cobro y el carrito sigue intacto", () => {
        renderizarPagoFallido()

        expect(screen.getByText(/No se realizó ningún cobro/)).toBeInTheDocument();
    })

    it("Ejecuta onReintentar al pulsar Reintentar pago", async () => {
        const usuario = userEvent.setup()
        const onReintentar = vi.fn()

        renderizarPagoFallido(onReintentar)
        await usuario.click(screen.getByRole("button", { name: "Reintentar pago" }))

        expect(onReintentar).toHaveBeenCalledTimes(1);
    })

    it("Ofrece seguir comprando con un enlace al catálogo", () => {
        renderizarPagoFallido()

        expect(screen.getByRole("link", { name: "Seguir comprando" })).toHaveAttribute("href", "/productos");
    })
})
