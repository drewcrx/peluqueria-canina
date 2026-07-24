// En el navegador (web y dev), '/api' funciona porque Vite/el servidor sirven todo desde el
// mismo origen. La app empaquetada con Capacitor no tiene ese origen compartido — carga desde
// su propio esquema (capacitor://) — así que ahí VITE_API_BASE_URL debe apuntar al host real
// del backend (ver frontend/.env.capacitor).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Origen del backend sin el sufijo "/api", para resolver URLs de archivos subidos
// (fotos, logos) que el backend devuelve como rutas relativas a la raíz ("/uploads/...").
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

export function resolveUploadUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (/^https?:\/\//i.test(url)) return url
  return `${API_ORIGIN}${url}`
}
