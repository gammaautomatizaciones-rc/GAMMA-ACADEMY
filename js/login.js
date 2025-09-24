const form = document.getElementById("loginForm");
const button = form.querySelector("button");

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Bloquear botón
  button.disabled = true;
  button.textContent = "Validando...";

  try {
    const response = await fetch("https://hook.integromat.com/TU_WEBHOOK_LOGIN", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.premium === true) {
      window.location.href = "premium.html";
    } else if (data.error) {
      alert(data.message || "Credenciales inválidas");
      button.disabled = false;
      button.textContent = "Iniciar Sesión";
    } else {
      window.location.href = "snpago.html";
    }
  } catch (error) {
    alert("Error al conectar con el servidor. Intenta de nuevo.");
    button.disabled = false;
    button.textContent = "Iniciar Sesión";
  }
});
