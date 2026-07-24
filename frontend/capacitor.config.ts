import type { CapacitorConfig } from '@capacitor/cli';

// server.url: la app carga tu sitio en vivo dentro del WebView, en vez de un paquete de HTML
// offline. Es la opción correcta acá porque backend y frontend van a vivir en el mismo dominio
// (un VPS con Nginx sirviendo el build de React Y haciendo proxy a /api) — todo queda same-origin
// y las cookies de sesión (SameSite=Lax) funcionan igual que en el navegador, sin CORS especial.
//
// HOY (pruebas locales): apunta a tu servidor de desarrollo Vite, visto desde el emulador/dispositivo.
//   - Emulador Android: usa 10.0.2.2, que es el alias del propio host dentro del emulador.
//   - Dispositivo físico en la misma red Wi-Fi: usa la IP LAN de tu PC (ej. 192.168.1.11) en vez de 10.0.2.2.
// CUANDO TENGAS DOMINIO REAL: cambia `url` a 'https://tudominio.com' y quita `cleartext`
// (que solo existe para permitir http:// en pruebas; nunca debe ir a producción).
const config: CapacitorConfig = {
  appId: 'com.aurea.petspa',
  appName: 'AUREA Pet Spa',
  webDir: 'dist',
  // .../login (no la raíz "/"): el landing es la página de venta, pensada para verse en
  // computadora como cualquier sitio de marketing — dentro de la app instalada no tiene sentido
  // (y además es pesada de animar en un WebView móvil). La app abre directo donde entra un usuario
  // que ya tiene cuenta; el botón para registrarse sigue disponible desde ahí.
  // 192.168.1.11 = IP LAN de la PC de desarrollo, para probar desde un celular real en la misma
  // red Wi-Fi (10.0.2.2 solo sirve dentro del emulador). Si cambia la IP de la PC, hay que
  // actualizar esto y volver a compilar.
  server: {
    url: 'http://192.168.1.11:5173/login',
    cleartext: true,
  },
};

export default config;
