export function urlAsset(ruta) {
  if (!ruta) return "";
  if (/^(https?:|data:)/i.test(ruta)) return ruta;
  return `${import.meta.env.VITE_ASSETS_URL ?? ""}${ruta}`;
}
