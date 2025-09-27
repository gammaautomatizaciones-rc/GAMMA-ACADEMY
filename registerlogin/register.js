// register.js
const form = document.getElementById("registerForm");
const button = form.querySelector("button");
const message = document.getElementById("message");

const API_URL = CONFIG.API_URL;
const API_KEY = CONFIG.API_KEY;

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  message.textContent = "";
  button.disabled = true;
  button.textContent = "Registrando...";

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({
        correo: document.getElementById("email").value,
        contrasena: document.getElementById("password").value,
        nombre: document.getElementById("name").value,
        fecha: new Date().toISOString().split("T")[0] // YYYY-MM-DD
      })
    });

    const data = await response.json();

    if (data.success) {
      message.style.color = "#2ecc71";
      message.textContent = "Registro exitoso. Ahora puedes iniciar sesión.";
      setTimeout(() => window.location.href = "login.html", 1500);
    } else {
      message.style.color = "#e74c3c";
      message.textContent = data.message || "No se pudo registrar. Intenta de nuevo.";
      button.disabled = false;
      button.textContent = "Registrarse";
    }
  } catch (error) {
    message.style.color = "#e74c3c";
    message.textContent = "Error de conexión. Intenta de nuevo.";
    button.disabled = false;
    button.textContent = "Registrarse";
  }
});
