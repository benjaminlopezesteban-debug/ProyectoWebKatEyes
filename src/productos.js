/* src/productos.js — fuente de datos simulada (reemplaza a js/data.js).
   Es JavaScript puro, sin React: solo datos y funciones CRUD.

   Las imágenes se guardan SOLO como nombre de archivo; la URL real se
   obtiene con resolverImagen() (ver utils/imagenes.js).

   OJO: por ahora los datos viven en memoria. Si recargas la página, los
   cambios hechos con crear/actualizar/eliminar se pierden. Más adelante
   se conecta a localStorage (la "persistencia" que pide la evaluación). */

const PRODUCTOS_INICIALES = [
    {
        id: 1, nombre: "Base Líquida Mate", precio: 12990, precioAnterior: 16990, categoria: "Rostro",
        imagenes: ["Base líquida mate.jpg"],
        descripcion: "Base líquida de acabado mate y cobertura media, de textura ligera y buena duración durante el día."
    },
    {
        id: 2, nombre: "Corrector Cremoso", precio: 8990, precioAnterior: 12990, categoria: "Rostro",
        imagenes: ["Corrector Cremoso.jpg"],
        descripcion: "Corrector de textura cremosa para difuminar ojeras e imperfecciones con facilidad."
    },
    {
        id: 3, nombre: "Delineador Líquido Negro", precio: 6990, precioAnterior: 9990, categoria: "Ojos",
        imagenes: ["Delineador Líquido Negro.jpg"],
        descripcion: "Delineador de punta fina y trazo preciso, color negro intenso y secado rápido."
    },
    {
        id: 4, nombre: "Máscara de Pestañas Volumen", precio: 9990, categoria: "Ojos",
        imagenes: ["Máscara de Pestañas Volumen.jpg"],
        descripcion: "Máscara que aporta volumen y definición a las pestañas sin formar grumos."
    },
    {
        id: 5, nombre: "Labial Mate Rosa Nude", precio: 7990, categoria: "Labios",
        imagenes: ["Labial Mate Rosa Nude.jpg"],
        descripcion: "Labial de acabado mate en un tono rosa nude versátil para el día a día."
    },
    {
        id: 6, nombre: "Brillo Labial Hidratante", precio: 5990, categoria: "Labios",
        imagenes: ["Brillo Labial Hidratante.jpg"],
        descripcion: "Brillo transparente de textura no pegajosa que deja los labios suaves y luminosos."
    },
    {
        id: 7, nombre: "Esmalte Gel Lila", precio: 4990, categoria: "Uñas",
        imagenes: ["Esmalte Gel Lila.jpg"],
        descripcion: "Esmalte de efecto gel en tono lila pastel, de brillo duradero y fácil aplicación."
    },
    {
        id: 8, nombre: "Crema Hidratante Facial", precio: 15990, categoria: "Cuidado de la piel",
        imagenes: ["Crema Hidratante Facial.jpg"],
        descripcion: "Crema facial de absorción rápida para hidratar la piel durante todo el día."
    },
    {
        id: 9, nombre: "Set de Brochas", precio: 19990, categoria: "Accesorios",
        imagenes: ["Set de Brochas.jpg"],
        descripcion: "Set de brochas de cerdas suaves para rostro y ojos, con estuche de guardado."
    }
];

// "Base de datos" en memoria (se puede reasignar porque es let)
let productos = [...PRODUCTOS_INICIALES];

/* ---------- READ ---------- */
export function obtenerProductos() {
    return [...productos]; // copia: quien la reciba no puede alterar el original
}

export function obtenerProductoPorId(id) {
    return productos.find(p => p.id === Number(id)) ?? null;
}

// Las categorías salen de los propios productos (no hay otra lista que mantener)
export function obtenerCategorias() {
    return [...new Set(productos.map(p => p.categoria))];
}

/* ---------- CREATE ---------- */
export function crearProducto(datos) {
    const id = productos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const nuevo = { id, ...datos };
    productos = [...productos, nuevo];
    return nuevo;
}

/* ---------- UPDATE ---------- */
export function actualizarProducto(id, cambios) {
    const existente = obtenerProductoPorId(id);
    if (!existente) return null;
    const actualizado = { ...existente, ...cambios, id: existente.id };
    productos = productos.map(p => (p.id === existente.id ? actualizado : p));
    return actualizado;
}

/* ---------- DELETE ---------- */
export function eliminarProducto(id) {
    const antes = productos.length;
    productos = productos.filter(p => p.id !== Number(id));
    return productos.length < antes; // true si realmente se eliminó algo
}
