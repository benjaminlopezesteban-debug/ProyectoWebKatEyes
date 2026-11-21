import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import Header from "../components/Header"

function renderizarHeader(props = {}, ruta = "/") {
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <Header {...props} />
        </MemoryRouter>
    )
}

describe("Header", () => {
    describe("Renderizado condicional según la sesión", () => {
        it("Sin sesión muestra Ingresar y Registrarse, pero no Salir", () => {
            renderizarHeader()

            expect(screen.getByRole("link", { name: "Ingresar" })).toBeInTheDocument();
            expect(screen.getByRole("link", { name: "Registrarse" })).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Salir" })).not.toBeInTheDocument();
        })

        it("Con sesión saluda con el primer nombre y muestra Salir", () => {
            renderizarHeader({ usuario: { nombre: "Ana Pérez" } })

            expect(screen.getByText("Hola, Ana")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Salir" })).toBeInTheDocument();
        })

        it("Con sesión oculta Ingresar y Registrarse", () => {
            renderizarHeader({ usuario: { nombre: "Ana Pérez" } })

            expect(screen.queryByRole("link", { name: "Ingresar" })).not.toBeInTheDocument();
            expect(screen.queryByRole("link", { name: "Registrarse" })).not.toBeInTheDocument();
        })
    })

    describe("Eventos", () => {
        it("Ejecuta onCerrarSesion al pulsar Salir", async () => {
            const usuario = userEvent.setup()
            const onCerrarSesion = vi.fn()

            renderizarHeader({ usuario: { nombre: "Ana Pérez" }, onCerrarSesion })
            await usuario.click(screen.getByRole("button", { name: "Salir" }))

            expect(onCerrarSesion).toHaveBeenCalledTimes(1);
        })
    })

    describe("Props", () => {
        it("Muestra la cantidad del carrito recibida", () => {
            renderizarHeader({ cantidadCarrito: 3 })

            expect(screen.getByText("3")).toBeInTheDocument();
        })

        it("Muestra 0 en el carrito si no recibe cantidad", () => {
            renderizarHeader()

            expect(screen.getByText("0")).toBeInTheDocument();
        })
    })

    describe("Listas y navegación", () => {
        it("Lista todas las categorías del menú", () => {
            renderizarHeader()

            const categorias = ["Rostro", "Ojos", "Labios", "Uñas", "Cuidado de la piel", "Accesorios"]

            categorias.forEach(nombre => {
                expect(screen.getByText(nombre)).toBeInTheDocument();
            })
        })

        it("Cada categoría enlaza al catálogo filtrado", () => {
            renderizarHeader()

            expect(screen.getByRole("link", { name: /Cuidado de la piel/ }))
                .toHaveAttribute("href", "/productos?categoria=Cuidado%20de%20la%20piel");
        })

        it("Marca como activo el enlace de la página actual", () => {
            renderizarHeader({}, "/nosotros")

            expect(screen.getByRole("link", { name: "Nosotros" })).toHaveClass("active");
            expect(screen.getByRole("link", { name: "Contacto" })).not.toHaveClass("active");
        })
    })
})
