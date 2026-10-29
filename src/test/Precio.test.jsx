import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import Precio from "../components/Precio"

describe("Precio", () => {
    it("Muestra solo el precio cuando el producto no tiene oferta", () => {
        render(<Precio producto={{ precio: 9990 }} />)

        expect(screen.getByText("$9.990")).toBeInTheDocument();
        expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    })

    it("Muestra precio anterior, precio actual y porcentaje cuando hay oferta", () => {
        render(<Precio producto={{ precio: 12990, precioAnterior: 16990 }} />)

        expect(screen.getByText("$16.990")).toBeInTheDocument();
        expect(screen.getByText("$12.990")).toBeInTheDocument();
        expect(screen.getByText("-24%")).toBeInTheDocument();
    })

    it("Tacha el precio anterior", () => {
        render(<Precio producto={{ precio: 12990, precioAnterior: 16990 }} />)

        expect(screen.getByText("$16.990")).toHaveClass("text-decoration-line-through");
    })

    it("No muestra oferta si el precio anterior no es mayor al actual", () => {
        render(<Precio producto={{ precio: 5000, precioAnterior: 5000 }} />)

        expect(screen.getByText("$5.000")).toBeInTheDocument();
        expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    })

    it("Aplica el tamaño recibido por props", () => {
        render(<Precio producto={{ precio: 1000 }} tamano="h2" />)

        expect(screen.getByText("$1.000")).toHaveClass("h2");
    })
})
