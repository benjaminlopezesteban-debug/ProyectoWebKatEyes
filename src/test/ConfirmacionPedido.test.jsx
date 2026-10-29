import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import ConfirmacionPedido from "../components/ConfirmacionPedido"

const pedido = {
    numero: "KE-123456",
    total: 35970,
    cliente: { correo: "ana@gmail.com" },
}

describe("ConfirmacionPedido", () => {
    it("Agradece la compra", () => {
        render(<MemoryRouter><ConfirmacionPedido pedido={pedido} /></MemoryRouter>)

        expect(screen.getByRole("heading", { name: "¡Gracias por tu compra!" })).toBeInTheDocument();
    })

    it("Muestra el número de pedido recibido", () => {
        render(<MemoryRouter><ConfirmacionPedido pedido={pedido} /></MemoryRouter>)

        expect(screen.getByText("KE-123456")).toBeInTheDocument();
    })

    it("Muestra el total formateado y el correo donde se enviará el detalle", () => {
        render(<MemoryRouter><ConfirmacionPedido pedido={pedido} /></MemoryRouter>)

        expect(screen.getByText(/Total: \$35\.970/)).toBeInTheDocument();
        expect(screen.getByText(/ana@gmail\.com/)).toBeInTheDocument();
    })

    it("Permite volver al inicio", () => {
        render(<MemoryRouter><ConfirmacionPedido pedido={pedido} /></MemoryRouter>)

        expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/");
    })
})
