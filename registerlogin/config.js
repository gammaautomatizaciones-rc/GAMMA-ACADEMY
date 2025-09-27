// Detecta si estamos en local (127.0.0.1 o localhost)
const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

// Configuración automática
const CONFIG = {
  API_URL: isLocal 
    ? "http://localhost:3000"  // 👉 backend local
    : "https://mi-servidor.com", // 👉 tu dominio / ngrok / VPS en producción
  API_KEY: "9847261594038275641029384756" // misma clave que en .env
};

console.log("🌍 Configuración cargada:", CONFIG);
