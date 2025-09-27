const tableBody = document.querySelector("#usersTable tbody");
const searchInput = document.getElementById("searchInput");
const exportBtn = document.getElementById("exportBtn");
let allUsers = [];

// Configuración global
const API_URL = CONFIG.API_URL;
const API_KEY = CONFIG.API_KEY;

console.log("🌍 API_URL detectada:", API_URL);

// ✅ Verificar si es admin
if (localStorage.getItem("adminAuth") !== "true") {
  const password = prompt("Ingrese contraseña de administrador:");
  if (password === "GammaAdmin") {
    localStorage.setItem("adminAuth", "true");
  } else {
    alert("Acceso denegado ❌");
    window.location.href = "login.html";
  }
}

// 📌 Renderizar usuarios
function renderUsers(users) {
  tableBody.innerHTML = "";

  if (!users || users.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='7'>No se encontraron usuarios</td></tr>";
    return;
  }

  users.forEach(user => {
    const fechaUsuario = user.created_at
      ? new Date(user.created_at).toLocaleString()
      : (user.fecha || "-");

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.id}</td>
      <td><input type="text" value="${user.nombre}" disabled></td>
      <td><input type="email" value="${user.correo}" disabled></td>
      <td>${user.plan || "-"}</td>
      <td>${user.premium ? "✅ Sí" : "❌ No"}</td>
      <td>${fechaUsuario}</td>
      <td>
        <button class="edit-btn">Editar</button>
        <button class="save-btn" style="display:none;">Guardar</button>
        <button class="delete-btn">Eliminar</button>
      </td>
    `;

    // Botones
    const editBtn = row.querySelector(".edit-btn");
    const saveBtn = row.querySelector(".save-btn");
    const deleteBtn = row.querySelector(".delete-btn");
    const nameInput = row.querySelector("td:nth-child(2) input");
    const emailInput = row.querySelector("td:nth-child(3) input");

    editBtn.addEventListener("click", () => {
      nameInput.disabled = false;
      emailInput.disabled = false;
      editBtn.style.display = "none";
      saveBtn.style.display = "inline-block";
    });

    saveBtn.addEventListener("click", async () => {
      const updatedUser = {
        nombre: nameInput.value,
        correo: emailInput.value,
        plan: user.plan
      };

      try {
        console.log("✏️ Enviando actualización de usuario:", updatedUser);
        const res = await fetch(`${API_URL}/users/${user.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "x-api-key": API_KEY
          },
          body: JSON.stringify(updatedUser)
        });

        console.log("📡 Respuesta actualización:", res.status, res.statusText);

        const result = await res.json();
        console.log("📦 Resultado actualización:", result);

        if (result.success) {
          alert("Usuario actualizado ✅");
          loadUsers();
        } else {
          alert("Error al actualizar ❌");
        }
      } catch (err) {
        console.error("❌ Error en actualización:", err);
      }
    });

    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`¿Seguro que deseas eliminar al usuario ${user.nombre}?`)) return;

      try {
        console.log("🗑️ Eliminando usuario ID:", user.id);
        const res = await fetch(`${API_URL}/users/${user.id}`, {
          method: "DELETE",
          headers: { 
            "Content-Type": "application/json",
            "x-api-key": API_KEY
          }
        });

        console.log("📡 Respuesta eliminación:", res.status, res.statusText);

        const result = await res.json();
        console.log("📦 Resultado eliminación:", result);

        if (result.success) {
          alert("Usuario eliminado ✅");
          loadUsers();
        } else {
          alert("Error al eliminar ❌");
        }
      } catch (err) {
        console.error("❌ Error en eliminación:", err);
      }
    });

    tableBody.appendChild(row);
  });
}

// 📌 Cargar usuarios
async function loadUsers() {
  tableBody.innerHTML = "<tr><td colspan='7'>Cargando...</td></tr>";

  const url = `${API_URL}/users`;
  console.log("📡 Solicitando usuarios a:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "x-api-key": API_KEY } // 👉 solo API Key
    });

    console.log("📡 Respuesta usuarios:", response.status, response.statusText);

    const text = await response.text();
    console.log("📦 Respuesta bruta:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("❌ No es JSON válido:", e.message);
      tableBody.innerHTML = "<tr><td colspan='7'>Respuesta no válida (no es JSON)</td></tr>";
      return;
    }

    console.log("✅ Datos parseados:", data);

    if (!data.success) {
      tableBody.innerHTML = "<tr><td colspan='7'>Error cargando usuarios</td></tr>";
      return;
    }

    allUsers = data.users;
    renderUsers(allUsers);

  } catch (err) {
    console.error("❌ Error en fetch /users:", err);
    tableBody.innerHTML = "<tr><td colspan='7'>Error de conexión</td></tr>";
  }
}

// 📌 Filtrar usuarios
searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredUsers = allUsers.filter(user =>
    user.nombre.toLowerCase().includes(searchText) ||
    user.correo.toLowerCase().includes(searchText)
  );
  renderUsers(filteredUsers);
});

// 📤 Exportar CSV
exportBtn.addEventListener("click", () => {
  if (allUsers.length === 0) {
    alert("No hay usuarios para exportar.");
    return;
  }

  let csv = "ID,Nombre,Email,Plan,Premium,Fecha creación\n";
  allUsers.forEach(user => {
    const fechaUsuario = user.created_at
      ? new Date(user.created_at).toLocaleString()
      : (user.fecha || "-");
    csv += `${user.id},"${user.nombre}","${user.correo}","${user.plan || "-"}","${user.premium ? "Sí" : "No"}","${fechaUsuario}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "usuarios_academia.csv";
  a.click();
  URL.revokeObjectURL(url);
});

// 🚀 Inicializar
loadUsers();
setInterval(loadUsers, 10000);

