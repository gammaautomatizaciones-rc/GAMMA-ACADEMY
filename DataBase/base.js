const API_URL = CONFIG.API_URL;
const API_KEY = CONFIG.API_KEY;
const tableBody = document.querySelector("#usersTable tbody");
const refreshBtn = document.getElementById("refreshBtn");

// Cargar usuarios
async function loadUsers() {
  tableBody.innerHTML = "<tr><td colspan='8'>Cargando...</td></tr>";

  try {
    const res = await fetch(`${API_URL}/users`, {
      headers: { "x-api-key": API_KEY }
    });

    console.log("🔎 Status de respuesta:", res.status);

    const text = await res.text();
    console.log("🔎 Respuesta cruda:", text);

    let users;
    try {
      users = JSON.parse(text);
    } catch (err) {
      console.error("❌ No se pudo parsear JSON:", err);
      tableBody.innerHTML = `<tr><td colspan='8'>Respuesta inválida (no es JSON)</td></tr>`;
      return;
    }

    // Renderizado de usuarios
    tableBody.innerHTML = "";
    users.forEach(user => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.correo}</td>
        <td>${user.nombre}</td>
        <td>${user.plan}</td>
        <td>${user.premium ? "✅" : "❌"}</td>
        <td>${user.fecha || ""}</td>
        <td>${user.created_at || ""}</td>
        <td>${user.updated_at || ""}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Error al conectar con el servidor:", err);
    tableBody.innerHTML = `<tr><td colspan='8'>Error de conexión</td></tr>`;
  }
}

refreshBtn.addEventListener("click", loadUsers);
loadUsers();
