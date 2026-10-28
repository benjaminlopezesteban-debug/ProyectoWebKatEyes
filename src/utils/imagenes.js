/* src/utils/imagenes.js — resuelve nombres de archivo a URLs de src/assets.

   Problema: con las imágenes en src/assets, Vite les cambia el nombre al
   compilar (Base líquida mate.jpg → Base_líquida_mate-a1b2c3.jpg), así que
   no se puede escribir src="/assets/Base líquida mate.jpg" a mano.

   Solución: import.meta.glob le pide a Vite que procese TODAS las imágenes
   de src/assets (en cualquier subcarpeta) y nos entregue un objeto
   { ruta: urlFinal }. Luego lo reindexamos por nombre de archivo, para que
   productos.js solo tenga que guardar "Base líquida mate.jpg". */

export const IMG_PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">' +
        '<rect width="100%" height="100%" fill="#eef1f4"/>' +
        '<text x="50%" y="50%" font-family="Arial" font-size="26" fill="#98a2b3" ' +
        'text-anchor="middle" dominant-baseline="middle">Sin imagen</text></svg>'
    );

const modulos = import.meta.glob("../assets/**/*.{jpg,jpeg,png,webp,avif}", {
    eager: true,
    query: "?url",
    import: "default",
});

// normalize("NFC") evita fallos con tildes (á, ñ) entre sistemas operativos
const IMAGENES = Object.fromEntries(
    Object.entries(modulos).map(([ruta, url]) => [
        ruta.split("/").pop().normalize("NFC"),
        url,
    ])
);

/* "Base líquida mate.jpg" → URL final. Si el archivo no existe, devuelve el placeholder. */
export function resolverImagen(nombreArchivo) {
    return IMAGENES[String(nombreArchivo).normalize("NFC")] ?? IMG_PLACEHOLDER;
}
