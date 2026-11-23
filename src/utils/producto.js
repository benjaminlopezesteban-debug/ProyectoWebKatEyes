export function nombreCategoria(producto) {
  return producto?.categoriaNombre ?? producto?.categoria ?? "";
}

export function precioVigente(producto) {
  return producto?.precioFinal ?? producto?.precio ?? 0;
}
