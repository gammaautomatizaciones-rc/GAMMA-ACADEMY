const form = document.getElementById("registerForm");
const button = form.querySelector("button");

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Bloquear botón mientras se envía
  button.disabled = true;
  button.textContent = "Registrando...";

  try {
    const response = await fetch("https://hook.us2.make.com/8kirqqq4oqoocrt8jf4l2v4ct8ofari2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (data.success) {
      alert("Registro exitoso. Ahora puedes iniciar sesión.");
      window.location.href = "login.html";
    } else {
      alert(data.message || "No se pudo registrar. Intenta de nuevo.");
      button.disabled = false;
      button.textContent = "Registrarse";
    }
  } catch (error) {
    alert("Error de conexión. Intenta de nuevo.");
    button.disabled = false;
    button.textContent = "Registrarse";
  }
});
