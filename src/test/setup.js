import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

// Testing Library solo limpia el DOM entre pruebas por sí sola cuando Vitest
// tiene "globals: true". Sin eso, lo renderizado en una prueba sigue en pantalla
// en la siguiente del mismo archivo (por ejemplo, dos botones "Confirmar").
// Esto reemplaza al unmount() manual que se usaba en BotonConfirmar.test.jsx.
afterEach(() => {
    cleanup()
})
