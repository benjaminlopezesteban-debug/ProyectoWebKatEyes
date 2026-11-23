import { beforeEach, describe, expect, it } from "vitest";
import {
  CLAVE_CARRITO,
  CLAVE_CARRITO_LEGADO,
  agregarItem,
  cambiarCantidadItem,
  detallarCarrito,
  leerCarritoGuardado,
  reconciliarCarrito,
} from "../carrito";

const PRODUCTO = {
  id: 1,
  nombre: "Crema Hidratante",
  precio: 14990,
  precioOferta: null,
  precioFinal: 14990,
  stock: 5,
  imagenUrl: "/img/productos/kat-002.jpg",
  activo: true,
};

describe("carrito", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("Limita la cantidad al stock disponible", () => {
    const { carrito, agregadas } = agregarItem([], 1, 9, PRODUCTO);

    expect(agregadas).toBe(5);
    expect(carrito[0].cantidad).toBe(5);
  });

  it("No agrega más unidades cuando ya está en el máximo", () => {
    const carrito = [{ id: 1, cantidad: 5, producto: PRODUCTO }];
    const { agregadas } = agregarItem(carrito, 1, 1, PRODUCTO);

    expect(agregadas).toBe(0);
  });

  it("Reconcilia con el catálogo, descarta inexistentes y actualiza el snapshot", () => {
    const carrito = [
      { id: 1, cantidad: 9, producto: { ...PRODUCTO, precioFinal: 1000 } },
      { id: 2, cantidad: 1, producto: { id: 2, stock: 3 } },
    ];

    const resultado = reconciliarCarrito(carrito, [
      { ...PRODUCTO, precioFinal: 12000 },
    ]);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].cantidad).toBe(5);
    expect(resultado[0].producto.precioFinal).toBe(12000);
  });

  it("Descarta productos sin stock", () => {
    const carrito = [{ id: 1, cantidad: 1, producto: PRODUCTO }];

    expect(reconciliarCarrito(carrito, [{ ...PRODUCTO, stock: 0 }])).toEqual(
      [],
    );
  });

  it("Cambia la cantidad respetando el máximo por stock", () => {
    const carrito = [{ id: 1, cantidad: 3, producto: PRODUCTO }];

    expect(cambiarCantidadItem(carrito, 1, 10)[0].cantidad).toBe(5);
    expect(cambiarCantidadItem(carrito, 1, -10)).toEqual([]);
  });

  it("Detalla precio vigente, máximo y stock", () => {
    const lineas = detallarCarrito([
      { id: 1, cantidad: 2, producto: PRODUCTO },
    ]);

    expect(lineas[0]).toMatchObject({
      precio: 14990,
      max: 5,
      stock: 5,
      cantidad: 2,
    });
  });

  it("Migra el carrito legado a la clave v2", () => {
    localStorage.setItem(
      CLAVE_CARRITO_LEGADO,
      JSON.stringify([{ id: 1, cantidad: 2, producto: PRODUCTO }]),
    );

    const carrito = leerCarritoGuardado();

    expect(carrito).toHaveLength(1);
    expect(localStorage.getItem(CLAVE_CARRITO_LEGADO)).toBeNull();
    expect(localStorage.getItem(CLAVE_CARRITO)).toBeNull();
  });
});
