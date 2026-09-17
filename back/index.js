const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { getConnectionUrl, getUserDetails, verifyIdToken } = require('./auth');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_proa_jwt_2026_auth';

// Configuración de la conexión MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'proa',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Roles del sistema (según bdd.sql: 1 = Alumno, 2 = Docente, 3 = Administrador)
const ROLES = {
  ALUMNO: 1,
  DOCENTE: 2,
  ADMINISTRADOR: 3,
};

const ESTADOS_CUENTA = {
  PENDIENTE: 1,
  ACTIVO: 2,
  RECHAZADO: 3,
  SUSPENDIDO: 4,
};

/**
 * Busca o crea un usuario en la tabla `Cuenta` a partir de sus datos de Google
 */
async function findOrCreateGoogleUser({ googleId, email, name, picture }) {
  const nombreFinal = name || email.split('@')[0];
  try {
    // Buscar si ya existe la cuenta por correo o por oauthID
    const [rows] = await pool.query(
      `SELECT c.ID, c.NombreApellido, c.correo, c.proveedorOAuth, c.oauthID, c.rolID, c.estadoCuentaID,
              r.Nombre AS rolNombre
       FROM Cuenta c
       LEFT JOIN Rol r ON c.rolID = r.ID
       WHERE c.correo = ? OR (c.proveedorOAuth = 'google' AND c.oauthID = ?)`,
      [email, googleId]
    );

    if (rows && rows.length > 0) {
      const user = rows[0];
      // Si existía por correo pero sin oauthID de Google, vincularlo
      if (user.proveedorOAuth !== 'google' || user.oauthID !== googleId) {
        await pool.query(
          `UPDATE Cuenta SET proveedorOAuth = 'google', oauthID = ? WHERE ID = ?`,
          [googleId, user.ID]
        );
      }
      return {
        id: user.ID,
        name: user.NombreApellido,
        email: user.correo,
        roleId: user.rolID,
        role: user.rolNombre || 'Alumno',
        picture: picture || null,
        estadoCuentaId: user.estadoCuentaID,
      };
    }

    // Si no existe, crear la cuenta como Alumno y Activo
    const [insertResult] = await pool.query(
      `INSERT INTO Cuenta (NombreApellido, correo, proveedorOAuth, oauthID, rolID, estadoCuentaID)
       VALUES (?, ?, 'google', ?, ?, ?)`,
      [nombreFinal, email, googleId, ROLES.ALUMNO, ESTADOS_CUENTA.ACTIVO]
    );

    return {
      id: insertResult.insertId,
      name: nombreFinal,
      email: email,
      roleId: ROLES.ALUMNO,
      role: 'Alumno',
      picture: picture || null,
      estadoCuentaId: ESTADOS_CUENTA.ACTIVO,
    };
  } catch (error) {
    console.warn('Base de datos no disponible o error al consultar Cuenta (modo fallback):', error.message);
    // Retornamos los datos del usuario autenticado para no bloquear el frontend si la BD local aún no fue inicializada
    return {
      id: googleId,
      name: nombreFinal,
      email: email,
      roleId: ROLES.ALUMNO,
      role: 'Alumno',
      picture: picture || null,
      estadoCuentaId: ESTADOS_CUENTA.ACTIVO,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// RUTAS DE AUTENTICACIÓN GOOGLE
// ─────────────────────────────────────────────────────────────

/**
 * 1. Redirige al consentimiento de Google OAuth
 *    o responde { url } si se pide por JSON
 */
app.get('/auth/google', (req, res) => {
  try {
    const url = getConnectionUrl();
    if (req.query.json === 'true') {
      return res.json({ url });
    }
    res.redirect(url);
  } catch (error) {
    console.error('Error generando URL de OAuth:', error);
    res.status(500).json({ error: 'No se pudo iniciar el flujo de Google OAuth' });
  }
});

/**
 * 2. Callback de Google OAuth (cuando Google redirige al backend)
 */
app.get('/oauth2callback', async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error) {
    console.error('Error reportado por Google OAuth:', error);
    return res.redirect(`${frontendUrl}/?login_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/?login_error=missing_code`);
  }

  try {
    const userInfo = await getUserDetails(code);
    const user = await findOrCreateGoogleUser({
      googleId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    });

    const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: '7d' });
    const userJson = encodeURIComponent(JSON.stringify(user));

    return res.redirect(`${frontendUrl}/?login_success=true&token=${token}&user=${userJson}`);
  } catch (err) {
    console.error('Error en /oauth2callback:', err);
    return res.redirect(`${frontendUrl}/?login_error=auth_failed`);
  }
});

/**
 * 3. Endpoint para Google Identity Services (GIS)
 *    El frontend obtiene el ID Token directo de Google y lo envía aquí para verificarlo
 */
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: 'Credencial de Google no recibida.' });
  }

  try {
    const payload = await verifyIdToken(credential);
    const user = await findOrCreateGoogleUser({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });

    const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error('Error verificando token de Google en /api/auth/google:', error);
    res.status(401).json({ error: 'Credencial de Google inválida o expirada.' });
  }
});

/**
 * 4. Endpoint para obtener datos del usuario actual a partir del token JWT
 */
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded.user });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
});

// ─────────────────────────────────────────────────────────────
// RUTAS EXISTENTES DE LA APLICACIÓN
// ─────────────────────────────────────────────────────────────

app.get('/novedades', async (req, res) => {
  try {
    const query = `
      SELECT n.ID, n.titulo, n.cuerpo, n.imagen, n.cuentaID, n.fecha_publicacion, n.asignaturaID, n.estadoID, n.comentarioAdmin, n.fechaDeCreacion 
      FROM Novedad n
      ORDER BY n.fechaDeCreacion DESC;
    `;
    const [results] = await pool.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/eventos', async (req, res) => {
  try {
    const query = `
      SELECT e.ID, e.titulo, e.cuerpo, e.cuentaID, e.fecha_publicacion, e.acceso, e.asignaturaID, e.estadoID, e.comentarioAdmin, e.fechaDeCreacion 
      FROM Evento e
      ORDER BY e.fechaDeCreacion DESC;
    `;
    const [results] = await pool.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/material', async (req, res) => {
  try {
    const query = `
      SELECT m.ID, m.Titulo, m.descripcion, m.archivo, m.cuentaID, m.fecha_publicacion, m.asignaturaID, m.clasificacionID, m.estadoID, m.fechaDeCreacion 
      FROM Material m
      ORDER BY m.fechaDeCreacion DESC;
    `;
    const [results] = await pool.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend de Escuela PRoA corriendo en http://localhost:${PORT}`);
  console.log(`OAuth Callback esperado en: ${process.env.GOOGLE_REDIRECT || 'http://localhost:3000/oauth2callback'}`);
});