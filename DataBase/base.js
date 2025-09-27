const API_URL = CONFIG.API_URL;
const API_KEY = CONFIG.API_KEY;
const tableBody = document.querySelector("#usersTable tbody");

// Cargar usuarios
async function loadUsers() {
  tableBody.innerHTML = "<tr><td colspan='8'>Cargando...</td></tr>";

  try {
    const res = await fetch(`${API_URL}/users`, {
      headers: { "x-api-key": API_KEY }
    });
    const users = await res.json();

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
    tableBody.innerHTML = `<tr><td colspan='8'>Error al cargar usuarios</td></tr>`;
    console.error(err);
  }
}

loadUsers();
