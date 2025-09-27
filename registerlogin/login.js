// login.js
const form = document.getElementById("loginForm");
const button = form.querySelector("button");
const message = document.getElementById("message");

const API_URL = CONFIG.API_URL;
const API_KEY = CONFIG.API_KEY;

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  message.textContent = "";
  button.disabled = true;
  button.textContent = "Validando...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({
        action: "login", // 👈 indicador para Make
        correo: document.getElementById("email").value,
        contrasena: document.getElementById("password").value
      })
    });

    const data = await response.json();

    if (!data.success) {
      message.style.color = "#e74c3c";
      message.textContent = data.message || "Credenciales inválidas";
      button.disabled = false;
      button.textContent = "Iniciar Sesión";
      return;
    }

    // Guardar email en localStorage
    localStorage.setItem("userEmail", data.correo);

    // Redirección según premium
    if (data.premium === true) {
      window.location.href = "../premium.html";
    } else {
      window.location.href = "../snpago.html";
    }

  } catch (error) {
    console.error("❌ Error en login:", error);
    message.style.color = "#e74c3c";
    message.textContent = "Error al conectar con el servidor.";
    button.disabled = false;
    button.textContent = "Iniciar Sesión";
  }
});

