import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import TarjetaProducto from "../components/TarjetaProducto"

const producto = {
    id: 3,
    nombre: "Delineador Líquido Negro",
    precio: 6990,
    precioAnterior: 9990,
    categoria: "Ojos",
    imagenes: ["Delineador Líquido Negro.jpg"],
    descripcion: "Delineador de punta fina.",
}

// La tarjeta usa <Link>, que necesita un Router alrededor. MemoryRouter es
// un router de mentira que vive en memoria y sirve para pruebas.
function renderizarTarjeta(onAgregar = () => 1) {
    render(
        <MemoryRouter>
            <TarjetaProducto producto={producto} onAgregar={onAgregar} />
        </MemoryRouter>
    )
}

describe("TarjetaProducto", () => {
    it("Muestra el nombre del producto recibido", () => {
        renderizarTarjeta()

        expect(screen.getByRole("heading", { name: "Delineador Líquido Negro" })).toBeInTheDocument();
    })

    it("Muestra el precio actual y el descuento", () => {
        renderizarTarjeta()

        expect(screen.getByText("$6.990")).toBeInTheDocument();
        expect(screen.getByText("-30%")).toBeInTheDocument();
    })

    it("Muestra la imagen con el nombre como texto alternativo", () => {
        renderizarTarjeta()

        expect(screen.getByAltText("Delineador Líquido Negro")).toBeInTheDocument();
    })

    it("Enlaza al detalle del producto", () => {
        renderizarTarjeta()

        expect(screen.getByRole("link")).toHaveAttribute("href", "/productos/3");
    })

    it("Avisa con el producto cuando se pulsa Añadir al carrito", async () => {
        const usuario = userEvent.setup()
        const onAgregar = vi.fn(() => 1)

        renderizarTarjeta(onAgregar)
        await usuario.click(screen.getByRole("button", { name: "Añadir al carrito" }))

        expect(onAgregar).toHaveBeenCalledWith(producto);
        expect(screen.getByText("✓ Añadido")).toBeInTheDocument();
    })
})
