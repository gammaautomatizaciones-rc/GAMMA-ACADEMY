document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("https://hook.us2.make.com/4fn1teiin5a5qg764y64b93kg3mxyir5", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.premium === true) {
      window.location.href = "premium.html";
    } else {
      window.location.href = "snpago.html";
    }
  } catch (error) {
    alert("Error al conectar con el servidor. Intenta de nuevo.");
  }
});
