import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import Checkout from "../views/Checkout";
import CarritoProvider from "../context/CarritoProvider";
import SesionProvider from "../context/SesionProvider";
import { TOKEN_KEY } from "../api/client";
import { CLAVE_CARRITO } from "../carrito";
import { server } from "./mocks/server";

const PRODUCTO = {
  id: 1,
  codigo: "KAT-002",
  nombre: "Crema Hidratante Ácido Hialurónico",
  descripcion: "Hidratación profunda.",
  precio: 14990,
  precioOferta: null,
  precioFinal: 14990,
  stock: 5,
  stockCritico: 1,
  categoriaId: 1,
  categoriaNombre: "Skincare",
  imagenUrl: "/img/productos/kat-002.jpg",
  activo: true,
};

const USUARIO = {
  id: 1,
  nombre: "Ana Pérez",
  correo: "ana@gmail.com",
  telefono: "912345678",
  regionCodigo: "13",
  regionNombre: "Metropolitana de Santiago",
  comunaCodigo: "13101",
  comunaNombre: "Santiago",
  rol: "CLIENTE",
  activo: true,
};

const PEDIDO = {
  pedidoId: 10,
  numero: "KE-10",
  total: 14990,
  estado: "PENDIENTE_PAGO",
};

function prepararSesionYCarrito() {
  localStorage.setItem(TOKEN_KEY, "jwt-checkout");
  localStorage.setItem(
    CLAVE_CARRITO,
    JSON.stringify([{ id: PRODUCTO.id, cantidad: 1, producto: PRODUCTO }]),
  );

  server.use(
    http.get("*/api/v1/usuarios/me", () => HttpResponse.json(USUARIO)),
    http.get("*/api/v1/productos", () => HttpResponse.json([PRODUCTO])),
    http.get("*/api/v1/regiones", () =>
      HttpResponse.json([
        { codigo: "13", nombre: "Metropolitana de Santiago" },
      ]),
    ),
    http.get("*/api/v1/regiones/:codigo/comunas", () =>
      HttpResponse.json([
        {
          codigo: "13101",
          nombre: "Santiago",
          regionCodigo: "13",
          regionNombre: "Metropolitana de Santiago",
        },
      ]),
    ),
  );
}

function renderizarCheckout() {
  render(
    <MemoryRouter>
      <SesionProvider>
        <CarritoProvider>
          <Checkout />
        </CarritoProvider>
      </SesionProvider>
    </MemoryRouter>,
  );
}

async function confirmar(usuario) {
  await screen.findByRole("heading", { name: "Finalizar compra" });
  await usuario.type(
    screen.getByLabelText("Dirección"),
    "Av. Siempre Viva 123",
  );
  await usuario.click(screen.getByRole("button", { name: "Confirmar compra" }));
}

