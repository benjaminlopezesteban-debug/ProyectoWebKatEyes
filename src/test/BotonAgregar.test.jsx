import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import BotonAgregar from "../components/BotonAgregar"

const producto = { id: 1, nombre: "Base Líquida Mate" }

describe("BotonAgregar", () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it("Muestra el botón habilitado con el texto por defecto", () => {
        render(<BotonAgregar producto={producto} onAgregar={() => 1} />)

        const boton = screen.getByRole("button", { name: "Añadir al carrito" })

        expect(boton).toBeInTheDocument();
        expect(boton).toBeEnabled();
    })

    it("Muestra el texto recibido por props", () => {
        render(<BotonAgregar producto={producto} onAgregar={() => 1} texto="Agregar al carrito" />)

        expect(screen.getByRole("button", { name: "Agregar al carrito" })).toBeInTheDocument();
    })

    it("Aplica las clases extra recibidas por props", () => {
        render(<BotonAgregar producto={producto} onAgregar={() => 1} className="w-100" />)

        expect(screen.getByRole("button")).toHaveClass("w-100");
    })

    it("Llama a onAgregar con el producto al pulsar el botón", async () => {
        const usuario = userEvent.setup()
        const onAgregar = vi.fn(() => 1)

        render(<BotonAgregar producto={producto} onAgregar={onAgregar} />)
        await usuario.click(screen.getByRole("button", { name: "Añadir al carrito" }))

        expect(onAgregar).toHaveBeenCalledTimes(1);
        expect(onAgregar).toHaveBeenCalledWith(producto);
    })

    it("Confirma con '✓ Añadido' cuando se agregó al menos una unidad", async () => {
        const usuario = userEvent.setup()

        render(<BotonAgregar producto={producto} onAgregar={() => 2} />)
        await usuario.click(screen.getByRole("button"))

        expect(screen.getByRole("button", { name: "✓ Añadido" })).toBeInTheDocument();
        expect(screen.getByRole("button")).toHaveClass("agregado");
    })

    it("Avisa el máximo cuando no se pudo agregar ninguna unidad", async () => {
        const usuario = userEvent.setup()

        render(<BotonAgregar producto={producto} onAgregar={() => 0} />)
        await usuario.click(screen.getByRole("button"))

        expect(screen.getByRole("button", { name: "Máx. 10 unidades" })).toBeInTheDocument();
        expect(screen.getByRole("button")).not.toHaveClass("agregado");
    })

    it("Vuelve al texto original después de 1,2 segundos", async () => {
        // "shouldAdvanceTime" deja que el reloj simulado avance junto al real;
        // sin eso, userEvent espera un setTimeout interno que nunca se cumple.
        vi.useFakeTimers({ shouldAdvanceTime: true })
        const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

        render(<BotonAgregar producto={producto} onAgregar={() => 1} />)
        await usuario.click(screen.getByRole("button"))

        expect(screen.getByRole("button", { name: "✓ Añadido" })).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(1200)
        })

        expect(screen.getByRole("button", { name: "Añadir al carrito" })).toBeInTheDocument();
    })
})
