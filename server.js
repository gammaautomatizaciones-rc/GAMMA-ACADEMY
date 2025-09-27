/**
 * server.js con logs usando Winston (mejorado con colores y más detalle)
 */

import express from "express";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();

const app = express();
app.use(express.json());

// -------------------- LOGGER --------------------
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize({ all: true }), // 🎨 Colores
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "server.log" })
  ]
});

// -------------------- CONFIG --------------------
const API_KEY = process.env.API_KEY || "9847261594038275641029384756";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.split(",")) || [
  "http://localhost:5500",
  "http://localhost:3000",
  "http://localhost",
  "https://gammaautomatizaciones-rc.github.io"
];

// -------------------- MIDDLEWARE GLOBAL LOGS --------------------
app.use((req, res, next) => {
  const start = Date.now();
  logger.info(`➡️ Request: ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`⬅️ Response: ${req.method} ${req.originalUrl} | Status=${res.statusCode} | ⏱️ ${duration}ms`);
  });
  next();
});

// Middleware CORS
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      logger.info(`✅ CORS permitido: ${origin}`);
      return callback(null, true);
    } else {
      logger.warn(`🚫 CORS bloqueado: ${origin}`);
      return callback(new Error('CORS - Origin not allowed: ' + origin), false);
    }
  }
}));

// Middleware API Key
app.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (!key || key !== API_KEY) {
    logger.warn(`🔑 API KEY inválida para ${req.method} ${req.url}`);
    return res.status(403).json({ success: false, message: "Acceso denegado. API key inválida." });
  }
  logger.info(`🔑 API KEY válida para ${req.method} ${req.url}`);
  next();
});

// -------------------- MySQL --------------------
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gamma_academy",
  multipleStatements: false
});

db.connect(err => {
  if (err) {
    logger.error("❌ Error conectando a MySQL: " + err.message);
    process.exit(1);
  }
  logger.info("🟢 Conectado a MySQL");
});

// -------------------- RUTAS --------------------

// Healthcheck
app.get("/health", (req, res) => {
  logger.info("💓 GET /health");
  res.json({ success: true, msg: "OK" });
});

// Registro
app.post("/register", async (req, res) => {
  logger.info("📝 POST /register " + JSON.stringify(req.body));
  try {
    const { correo, contrasena, nombre, fecha } = req.body;

    if (!correo || !contrasena || !nombre || !fecha) {
      logger.warn("⚠️ Registro fallido: faltan campos");
      return res.status(400).json({ success: false, message: "Faltan campos requeridos" });
    }

    db.query("SELECT id FROM academia WHERE correo = ?", [correo], async (err, results) => {
      if (err) {
        logger.error("❌ DB SELECT error: " + err.message);
        return res.status(500).json({ success: false, message: "Error DB" });
      }
      if (results && results.length > 0) {
        logger.warn(`⚠️ Registro fallido: correo ya existe (${correo})`);
        return res.json({ success: false, message: "El email ya está registrado" });
      }

      const hashed = await bcrypt.hash(contrasena, 10);
      const sql = `INSERT INTO academia (correo, premium, contrasena, nombre, plan, fecha) VALUES (?, ?, ?, ?, ?, ?)`;
      const params = [correo, 0, hashed, nombre, "Sin plan", fecha];

      db.query(sql, params, (err2, result) => {
        if (err2) {
          logger.error("❌ DB INSERT error: " + err2.message);
          return res.status(500).json({ success: false, message: "Error al crear usuario" });
        }
        logger.info(`✅ Usuario registrado ID=${result.insertId}, correo=${correo}`);
        return res.json({ success: true, id: result.insertId });
      });
    });

  } catch (error) {
    logger.error("❌ Error en /register: " + error.message);
    res.status(500).json({ success: false, message: "Error servidor" });
  }
});

// Login
app.post("/login", (req, res) => {
  logger.info("🔐 POST /login " + JSON.stringify(req.body));
  const { correo, contrasena } = req.body;
  if (!correo || !contrasena) {
    logger.warn("⚠️ Login fallido: faltan campos");
    return res.status(400).json({ success: false, message: "Faltan campos" });
  }

  db.query("SELECT * FROM academia WHERE correo = ?", [correo], async (err, results) => {
    if (err) {
      logger.error("❌ DB SELECT error: " + err.message);
      return res.status(500).json({ success: false, message: "Error DB" });
    }
    if (!results || results.length === 0) {
      logger.warn(`⚠️ Login fallido: usuario no encontrado (${correo})`);
      return res.json({ success: false, message: "Credenciales inválidas" });
    }

    const user = results[0];
    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) {
      logger.warn(`⚠️ Login fallido: contraseña incorrecta (${correo})`);
      return res.json({ success: false, message: "Credenciales inválidas" });
    }

    logger.info(`✅ Login exitoso: ${correo}, premium=${user.premium}`);
    return res.json({
      success: true,
      premium: Boolean(user.premium),
      nombre: user.nombre,
      correo: user.correo
    });
  });
});

// Listar usuarios
app.get("/users", (req, res) => {
  logger.info("📋 GET /users");
  db.query("SELECT id, correo, premium, nombre, plan, fecha, created_at FROM academia ORDER BY id DESC", (err, results) => {
    if (err) {
      logger.error("❌ DB SELECT users error: " + err.message);
      return res.status(500).json({ success: false, message: "Error al obtener usuarios" });
    }
    logger.info(`📊 Usuarios obtenidos: ${results.length} registros`);
    res.json({ success: true, users: results });
  });
});

// Actualizar usuario
app.put("/users/:id", (req, res) => {
  logger.info(`✏️ PUT /users/${req.params.id} ` + JSON.stringify(req.body));
  const { id } = req.params;
  const { nombre, correo, plan } = req.body;

  if (!nombre || !correo) {
    logger.warn(`⚠️ Update fallido: faltan campos en usuario ${id}`);
    return res.status(400).json({ success: false, message: "Faltan campos" });
  }

  db.query("UPDATE academia SET nombre = ?, correo = ?, plan = ? WHERE id = ?", [nombre, correo, plan || "Mensual", id], (err) => {
    if (err) {
      logger.error("❌ DB UPDATE error: " + err.message);
      return res.status(500).json({ success: false, message: "Error al actualizar usuario" });
    }
    logger.info(`✅ Usuario actualizado ID=${id}`);
    res.json({ success: true });
  });
});

// Eliminar usuario
app.delete("/users/:id", (req, res) => {
  logger.info(`🗑️ DELETE /users/${req.params.id}`);
  const { id } = req.params;
  db.query("DELETE FROM academia WHERE id = ?", [id], (err) => {
    if (err) {
      logger.error("❌ DB DELETE error: " + err.message);
      return res.status(500).json({ success: false, message: "Error al eliminar usuario" });
    }
    logger.info(`✅ Usuario eliminado ID=${id}`);
    res.json({ success: true });
  });
});

// Set Premium
app.post("/set-premium", (req, res) => {
  logger.info("💎 POST /set-premium " + JSON.stringify(req.body));
  const { correo } = req.body;
  if (!correo) {
    logger.warn("⚠️ Set-premium fallido: falta correo");
    return res.status(400).json({ success: false, message: "Falta correo" });
  }

  db.query("UPDATE academia SET premium = 1 WHERE correo = ?", [correo], (err, result) => {
    if (err) {
      logger.error("❌ DB UPDATE premium error: " + err.message);
      return res.status(500).json({ success: false, message: "Error DB" });
    }
    if (result.affectedRows === 0) {
      logger.warn(`⚠️ Set-premium fallido: usuario no encontrado (${correo})`);
      return res.json({ success: false, message: "Usuario no encontrado" });
    }
    logger.info(`✅ Usuario marcado como premium: ${correo}`);
    res.json({ success: true });
  });
});

// -------------------- SERVER START --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`🔑 API Key requerida en header: x-api-key`);
});