describe("Checkout real", () => {
  beforeEach(() => {
    localStorage.clear();
    prepararSesionYCarrito();
  });

  it("Crea el pedido, paga y vacía el carrito solo tras el checkout", async () => {
    const usuario = userEvent.setup();
    let cabeceraCheckout = null;
    let cuerpoCheckout = null;
    let cabeceraPago = null;

    server.use(
      http.post("*/api/v1/checkout", async ({ request }) => {
        cabeceraCheckout = request.headers.get("Idempotency-Key");
        cuerpoCheckout = await request.json();
        return HttpResponse.json(PEDIDO, { status: 201 });
      }),
      http.post("*/api/v1/pagos/simular", async ({ request }) => {
        cabeceraPago = request.headers.get("Idempotency-Key");
        return HttpResponse.json(
          {
            id: 1,
            pedidoId: 10,
            numeroPedido: "KE-10",
            monto: 14990,
            estado: "APROBADA",
            codigoRespuesta: "00",
            motivo: null,
            referenciaExterna: "SIM-1",
          },
          { status: 201 },
        );
      }),
    );

    renderizarCheckout();
    await confirmar(usuario);

    expect(
      await screen.findByRole("heading", { name: "¡Gracias por tu compra!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("KE-10")).toBeInTheDocument();
    expect(cabeceraCheckout).toBeTruthy();
    expect(cabeceraPago).toBeTruthy();
    expect(cuerpoCheckout).toMatchObject({
      tipoEntrega: "DESPACHO",
      metodoPago: "TARJETA",
      direccion: "Av. Siempre Viva 123",
      regionCodigo: "13",
      comunaCodigo: "13101",
      items: [{ productoId: 1, cantidad: 1 }],
    });

    const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
    expect(guardado).toEqual([]);
  });

  it("Ante rechazo, conserva el pedido y reintenta sin crear otro", async () => {
    const usuario = userEvent.setup();
    let llamadasCheckout = 0;
    let cabeceraReintento = null;
    let correoReintento = null;

    server.use(
      http.post("*/api/v1/checkout", () => {
        llamadasCheckout += 1;
        return HttpResponse.json(PEDIDO, { status: 201 });
      }),
      http.post("*/api/v1/pagos/simular", () =>
        HttpResponse.json(
          {
            id: 1,
            pedidoId: 10,
            numeroPedido: "KE-10",
            monto: 14990,
            estado: "RECHAZADA",
            codigoRespuesta: "05",
            motivo: "Pago rechazado por simulacion",
            referenciaExterna: "SIM-2",
          },
          { status: 201 },
        ),
      ),
      http.post("*/api/v1/pagos/:numero/reintentar", ({ request }) => {
        cabeceraReintento = request.headers.get("Idempotency-Key");
        correoReintento = new URL(request.url).searchParams.get("correo");
        return HttpResponse.json(
          {
            id: 2,
            pedidoId: 10,
            numeroPedido: "KE-10",
            monto: 14990,
            estado: "APROBADA",
            codigoRespuesta: "00",
            motivo: null,
            referenciaExterna: "SIM-3",
          },
          { status: 201 },
        );
      }),
    );

    renderizarCheckout();
    await confirmar(usuario);

    expect(
      await screen.findByRole("heading", {
        name: "No se pudo realizar el pago",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("KE-10")).toBeInTheDocument();
    expect(
      screen.getByText("Pago rechazado por simulacion"),
    ).toBeInTheDocument();

    await usuario.click(
      screen.getByRole("button", { name: "Reintentar pago" }),
    );

    expect(
      await screen.findByRole("heading", { name: "¡Gracias por tu compra!" }),
    ).toBeInTheDocument();
    expect(llamadasCheckout).toBe(1);
    expect(cabeceraReintento).toBeTruthy();
    expect(correoReintento).toBe("ana@gmail.com");
  });
  it("Si falla el checkout, muestra el error y conserva el carrito", async () => {
    const usuario = userEvent.setup();
    let llamadasPago = 0;

    server.use(
      http.post("*/api/v1/checkout", () =>
        HttpResponse.json({ mensaje: "Stock insuficiente" }, { status: 500 }),
      ),
      http.post("*/api/v1/pagos/simular", () => {
        llamadasPago += 1;
        return HttpResponse.json({}, { status: 201 });
      }),
    );

    renderizarCheckout();
    await confirmar(usuario);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Stock insuficiente",
    );
    expect(llamadasPago).toBe(0);
    expect(JSON.parse(localStorage.getItem(CLAVE_CARRITO))).toHaveLength(1);
  });

  it("Si falla la red al pagar, ofrece reintentar sobre el mismo pedido", async () => {
    const usuario = userEvent.setup();

    server.use(
      http.post("*/api/v1/checkout", () =>
        HttpResponse.json(PEDIDO, { status: 201 }),
      ),
      http.post("*/api/v1/pagos/simular", () =>
        HttpResponse.json({ mensaje: "Red caida" }, { status: 500 }),
      ),
      http.post("*/api/v1/pagos/:numero/reintentar", () =>
        HttpResponse.json(
          {
            id: 2,
            pedidoId: 10,
            numeroPedido: "KE-10",
            monto: 14990,
            estado: "APROBADA",
            codigoRespuesta: "00",
            motivo: null,
            referenciaExterna: "SIM-4",
          },
          { status: 201 },
        ),
      ),
    );

    renderizarCheckout();
    await confirmar(usuario);

    expect(
      await screen.findByRole("heading", {
        name: "No se pudo realizar el pago",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Red caida")).toBeInTheDocument();
    expect(screen.getByText("PAGO-NO-CONFIRMADO")).toBeInTheDocument();

    await usuario.click(
      screen.getByRole("button", { name: "Reintentar pago" }),
    );

    expect(
      await screen.findByRole("heading", { name: "¡Gracias por tu compra!" }),
    ).toBeInTheDocument();
  });

  it("Si falla el reintento, muestra el error y mantiene la pantalla de pago fallido", async () => {
    const usuario = userEvent.setup();

    server.use(
      http.post("*/api/v1/checkout", () =>
        HttpResponse.json(PEDIDO, { status: 201 }),
      ),
      http.post("*/api/v1/pagos/simular", () =>
        HttpResponse.json(
          {
            id: 1,
            pedidoId: 10,
            numeroPedido: "KE-10",
            monto: 14990,
            estado: "RECHAZADA",
            codigoRespuesta: "05",
            motivo: "Pago rechazado por simulacion",
            referenciaExterna: "SIM-5",
          },
          { status: 201 },
        ),
      ),
      http.post("*/api/v1/pagos/:numero/reintentar", () =>
        HttpResponse.json(
          { mensaje: "No se pudo reintentar" },
          { status: 500 },
        ),
      ),
    );

    renderizarCheckout();
    await confirmar(usuario);
    await screen.findByRole("heading", { name: "No se pudo realizar el pago" });

    await usuario.click(
      screen.getByRole("button", { name: "Reintentar pago" }),
    );

    expect(
      await screen.findByText("No se pudo reintentar"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "No se pudo realizar el pago" }),
    ).toBeInTheDocument();
  });
});
