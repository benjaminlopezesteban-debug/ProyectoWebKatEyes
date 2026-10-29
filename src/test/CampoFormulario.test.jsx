import { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import CampoFormulario from "../components/CampoFormulario"

// CampoFormulario es "controlado": el valor lo guarda quien lo usa. Para probar que
// el estado cambia cuando el usuario escribe, se usa un formulario mínimo con useState.
function FormularioDePrueba() {
    const [valor, setValor] = useState("")
    return (
        <CampoFormulario
            id="t-nombre"
            nombre="nombre"
            etiqueta="Nombre"
            valor={valor}
            onChange={e => setValor(e.target.value)}
        />
    )
}

describe("CampoFormulario", () => {
    it("Asocia la etiqueta con su campo", () => {
        render(<CampoFormulario id="t-nombre" nombre="nombre" etiqueta="Nombre" valor="" onChange={() => {}} />)

        expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    })

    it("Cambia el valor cuando el usuario escribe", async () => {
        const usuario = userEvent.setup()

        render(<FormularioDePrueba />)
        const campo = screen.getByLabelText("Nombre")
        await usuario.type(campo, "Ana")

        expect(campo).toHaveValue("Ana");
    })

    it("Avisa cada cambio al formulario con onChange", async () => {
        const usuario = userEvent.setup()
        const onChange = vi.fn()

        render(<CampoFormulario id="t-nombre" nombre="nombre" etiqueta="Nombre" valor="" onChange={onChange} />)
        await usuario.type(screen.getByLabelText("Nombre"), "Ana")

        expect(onChange).toHaveBeenCalledTimes(3);
    })

    it("Avisa cuando se sale del campo con onBlur", async () => {
        const usuario = userEvent.setup()
        const onBlur = vi.fn()

        render(<CampoFormulario id="t-nombre" nombre="nombre" etiqueta="Nombre" valor="" onChange={() => {}} onBlur={onBlur} />)
        await usuario.click(screen.getByLabelText("Nombre"))
        await usuario.tab()

        expect(onBlur).toHaveBeenCalledTimes(1);
    })

    it("No muestra error ni marca el campo como inválido cuando no hay error", () => {
        render(<CampoFormulario id="t-nombre" nombre="nombre" etiqueta="Nombre" valor="" onChange={() => {}} />)

        const campo = screen.getByLabelText("Nombre")

        expect(campo).not.toHaveClass("is-invalid");
        expect(campo).toHaveAttribute("aria-invalid", "false");
    })

    it("Muestra el mensaje de error y marca el campo como inválido", () => {
        render(<CampoFormulario id="t-nombre" nombre="nombre" etiqueta="Nombre" valor="" error="Ingresa tu nombre." onChange={() => {}} />)

        const campo = screen.getByLabelText("Nombre")

        expect(screen.getByText("Ingresa tu nombre.")).toBeInTheDocument();
        expect(campo).toHaveClass("is-invalid");
        expect(campo).toHaveAttribute("aria-invalid", "true");
        expect(campo).toHaveAttribute("aria-describedby", "error-t-nombre");
    })

    it("Dibuja un textarea cuando el tipo es textarea", () => {
        render(<CampoFormulario id="t-msg" nombre="msg" etiqueta="Mensaje" tipo="textarea" valor="" onChange={() => {}} />)

        expect(screen.getByLabelText("Mensaje").tagName).toBe("TEXTAREA");
    })

    it("Dibuja un select con las opciones recibidas como hijos", () => {
        render(
            <CampoFormulario id="t-region" nombre="region" etiqueta="Región" tipo="select" valor="" onChange={() => {}}>
                <option value="">Selecciona una región...</option>
                <option value="maule">Maule</option>
            </CampoFormulario>
        )

        expect(screen.getByRole("combobox", { name: "Región" })).toHaveClass("form-select");
        expect(screen.getAllByRole("option")).toHaveLength(2);
    })

    it("Muestra el contenido de ayuda recibido por props", () => {
        render(<CampoFormulario id="t-msg" nombre="msg" etiqueta="Mensaje" valor="" onChange={() => {}} ayuda={<div>0/500</div>} />)

        expect(screen.getByText("0/500")).toBeInTheDocument();
    })
})
