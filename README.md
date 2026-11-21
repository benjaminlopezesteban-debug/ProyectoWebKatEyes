# Kateyes — Tienda de cosméticos (React)

Tienda online de cosméticos construida como aplicación de una sola página (SPA) con **React**. Es la migración de la versión original en HTML, CSS y JavaScript a componentes reutilizables, con diseño responsivo en Bootstrap y pruebas unitarias.

No hay backend: los datos salen de archivos JavaScript que simulan una base de datos y el estado del usuario (carrito, sesión, pedido) se guarda en `localStorage`.

> Proyecto académico — Evaluación Parcial 2 de DSY1104 (desarrollo frontend con React).

## Funcionalidades

**Tienda**
- Catálogo con filtros por categoría y rango de precio, y acceso directo a una categoría desde el menú (`/productos?categoria=Labios`).
- Detalle de producto con galería de imágenes, selector de cantidad, subtotal y productos relacionados.
- Carrito en panel lateral y botón flotante: máximo 10 unidades por producto, ahorro total y persistencia entre páginas y recargas.
- Checkout con validación de datos, método de pago, pago simulado y pantallas de compra exitosa y de pago fallido.
- Modal de novedades en la página de inicio.

**Usuarios**
- Registro con región y comuna dependientes (16 regiones y 346 comunas de Chile).
- Inicio y cierre de sesión simulados; con sesión iniciada, el checkout parte con los datos del usuario.

**Contenido**
- Blog con listado y entradas individuales, página "Nosotros" y formulario de contacto con contador de caracteres.

## Tecnologías

| Área | Herramienta |
|---|---|
| Base | React + Vite |
| Navegación | React Router |
| Estilos | Bootstrap 5.3, Bootstrap Icons y `src/index.css` |
| Estado compartido | React Context (carrito y sesión) |
| Pruebas | Vitest, Testing Library, user-event, jest-dom (jsdom) |

## Requisitos

- Node.js 20.19 o superior (o 22.12+), requerido por Vite.
- npm.

## Instalación y uso

```bash
# 1. Instalar dependencias del proyecto
npm install

# 2. Si falta alguna de las librerías de la aplicación
npm install react-router-dom bootstrap bootstrap-icons

# 3. Servidor de desarrollo
npm run dev
```

Vite muestra la URL local, normalmente `http://localhost:5173`.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Compila la aplicación para producción en `dist/` |
| `npm run preview` | Sirve localmente la versión compilada |
| `npm run lint` | Revisa el código con ESLint |
| `npx vitest run` | Ejecuta todas las pruebas una vez (o `npm test` si el script está definido en `package.json`) |

## Estructura del proyecto

```
src/
├── main.jsx                 Punto de entrada: estilos, Router y Providers
├── App.jsx                  Layout común y mapa de rutas
├── index.css                Estilos globales
│
├── productos.js             Catálogo y CRUD en memoria
├── blogs.js                 Entradas del blog
├── regiones.js              Regiones y comunas
├── carrito.js               Reglas del carrito (funciones puras)
├── validaciones.js          Reglas de validación de formularios
├── usuarios.js              Usuarios simulados (registro y autenticación)
├── pedidos.js               Creación del pedido confirmado
├── pagos.js                 Simulación de la pasarela de pago
│
├── utils/                   formatearPrecio.js, imagenes.js
├── context/                 CarritoContext/Provider, SesionContext/Provider
├── hooks/                   useFormulario.js
├── components/              Header, Footer, PanelCarrito, TarjetaProducto, CampoFormulario, ...
├── views/                   Una vista por página
├── assets/                  Imágenes de productos, blogs y logo
└── test/                    Pruebas unitarias y setup.js
```

Los archivos de datos y reglas no dependen de React, por lo que se prueban directamente y podrían reutilizarse con un backend real. Las dependencias entre capas solo van hacia abajo: datos y reglas → utilidades → estado compartido → componentes → vistas.

## Rutas

| Ruta | Vista |
|---|---|
| `/` | Inicio |
| `/productos` | Catálogo (acepta `?categoria=`) |
| `/productos/:id` | Detalle de producto |
| `/checkout` | Finalizar compra |
| `/blogs` | Listado de blogs |
| `/blogs/:slug` | Entrada del blog |
| `/nosotros` | Sobre nosotros |
| `/contacto` | Formulario de contacto |
| `/iniciar-sesion` | Inicio de sesión |
| `/registro` | Registro de usuario |

## Imágenes

Las imágenes están en `src/assets/` (en cualquier subcarpeta). `productos.js` y `blogs.js` guardan solo el **nombre del archivo** (por ejemplo `Base líquida mate.jpg`) y `resolverImagen()` obtiene la URL final. Si un nombre no coincide con ningún archivo, se muestra un recuadro gris "Sin imagen".

## Datos y persistencia

| Clave en `localStorage` | Contenido |
|---|---|
| `kateye_carrito` | Productos y cantidades del carrito |
| `kateye_sesion` | Id del usuario con sesión iniciada |
| `kateye_usuarios` | Usuarios registrados |
| `kateye_ultimo_pedido` | Último pedido confirmado |

Para reiniciar la aplicación a su estado inicial, borra esas claves desde las herramientas del navegador (Application → Local Storage).

## Pruebas

```bash
npx vitest run
```

Hay 165 pruebas en 13 archivos dentro de `src/test/`:

- **Lógica** (`carrito`, `validaciones`, `productos` y regiones, `usuarios`, `pedidos` y pagos): funciones puras, sin renderizar.
- **Componentes y vistas** (`Precio`, `BotonAgregar`, `TarjetaProducto`, `CampoFormulario`, `PagoFallido`, `ConfirmacionPedido`, `Header`, `Productos`): renderizado, renderizado condicional, props, estado y eventos.

`src/test/setup.js` carga las extensiones de jest-dom y limpia el DOM después de cada prueba. Los componentes que usan enlaces se prueban dentro de `MemoryRouter`.

## Cómo probar el flujo completo

1. Entra a `/registro`, crea una cuenta (correo `@gmail.com`, `@duoc.cl` o `@profesor.duoc.cl`, contraseña de 4 a 10 caracteres). Quedas con la sesión iniciada.
2. Agrega productos desde el catálogo, el detalle o el inicio y revisa el carrito.
3. Pulsa **Ir a pagar**: el formulario parte con tus datos.
4. Para ver la pantalla de pago fallido, marca **Simular pago rechazado** antes de confirmar. Con **Reintentar pago** vuelves al formulario con los datos intactos.

## Limitaciones conocidas

- **Prototipo sin backend:** el pago es simulado y no se realiza ningún cobro.
- **Contraseñas en texto plano** en `localStorage`. Es aceptable solo para este prototipo; un sistema real las gestiona el servidor con un hash.
- La casilla *Simular pago rechazado* existe solo para demostrar y probar el flujo de fallo; debe retirarse cuando haya un backend de pagos.
- El panel de administración no está migrado a React; el CRUD de `productos.js` existe, pero sin interfaz ni persistencia (los cambios se pierden al recargar).
- `Checkout` y `Contacto` aún no usan el hook `useFormulario` (está marcado en el código).
- El menú móvil no se cierra solo al navegar a otra página.

## Autores

Vicente Cuevas y Benjamín López.
