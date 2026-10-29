import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it } from "vitest"
import Productos from "../views/Productos"
import CarritoProvider from "../context/CarritoProvider"
import { obtenerProductos } from "../productos"

// La vista usa <Link> (necesita un Router) y useCarrito() (necesita el CarritoProvider)
function renderizarProductos(ruta = "/productos") {
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <CarritoProvider>
                <Productos />
            </CarritoProvider>
        </MemoryRouter>
    )
}

const productos = obtenerProductos()
const deCategoria = categoria => productos.filter(p => p.categoria === categoria)

describe("Productos", () => {
    beforeEach(() => {
        localStorage.clear() // el carrito se guarda ahí: cada prueba parte vacía
    })

    describe("Renderizado de la lista", () => {
        it("Renderiza todos los productos del catálogo", () => {
            renderizarProductos()

            expect(screen.getAllByRole("button", { name: "Añadir al carrito" })).toHaveLength(productos.length);
        })

        it("Muestra el nombre de cada producto", () => {
            renderizarProductos()

            productos.forEach(p => {
                expect(screen.getByRole("heading", { name: p.nombre })).toBeInTheDocument();
            })
        })

        it("Ofrece una casilla por cada categoría, todas marcadas al inicio", () => {
            renderizarProductos()

            const categorias = [...new Set(productos.map(p => p.categoria))]

            categorias.forEach(c => {
                expect(screen.getByLabelText(c)).toBeChecked();
            })
        })
    })

    describe("Categoría recibida por la URL", () => {
        it("Marca solo la categoría pedida", () => {
            renderizarProductos("/productos?categoria=Labios")

            expect(screen.getByLabelText("Labios")).toBeChecked();
            expect(screen.getByLabelText("Rostro")).not.toBeChecked();
        })

        it("Muestra solo los productos de esa categoría", () => {
            renderizarProductos("/productos?categoria=Labios")

            expect(screen.getAllByRole("button", { name: "Añadir al carrito" }))
                .toHaveLength(deCategoria("Labios").length);
        })

        it("Ignora una categoría que no existe y muestra todo", () => {
            renderizarProductos("/productos?categoria=Inventada")

            expect(screen.getAllByRole("button", { name: "Añadir al carrito" })).toHaveLength(productos.length);
        })
    })

    describe("Filtros (estado y eventos)", () => {
        it("Oculta los productos de una categoría al desmarcarla", async () => {
            const usuario = userEvent.setup()

            renderizarProductos()
            await usuario.click(screen.getByLabelText("Rostro"))

            deCategoria("Rostro").forEach(p => {
                expect(screen.queryByRole("heading", { name: p.nombre })).not.toBeInTheDocument();
            })
            expect(screen.getAllByRole("button", { name: "Añadir al carrito" }))
                .toHaveLength(productos.length - deCategoria("Rostro").length);
        })

        it("Filtra por precio máximo", async () => {
            const usuario = userEvent.setup()

            renderizarProductos()
            const maximo = screen.getByLabelText("Máximo")
            await usuario.clear(maximo)
            await usuario.type(maximo, "8000")

            const esperados = productos.filter(p => p.precio <= 8000)
            expect(screen.getAllByRole("button", { name: "Añadir al carrito" })).toHaveLength(esperados.length);
        })
    })

    describe("Renderizado condicional del aviso", () => {
        it("No muestra el aviso de sin resultados cuando hay productos", () => {
            renderizarProductos()

            expect(screen.queryByText(/No hay productos que coincidan/)).not.toBeInTheDocument();
        })

        it("Muestra el aviso solo cuando ningún producto cumple los filtros", async () => {
            const usuario = userEvent.setup()

            renderizarProductos()
            const maximo = screen.getByLabelText("Máximo")
            await usuario.clear(maximo)
            await usuario.type(maximo, "1")

            expect(screen.getByText(/No hay productos que coincidan/)).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Añadir al carrito" })).not.toBeInTheDocument();
        })

        it("Limpiar filtros restaura todos los productos y oculta el aviso", async () => {
            const usuario = userEvent.setup()

            renderizarProductos()
            const maximo = screen.getByLabelText("Máximo")
            await usuario.clear(maximo)
            await usuario.type(maximo, "1")
            await usuario.click(screen.getByRole("button", { name: "Limpiar filtros" }))

            expect(screen.queryByText(/No hay productos que coincidan/)).not.toBeInTheDocument();
            expect(screen.getAllByRole("button", { name: "Añadir al carrito" })).toHaveLength(productos.length);
        })
    })

    describe("Integración con el carrito", () => {
        it("Confirma con '✓ Añadido' al agregar un producto", async () => {
            const usuario = userEvent.setup()

            renderizarProductos()
            await usuario.click(screen.getAllByRole("button", { name: "Añadir al carrito" })[0])

            expect(screen.getByText("✓ Añadido")).toBeInTheDocument();
        })

        it("Guarda el producto agregado en el carrito", async () => {
            const usuario = userEvent.setup()

            renderizarProductos()
            await usuario.click(screen.getAllByRole("button", { name: "Añadir al carrito" })[0])

            const guardado = JSON.parse(localStorage.getItem("kateye_carrito"))
            expect(guardado).toEqual([{ id: productos[0].id, cantidad: 1 }]);
        })
    })
})
