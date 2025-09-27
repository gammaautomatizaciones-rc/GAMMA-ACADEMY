// Detecta si estamos en localhost
const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

// Si el frontend está en GitHub Pages, automáticamente usa la URL de ngrok
// 👉 reemplazá por tu dominio actual de ngrok
const NGROK_URL = "https://d8db879091f5.ngrok-free.app"; 

const CONFIG = {
  API_URL: isLocal 
    ? "http://localhost:3000"   // cuando lo corrés local
    : NGROK_URL,                // cuando lo usás desde GitHub Pages u otro dominio
  API_KEY: "9847261594038275641029384756"
};

console.log("🌍 Configuración cargada:", CONFIG);
