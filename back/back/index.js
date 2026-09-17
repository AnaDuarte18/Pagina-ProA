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

// ─────────────────────────────────────────────────────────────
// CONSTANTES DEL SISTEMA
// Deben coincidir con el orden de INSERT en bdd.sql:
//   Rol: Administrador(1), Docente(2), Alumno(3)
//   estadoCuenta: Pendiente(1), Activo(2), Rechazado(3), Suspendido(4)
// ─────────────────────────────────────────────────────────────

const ROLES = {
  ADMINISTRADOR: 1,
  DOCENTE: 2,
  ALUMNO: 3,
};

const ESTADOS_CUENTA = {
  PENDIENTE: 1,
  ACTIVO: 2,
  RECHAZADO: 3,
  SUSPENDIDO: 4,
};

// Dominio institucional — login automáticamente ACTIVO
const DOMINIO_INSTITUCIONAL = '@escuelasproa.edu.ar';

// Estados de contenido (Estado table): Pendiente(1), Devuelto(2), Publicado(3), Eliminado(4)
const ESTADOS_CONTENIDO = {
  PENDIENTE: 1,
  DEVUELTO: 2,
  PUBLICADO: 3,
  ELIMINADO: 4,
};

// Tipos de notificación: Aprobación(1), Devolución(2), Eliminación(3), Nueva publicación(4)
const TIPOS_NOTIFICACION = {
  APROBACION: 1,
  DEVOLUCION: 2,
  ELIMINACION: 3,
  NUEVA_PUBLICACION: 4,
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Determina el estado inicial de la cuenta según el dominio del correo.
 * @escuelasproa.edu.ar → ACTIVO automáticamente.
 * Correo externo       → PENDIENTE hasta aprobación del admin.
 */
function calcularEstadoInicial(email) {
  return email.toLowerCase().endsWith(DOMINIO_INSTITUCIONAL)
    ? ESTADOS_CUENTA.ACTIVO
    : ESTADOS_CUENTA.PENDIENTE;
}

/**
 * Busca o crea un usuario en la tabla `Cuenta` a partir de sus datos de Google.
 * Lógica de estado inicial:
 *   - @escuelasproa.edu.ar → ACTIVO
 *   - correo externo       → PENDIENTE (requiere aprobación del admin)
 */
async function findOrCreateGoogleUser({ googleId, email, name, picture }) {
  const nombreFinal = name || email.split('@')[0];
  const estadoInicial = calcularEstadoInicial(email);

  try {
    // Buscar por oauthID (más confiable que el correo)
    const [rows] = await pool.query(
      `SELECT c.ID, c.NombreApellido, c.correo, c.proveedorOAuth, c.oauthID,
              c.rolID, c.estadoCuentaID, c.solicitudDocente,
              r.Nombre AS rolNombre
       FROM Cuenta c
       LEFT JOIN Rol r ON c.rolID = r.ID
       WHERE c.proveedorOAuth = 'google' AND c.oauthID = ?`,
      [googleId]
    );

    if (rows && rows.length > 0) {
      const user = rows[0];
      return {
        id: user.ID,
        name: user.NombreApellido,
        email: user.correo,
        roleId: user.rolID,
        role: user.rolNombre || 'Alumno',
        picture: picture || null,
        estadoCuentaId: user.estadoCuentaID,
        solicitudDocente: !!user.solicitudDocente,
      };
    }

    // No existe → crear con estado según dominio del correo
    const [insertResult] = await pool.query(
      `INSERT INTO Cuenta (NombreApellido, correo, proveedorOAuth, oauthID, rolID, estadoCuentaID, solicitudDocente)
       VALUES (?, ?, 'google', ?, ?, ?, 0)`,
      [nombreFinal, email, googleId, ROLES.ALUMNO, estadoInicial]
    );

    console.log(
      `[Auth] Nueva cuenta: ${email} | Estado: ${estadoInicial === ESTADOS_CUENTA.ACTIVO ? 'ACTIVO' : 'PENDIENTE'}`
    );

    return {
      id: insertResult.insertId,
      name: nombreFinal,
      email,
      roleId: ROLES.ALUMNO,
      role: 'Alumno',
      picture: picture || null,
      estadoCuentaId: estadoInicial,
      solicitudDocente: false,
    };
  } catch (error) {
    console.warn('[Auth] BD no disponible (fallback):', error.message);
    // Fallback: aplicar la misma lógica de dominio para no bloquear el login
    return {
      id: googleId,
      name: nombreFinal,
      email,
      roleId: ROLES.ALUMNO,
      role: 'Alumno',
      picture: picture || null,
      estadoCuentaId: estadoInicial,
      solicitudDocente: false,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN
// ─────────────────────────────────────────────────────────────

/**
 * Verifica que el request tenga un JWT válido.
 * Pone el payload en `req.userJwt`.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userJwt = decoded.user;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

/**
 * Verifica que la cuenta esté ACTIVA y tenga uno de los roles permitidos.
 * Hace un lookup fresco en la BD para evitar datos desactualizados del JWT.
 * Pone los datos actualizados de la cuenta en `req.cuenta`.
 */
function requireRole(...rolesPermitidos) {
  return async (req, res, next) => {
    try {
      const [rows] = await pool.query(
        `SELECT c.ID, c.rolID, c.estadoCuentaID, r.Nombre AS rolNombre
         FROM Cuenta c
         LEFT JOIN Rol r ON c.rolID = r.ID
         WHERE c.ID = ?`,
        [req.userJwt.id]
      );

      if (!rows || rows.length === 0) {
        return res.status(403).json({ error: 'Cuenta no encontrada.' });
      }

      const cuenta = rows[0];

      if (cuenta.estadoCuentaID !== ESTADOS_CUENTA.ACTIVO) {
        return res.status(403).json({ error: 'Cuenta no activa.' });
      }

      if (!rolesPermitidos.includes(cuenta.rolID)) {
        return res.status(403).json({ error: 'Sin permisos suficientes.' });
      }

      req.cuenta = cuenta;
      next();
    } catch (err) {
      console.error('[requireRole] Error:', err);
      res.status(500).json({ error: 'Error al verificar permisos.' });
    }
  };
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
    console.error('[Auth] Error generando URL de OAuth:', error);
    res.status(500).json({ error: 'No se pudo iniciar el flujo de Google OAuth.' });
  }
});

/**
 * 2. Callback de Google OAuth (cuando Google redirige al backend)
 */
app.get('/oauth2callback', async (req, res) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error) {
    console.error('[Auth] Error reportado por Google OAuth:', error);
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
    console.error('[Auth] Error en /oauth2callback:', err);
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
    console.error('[Auth] Error verificando token en /api/auth/google:', error);
    res.status(401).json({ error: 'Credencial de Google inválida o expirada.' });
  }
});

/**
 * 4. Devuelve datos frescos del usuario actual desde la BD (no solo el JWT)
 */
app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.ID, c.NombreApellido, c.correo, c.rolID, r.Nombre AS rolNombre,
              c.estadoCuentaID, c.solicitudDocente
       FROM Cuenta c
       LEFT JOIN Rol r ON c.rolID = r.ID
       WHERE c.ID = ?`,
      [req.userJwt.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const u = rows[0];
    res.json({
      user: {
        id: u.ID,
        name: u.NombreApellido,
        email: u.correo,
        roleId: u.rolID,
        role: u.rolNombre,
        estadoCuentaId: u.estadoCuentaID,
        solicitudDocente: !!u.solicitudDocente,
      },
    });
  } catch (err) {
    console.error('[Auth] Error en /api/auth/me:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// RUTAS DE ADMINISTRACIÓN DE CUENTAS
// ─────────────────────────────────────────────────────────────

/**
 * GET /cuentas
 * Solo Admin. Lista todas las cuentas.
 * Query params opcionales: ?rolID=X&estadoCuentaID=Y
 */
app.get('/cuentas', requireAuth, requireRole(ROLES.ADMINISTRADOR), async (req, res) => {
  try {
    const { rolID, estadoCuentaID } = req.query;
    const params = [];
    const condiciones = [];

    if (rolID) {
      condiciones.push('c.rolID = ?');
      params.push(parseInt(rolID));
    }

    if (estadoCuentaID) {
      condiciones.push('c.estadoCuentaID = ?');
      params.push(parseInt(estadoCuentaID));
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT c.ID, c.NombreApellido, c.correo, c.rolID, r.Nombre AS rolNombre,
              c.estadoCuentaID, ec.estado AS estadoCuenta, c.solicitudDocente
       FROM Cuenta c
       LEFT JOIN Rol r ON c.rolID = r.ID
       LEFT JOIN estadoCuenta ec ON c.estadoCuentaID = ec.ID
       ${whereClause}
       ORDER BY c.ID DESC`,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error('[Cuentas] Error en GET /cuentas:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /cuentas/:id
 * Solo Admin. Devuelve el detalle de una cuenta.
 */
app.get('/cuentas/:id', requireAuth, requireRole(ROLES.ADMINISTRADOR), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.ID, c.NombreApellido, c.correo, c.rolID, r.Nombre AS rolNombre,
              c.estadoCuentaID, ec.estado AS estadoCuenta, c.solicitudDocente
       FROM Cuenta c
       LEFT JOIN Rol r ON c.rolID = r.ID
       LEFT JOIN estadoCuenta ec ON c.estadoCuentaID = ec.ID
       WHERE c.ID = ?`,
      [req.params.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('[Cuentas] Error en GET /cuentas/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /cuentas/:id/estado
 * Solo Admin. Cambia el estado de una cuenta.
 * Body: { estadoCuentaID: number, rolID?: number }
 * El campo rolID es opcional: permite asignar el rol directamente al aprobar.
 */
app.patch('/cuentas/:id/estado', requireAuth, requireRole(ROLES.ADMINISTRADOR), async (req, res) => {
  const { estadoCuentaID, rolID } = req.body;

  if (!estadoCuentaID) {
    return res.status(400).json({ error: 'estadoCuentaID es requerido.' });
  }

  const estadosValidos = Object.values(ESTADOS_CUENTA);
  if (!estadosValidos.includes(parseInt(estadoCuentaID))) {
    return res.status(400).json({ error: `estadoCuentaID inválido. Válidos: ${estadosValidos.join(', ')}` });
  }

  try {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Leer valores actuales para el historial
      const [[cuentaActual]] = await conn.query(
        `SELECT c.rolID, c.estadoCuentaID,
                r.Nombre AS rolNombre, ec.estado AS estadoNombre
         FROM Cuenta c
         LEFT JOIN Rol r ON c.rolID = r.ID
         LEFT JOIN estadoCuenta ec ON c.estadoCuentaID = ec.ID
         WHERE c.ID = ?`,
        [req.params.id]
      );

      if (!cuentaActual) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ error: 'Cuenta no encontrada.' });
      }

      const campos = ['estadoCuentaID = ?'];
      const params = [estadoCuentaID];

      if (rolID !== undefined) {
        const rolesValidos = Object.values(ROLES);
        if (!rolesValidos.includes(parseInt(rolID))) {
          await conn.rollback();
          conn.release();
          return res.status(400).json({ error: `rolID inválido. Válidos: ${rolesValidos.join(', ')}` });
        }
        campos.push('rolID = ?');
        params.push(rolID);
      }

      if (parseInt(estadoCuentaID) === ESTADOS_CUENTA.ACTIVO && parseInt(rolID) === ROLES.DOCENTE) {
        campos.push('solicitudDocente = 0');
      }

      params.push(req.params.id);
      await conn.query(`UPDATE Cuenta SET ${campos.join(', ')} WHERE ID = ?`, params);

      // Registrar historial de estado
      const [[nuevoEstado]] = await conn.query(
        'SELECT estado FROM estadoCuenta WHERE ID = ?', [estadoCuentaID]
      );
      await registrarHistorialCuenta(conn, {
        cuentaID: parseInt(req.params.id),
        realizadoPorID: req.userJwt.id,
        campo: 'estado',
        valorAnterior: cuentaActual.estadoNombre,
        valorNuevo: nuevoEstado?.estado ?? String(estadoCuentaID),
      });

      // Registrar historial de rol si también cambió
      if (rolID !== undefined && parseInt(rolID) !== cuentaActual.rolID) {
        const [[nuevoRol]] = await conn.query(
          'SELECT Nombre FROM Rol WHERE ID = ?', [rolID]
        );
        await registrarHistorialCuenta(conn, {
          cuentaID: parseInt(req.params.id),
          realizadoPorID: req.userJwt.id,
          campo: 'rol',
          valorAnterior: cuentaActual.rolNombre,
          valorNuevo: nuevoRol?.Nombre ?? String(rolID),
        });
      }

      await conn.commit();
      res.json({ message: 'Estado actualizado correctamente.' });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('[Cuentas] Error en PATCH /cuentas/:id/estado:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /cuentas/:id/rol
 * Solo Admin. Cambia el rol de una cuenta directamente.
 * Body: { rolID: number }
 */
app.patch('/cuentas/:id/rol', requireAuth, requireRole(ROLES.ADMINISTRADOR), async (req, res) => {
  const { rolID } = req.body;

  if (!rolID) {
    return res.status(400).json({ error: 'rolID es requerido.' });
  }

  const rolesValidos = Object.values(ROLES);
  if (!rolesValidos.includes(parseInt(rolID))) {
    return res.status(400).json({ error: `rolID inválido. Válidos: ${rolesValidos.join(', ')}` });
  }

  try {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Leer rol actual para el historial
      const [[cuentaActual]] = await conn.query(
        'SELECT c.rolID, r.Nombre AS rolNombre FROM Cuenta c LEFT JOIN Rol r ON c.rolID = r.ID WHERE c.ID = ?',
        [req.params.id]
      );

      if (!cuentaActual) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ error: 'Cuenta no encontrada.' });
      }

      const campos = ['rolID = ?'];
      if (parseInt(rolID) === ROLES.DOCENTE) {
        campos.push('solicitudDocente = 0');
      }

      await conn.query(
        `UPDATE Cuenta SET ${campos.join(', ')} WHERE ID = ?`,
        [rolID, req.params.id]
      );

      const [[nuevoRol]] = await conn.query('SELECT Nombre FROM Rol WHERE ID = ?', [rolID]);
      await registrarHistorialCuenta(conn, {
        cuentaID: parseInt(req.params.id),
        realizadoPorID: req.userJwt.id,
        campo: 'rol',
        valorAnterior: cuentaActual.rolNombre,
        valorNuevo: nuevoRol?.Nombre ?? String(rolID),
      });

      await conn.commit();
      res.json({ message: 'Rol actualizado correctamente.' });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('[Cuentas] Error en PATCH /cuentas/:id/rol:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /cuentas/:id/solicitar-docente
 * Usuario autenticado y activo. Solicita cambio de rol a Docente.
 * Solo el propio usuario puede solicitarlo.
 */
app.post('/cuentas/:id/solicitar-docente', requireAuth, async (req, res) => {
  const cuentaId = parseInt(req.params.id);

  if (cuentaId !== req.userJwt.id) {
    return res.status(403).json({ error: 'Solo podés solicitar el cambio para tu propia cuenta.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT ID, estadoCuentaID, rolID, solicitudDocente FROM Cuenta WHERE ID = ?',
      [cuentaId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    const cuenta = rows[0];

    if (cuenta.estadoCuentaID !== ESTADOS_CUENTA.ACTIVO) {
      return res.status(403).json({ error: 'Tu cuenta debe estar activa para solicitar cambio de rol.' });
    }

    if (cuenta.rolID === ROLES.DOCENTE) {
      return res.status(400).json({ error: 'Tu cuenta ya tiene el rol Docente.' });
    }

    if (cuenta.solicitudDocente) {
      return res.status(400).json({ error: 'Ya tenés una solicitud pendiente de aprobación.' });
    }

    await pool.query('UPDATE Cuenta SET solicitudDocente = 1 WHERE ID = ?', [cuentaId]);

    res.json({ message: 'Solicitud enviada. El administrador la revisará a la brevedad.' });
  } catch (err) {
    console.error('[Cuentas] Error en POST /cuentas/:id/solicitar-docente:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// HELPER — HISTORIAL DE CUENTA
// ─────────────────────────────────────────────────────────────

/**
 * Registra un movimiento en HistorialCuenta.
 * @param {object} conn   - Conexión del pool (para usar dentro de transacciones)
 * @param {object} params
 *   cuentaID       — ID de la cuenta afectada
 *   realizadoPorID — ID del admin/usuario que hizo el cambio
 *   campo          — 'rol' | 'estado' | 'curso'
 *   valorAnterior  — valor legible antes del cambio
 *   valorNuevo     — valor legible después del cambio
 *   comentario     — opcional
 */
async function registrarHistorialCuenta(conn, { cuentaID, realizadoPorID, campo, valorAnterior, valorNuevo, comentario = null }) {
  await conn.query(
    `INSERT INTO HistorialCuenta (cuentaID, realizadoPorID, campo, valorAnterior, valorNuevo, comentario)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [cuentaID, realizadoPorID, campo, valorAnterior ?? null, valorNuevo ?? null, comentario]
  );
}

// ─────────────────────────────────────────────────────────────
// RUTAS DE CURSOS
// ─────────────────────────────────────────────────────────────

/**
 * GET /cursos
 * Todos los usuarios autenticados. Lista los cursos disponibles.
 */
app.get('/cursos', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ID, anio, division FROM Curso ORDER BY anio ASC, division ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('[Cursos] Error en GET /cursos:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /cuentas/:id/curso
 * Devuelve el curso ACTUAL del alumno (fechaHasta IS NULL).
 * Accesible por el propio usuario o el admin.
 */
app.get('/cuentas/:id/curso', requireAuth, async (req, res) => {
  const cuentaId = parseInt(req.params.id);
  const esAdmin = req.userJwt.roleId === ROLES.ADMINISTRADOR;
  const esPropietario = req.userJwt.id === cuentaId;

  if (!esAdmin && !esPropietario) {
    return res.status(403).json({ error: 'Sin permisos suficientes.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT ac.ID, ac.CursoID, c.anio, c.division, ac.anioInicio, ac.fechaDesde, ac.fechaHasta
       FROM AlumnoCurso ac
       JOIN Alumno a ON ac.AlumnoID = a.ID
       JOIN Curso c ON ac.CursoID = c.ID
       WHERE a.cuentaID = ? AND ac.fechaHasta IS NULL
       ORDER BY ac.ID DESC
       LIMIT 1`,
      [cuentaId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Este usuario no tiene curso asignado.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('[Cursos] Error en GET /cuentas/:id/curso:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /cuentas/:id/curso
 * El propio usuario (Alumno activo) selecciona su curso al iniciar sesión.
 * Body: { cursoID: number, anioInicio: number }
 * anioInicio = año en que ingresó a la escuela (no el año actual del calendario).
 * Solo se puede hacer si no tiene curso asignado aún.
 */
app.post('/cuentas/:id/curso', requireAuth, async (req, res) => {
  const cuentaId = parseInt(req.params.id);

  if (req.userJwt.id !== cuentaId) {
    return res.status(403).json({ error: 'Solo podés asignar tu propio curso.' });
  }

  const { cursoID, anioInicio } = req.body;

  if (!cursoID || !anioInicio) {
    return res.status(400).json({ error: 'cursoID y anioInicio son requeridos.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar cuenta activa con rol Alumno
    const [[cuenta]] = await conn.query(
      'SELECT ID, estadoCuentaID, rolID FROM Cuenta WHERE ID = ?',
      [cuentaId]
    );
    if (!cuenta) {
      await conn.rollback();
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }
    if (cuenta.estadoCuentaID !== ESTADOS_CUENTA.ACTIVO) {
      await conn.rollback();
      return res.status(403).json({ error: 'La cuenta debe estar activa.' });
    }
    if (cuenta.rolID !== ROLES.ALUMNO) {
      await conn.rollback();
      return res.status(403).json({ error: 'Solo los alumnos pueden seleccionar curso.' });
    }

    // Verificar que el curso existe
    const [[curso]] = await conn.query(
      'SELECT ID, anio, division FROM Curso WHERE ID = ?',
      [cursoID]
    );
    if (!curso) {
      await conn.rollback();
      return res.status(404).json({ error: 'Curso no encontrado.' });
    }

    // Buscar o crear registro Alumno
    let [[alumno]] = await conn.query(
      'SELECT ID FROM Alumno WHERE cuentaID = ?',
      [cuentaId]
    );
    if (!alumno) {
      const [ins] = await conn.query(
        'INSERT INTO Alumno (cuentaID) VALUES (?)',
        [cuentaId]
      );
      alumno = { ID: ins.insertId };
    }

    // Verificar que no tiene curso activo ya
    const [[cursoActual]] = await conn.query(
      'SELECT ID FROM AlumnoCurso WHERE AlumnoID = ? AND fechaHasta IS NULL',
      [alumno.ID]
    );
    if (cursoActual) {
      await conn.rollback();
      return res.status(409).json({
        error: 'Ya tenés un curso asignado. El admin puede cambiarlo si es necesario.',
      });
    }

    const hoy = new Date().toISOString().slice(0, 10);
    await conn.query(
      `INSERT INTO AlumnoCurso (AlumnoID, CursoID, anioInicio, fechaDesde, fechaHasta)
       VALUES (?, ?, ?, ?, NULL)`,
      [alumno.ID, cursoID, anioInicio, hoy]
    );

    await registrarHistorialCuenta(conn, {
      cuentaID: cuentaId,
      realizadoPorID: cuentaId,
      campo: 'curso',
      valorAnterior: null,
      valorNuevo: `${curso.anio}° ${curso.division} (ingreso ${anioInicio})`,
    });

    await conn.commit();
    res.status(201).json({ message: 'Curso asignado correctamente.' });
  } catch (err) {
    await conn.rollback();
    console.error('[Cursos] Error en POST /cuentas/:id/curso:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/**
 * PATCH /cuentas/:id/curso
 * Solo Admin. Cambia el curso actual del alumno.
 * Cierra el registro anterior (fechaHasta = hoy) y abre uno nuevo con el mismo anioInicio.
 * Body: { cursoID: number, comentario?: string }
 */
app.patch('/cuentas/:id/curso', requireAuth, requireRole(ROLES.ADMINISTRADOR), async (req, res) => {
  const cuentaId = parseInt(req.params.id);
  const { cursoID, comentario } = req.body;

  if (!cursoID) {
    return res.status(400).json({ error: 'cursoID es requerido.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar que el alumno existe
    const [[alumno]] = await conn.query(
      'SELECT a.ID FROM Alumno a WHERE a.cuentaID = ?',
      [cuentaId]
    );
    if (!alumno) {
      await conn.rollback();
      return res.status(404).json({ error: 'El usuario no tiene perfil de alumno.' });
    }

    // Obtener el curso actual activo
    const [[cursoActual]] = await conn.query(
      `SELECT ac.ID, ac.CursoID, ac.anioInicio, c.anio, c.division
       FROM AlumnoCurso ac
       JOIN Curso c ON ac.CursoID = c.ID
       WHERE ac.AlumnoID = ? AND ac.fechaHasta IS NULL`,
      [alumno.ID]
    );

    // Verificar que el nuevo curso existe
    const [[cursoNuevo]] = await conn.query(
      'SELECT ID, anio, division FROM Curso WHERE ID = ?',
      [cursoID]
    );
    if (!cursoNuevo) {
      await conn.rollback();
      return res.status(404).json({ error: 'Curso no encontrado.' });
    }

    const hoy = new Date().toISOString().slice(0, 10);

    // El anioInicio se conserva del registro anterior (o si no tenía, usar el año actual)
    const anioInicio = cursoActual ? cursoActual.anioInicio : new Date().getFullYear();
    const valorAnterior = cursoActual
      ? `${cursoActual.anio}° ${cursoActual.division}`
      : null;

    // Cerrar el registro anterior si existe
    if (cursoActual) {
      await conn.query(
        'UPDATE AlumnoCurso SET fechaHasta = ? WHERE ID = ?',
        [hoy, cursoActual.ID]
      );
    }

    // Crear el nuevo registro con el mismo anioInicio
    await conn.query(
      `INSERT INTO AlumnoCurso (AlumnoID, CursoID, anioInicio, fechaDesde, fechaHasta)
       VALUES (?, ?, ?, ?, NULL)`,
      [alumno.ID, cursoID, anioInicio, hoy]
    );

    await registrarHistorialCuenta(conn, {
      cuentaID: cuentaId,
      realizadoPorID: req.userJwt.id,
      campo: 'curso',
      valorAnterior,
      valorNuevo: `${cursoNuevo.anio}° ${cursoNuevo.division}`,
      comentario: comentario || null,
    });

    await conn.commit();
    res.json({
      message: 'Curso actualizado correctamente.',
      anioInicio,
    });
  } catch (err) {
    await conn.rollback();
    console.error('[Cursos] Error en PATCH /cuentas/:id/curso:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ─────────────────────────────────────────────────────────────
// HISTORIAL DE CUENTA
// ─────────────────────────────────────────────────────────────

/**
 * GET /cuentas/:id/historial
 * Solo Admin. Lista todos los cambios registrados para una cuenta.
 */
app.get('/cuentas/:id/historial', requireAuth, requireRole(ROLES.ADMINISTRADOR), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT h.ID, h.campo, h.valorAnterior, h.valorNuevo, h.comentario, h.fechaDeCreacion,
              r.NombreApellido AS realizadoPor
       FROM HistorialCuenta h
       JOIN Cuenta r ON h.realizadoPorID = r.ID
       WHERE h.cuentaID = ?
       ORDER BY h.fechaDeCreacion DESC`,
      [req.params.id]
    );

    res.json(rows);
  } catch (err) {
    console.error('[Historial] Error en GET /cuentas/:id/historial:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// HELPERS — HISTORIAL Y NOTIFICACIONES DE CONTENIDO
// ─────────────────────────────────────────────────────────────

/**
 * Registra un cambio de estado en la tabla Historial.
 * Solo uno de novedadID/eventoID/materialID debe tener valor.
 */
async function registrarHistorialContenido(conn, {
  novedadID = null, eventoID = null, materialID = null,
  estadoAnteriorID, estadoNuevoID, cuentaID, comentario = null,
}) {
  await conn.query(
    `INSERT INTO Historial (NovedadID, EventoID, MaterialID, estadoAnteriorID, estadoNuevoID, cuentaID, comentario)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [novedadID, eventoID, materialID, estadoAnteriorID, estadoNuevoID, cuentaID, comentario]
  );
}

/**
 * Crea una notificación para el usuario indicado.
 */
async function crearNotificacion(conn, { cuentaID, titulo, mensaje, tipoID }) {
  await conn.query(
    `INSERT INTO Notificacion (cuentaID, Titulo, mensaje, tipoID) VALUES (?, ?, ?, ?)`,
    [cuentaID, titulo, mensaje, tipoID]
  );
}

/**
 * Determina el estado inicial de un contenido según el rol del creador.
 * Admin → PUBLICADO directamente. Docente → PENDIENTE (requiere aprobación).
 */
function estadoInicialContenido(rolID) {
  return rolID === ROLES.ADMINISTRADOR ? ESTADOS_CONTENIDO.PUBLICADO : ESTADOS_CONTENIDO.PENDIENTE;
}

// ─────────────────────────────────────────────────────────────
// NOVEDADES
// Visibles públicamente (sin login). Solo se muestran las Publicadas al público.
// ─────────────────────────────────────────────────────────────

/**
 * GET /novedades
 * Público. Devuelve solo las novedades Publicadas.
 * Con auth y rol Admin/Docente propietario: puede ver también las propias en Pendiente/Devuelto.
 */
app.get('/novedades', async (req, res) => {
  try {
    // Intentar leer JWT si viene (no es obligatorio)
    let cuentaActual = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = require('jsonwebtoken').verify(authHeader.split(' ')[1], JWT_SECRET);
        cuentaActual = decoded.user;
      } catch { /* token inválido: tratar como anónimo */ }
    }

    let whereClause = 'n.estadoID = ?';
    const params = [ESTADOS_CONTENIDO.PUBLICADO];

    // Admin ve todo. Docente ve las propias + publicadas.
    if (cuentaActual?.roleId === ROLES.ADMINISTRADOR) {
      whereClause = 'n.estadoID != ?';
      params[0] = ESTADOS_CONTENIDO.ELIMINADO;
    } else if (cuentaActual?.roleId === ROLES.DOCENTE) {
      whereClause = '(n.estadoID = ? OR (n.cuentaID = ? AND n.estadoID != ?))';
      params.length = 0;
      params.push(ESTADOS_CONTENIDO.PUBLICADO, cuentaActual.id, ESTADOS_CONTENIDO.ELIMINADO);
    }

    const [rows] = await pool.query(
      `SELECT n.ID, n.titulo, n.cuerpo, n.imagen, n.cuentaID,
              c.NombreApellido AS autorNombre,
              n.fecha_publicacion, n.asignaturaID, a.Nombre AS asignaturaNombre,
              n.estadoID, e.estado AS estadoNombre,
              n.comentarioAdmin, n.fechaDeCreacion
       FROM Novedad n
       LEFT JOIN Cuenta c ON n.cuentaID = c.ID
       LEFT JOIN Asignatura a ON n.asignaturaID = a.ID
       LEFT JOIN Estado e ON n.estadoID = e.ID
       WHERE ${whereClause}
       ORDER BY n.fechaDeCreacion DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error('[Novedades] GET /novedades:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /novedades
 * Admin (publica directamente) o Docente (queda Pendiente).
 * Body: { titulo, cuerpo, imagen?, asignaturaID? }
 */
app.post('/novedades', requireAuth, requireRole(ROLES.ADMINISTRADOR, ROLES.DOCENTE), async (req, res) => {
  const { titulo, cuerpo, imagen, asignaturaID } = req.body;
  if (!titulo || !cuerpo) {
    return res.status(400).json({ error: 'titulo y cuerpo son requeridos.' });
  }

  const estadoID = estadoInicialContenido(req.cuenta.rolID);
  const fechaPublicacion = estadoID === ESTADOS_CONTENIDO.PUBLICADO ? new Date() : null;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO Novedad (titulo, cuerpo, imagen, cuentaID, fecha_publicacion, asignaturaID, estadoID)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titulo, cuerpo, imagen ?? null, req.userJwt.id, fechaPublicacion, asignaturaID ?? null, estadoID]
    );

    await registrarHistorialContenido(conn, {
      novedadID: result.insertId,
      estadoAnteriorID: estadoID,
      estadoNuevoID: estadoID,
      cuentaID: req.userJwt.id,
    });

    if (estadoID === ESTADOS_CONTENIDO.PENDIENTE) {
      // Notificar a los admins que hay una novedad pendiente de revisión
      const [admins] = await conn.query(
        'SELECT ID FROM Cuenta WHERE rolID = ? AND estadoCuentaID = ?',
        [ROLES.ADMINISTRADOR, ESTADOS_CUENTA.ACTIVO]
      );
      for (const admin of admins) {
        await crearNotificacion(conn, {
          cuentaID: admin.ID,
          titulo: 'Nueva publicación pendiente',
          mensaje: `"${titulo}" fue enviada por ${req.userJwt.name} y espera revisión.`,
          tipoID: TIPOS_NOTIFICACION.NUEVA_PUBLICACION,
        });
      }
    }

    await conn.commit();
    res.status(201).json({ id: result.insertId, estadoID, message: estadoID === ESTADOS_CONTENIDO.PUBLICADO ? 'Novedad publicada.' : 'Novedad enviada para revisión.' });
  } catch (err) {
    await conn.rollback();
    console.error('[Novedades] POST /novedades:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/**
 * GET /novedades/:id
 * Público. Cualquiera puede ver las Publicadas. Auth requerida para ver las propias Pendientes/Devueltas.
 */
app.get('/novedades/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      `SELECT n.ID, n.titulo, n.cuerpo, n.imagen, n.cuentaID,
              c.NombreApellido AS autorNombre,
              n.fecha_publicacion, n.asignaturaID, a.Nombre AS asignaturaNombre,
              n.estadoID, e.estado AS estadoNombre, n.comentarioAdmin, n.fechaDeCreacion
       FROM Novedad n
       LEFT JOIN Cuenta c ON n.cuentaID = c.ID
       LEFT JOIN Asignatura a ON n.asignaturaID = a.ID
       LEFT JOIN Estado e ON n.estadoID = e.ID
       WHERE n.ID = ? AND n.estadoID != ?`,
      [req.params.id, ESTADOS_CONTENIDO.ELIMINADO]
    );

    if (!row) return res.status(404).json({ error: 'Novedad no encontrada.' });

    // Si no está publicada, solo el creador o el admin pueden verla
    if (row.estadoID !== ESTADOS_CONTENIDO.PUBLICADO) {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return res.status(403).json({ error: 'Acceso no autorizado.' });
      try {
        const decoded = require('jsonwebtoken').verify(authHeader.split(' ')[1], JWT_SECRET);
        const u = decoded.user;
        if (u.roleId !== ROLES.ADMINISTRADOR && u.id !== row.cuentaID) {
          return res.status(403).json({ error: 'Acceso no autorizado.' });
        }
      } catch { return res.status(401).json({ error: 'Token inválido.' }); }
    }

    res.json(row);
  } catch (err) {
    console.error('[Novedades] GET /novedades/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /novedades/:id
 * Admin edita cualquier novedad. Docente edita solo la propia (si está Pendiente o Devuelta).
 * Body: { titulo?, cuerpo?, imagen?, asignaturaID? }
 */
app.patch('/novedades/:id', requireAuth, requireRole(ROLES.ADMINISTRADOR, ROLES.DOCENTE), async (req, res) => {
  const { titulo, cuerpo, imagen, asignaturaID } = req.body;

  try {
    const [[novedad]] = await pool.query(
      'SELECT ID, cuentaID, estadoID FROM Novedad WHERE ID = ? AND estadoID != ?',
      [req.params.id, ESTADOS_CONTENIDO.ELIMINADO]
    );
    if (!novedad) return res.status(404).json({ error: 'Novedad no encontrada.' });

    // Docente solo puede editar la propia y solo si está Pendiente o Devuelta
    if (req.cuenta.rolID === ROLES.DOCENTE) {
      if (novedad.cuentaID !== req.userJwt.id) return res.status(403).json({ error: 'Solo podés editar tus propias novedades.' });
      if (![ESTADOS_CONTENIDO.PENDIENTE, ESTADOS_CONTENIDO.DEVUELTO].includes(novedad.estadoID)) {
        return res.status(403).json({ error: 'Solo podés editar novedades en estado Pendiente o Devuelta.' });
      }
    }

    const campos = [];
    const params = [];
    if (titulo !== undefined) { campos.push('titulo = ?'); params.push(titulo); }
    if (cuerpo !== undefined) { campos.push('cuerpo = ?'); params.push(cuerpo); }
    if (imagen !== undefined) { campos.push('imagen = ?'); params.push(imagen); }
    if (asignaturaID !== undefined) { campos.push('asignaturaID = ?'); params.push(asignaturaID); }

    // Si el docente edita una devuelta, vuelve a Pendiente
    if (req.cuenta.rolID === ROLES.DOCENTE && novedad.estadoID === ESTADOS_CONTENIDO.DEVUELTO) {
      campos.push('estadoID = ?', 'comentarioAdmin = NULL');
      params.push(ESTADOS_CONTENIDO.PENDIENTE);
    }

    if (campos.length === 0) return res.status(400).json({ error: 'No hay campos para actualizar.' });
    params.push(req.params.id);

    await pool.query(`UPDATE Novedad SET ${campos.join(', ')} WHERE ID = ?`, params);
    res.json({ message: 'Novedad actualizada.' });
  } catch (err) {
    console.error('[Novedades] PATCH /novedades/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /novedades/:id/estado
 * Solo Admin. Cambia el estado (Aprobado, Devuelto, Rechazado).
 * Body: { estadoID, comentario? }
 * Genera historial y notificación al creador.
 */
app.patch('/novedades/:id/estado', requireAuth, requireRole(ROLES.ADMINISTRADOR), async (req, res) => {
  const { estadoID, comentario } = req.body;
  if (!estadoID) return res.status(400).json({ error: 'estadoID es requerido.' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[novedad]] = await conn.query(
      'SELECT ID, cuentaID, titulo, estadoID FROM Novedad WHERE ID = ? AND estadoID != ?',
      [req.params.id, ESTADOS_CONTENIDO.ELIMINADO]
    );
    if (!novedad) { await conn.rollback(); conn.release(); return res.status(404).json({ error: 'Novedad no encontrada.' }); }

    const camposUpdate = ['estadoID = ?'];
    const paramsUpdate = [estadoID];
    if (comentario !== undefined) { camposUpdate.push('comentarioAdmin = ?'); paramsUpdate.push(comentario); }
    if (parseInt(estadoID) === ESTADOS_CONTENIDO.PUBLICADO) { camposUpdate.push('fecha_publicacion = NOW()'); }
    paramsUpdate.push(req.params.id);

    await conn.query(`UPDATE Novedad SET ${camposUpdate.join(', ')} WHERE ID = ?`, paramsUpdate);

    await registrarHistorialContenido(conn, {
      novedadID: novedad.ID,
      estadoAnteriorID: novedad.estadoID,
      estadoNuevoID: estadoID,
      cuentaID: req.userJwt.id,
      comentario: comentario || null,
    });

    // Notificar al creador
    const tipoMap = {
      [ESTADOS_CONTENIDO.PUBLICADO]: { tipo: TIPOS_NOTIFICACION.APROBACION, titulo: 'Tu novedad fue aprobada', msg: `"${novedad.titulo}" fue publicada.` },
      [ESTADOS_CONTENIDO.DEVUELTO]:  { tipo: TIPOS_NOTIFICACION.DEVOLUCION, titulo: 'Tu novedad fue devuelta', msg: `"${novedad.titulo}" requiere correcciones. ${comentario || ''}` },
      [ESTADOS_CONTENIDO.PENDIENTE]: { tipo: TIPOS_NOTIFICACION.DEVOLUCION, titulo: 'Tu novedad fue devuelta', msg: `"${novedad.titulo}" requiere correcciones. ${comentario || ''}` },
    };
    const notif = tipoMap[parseInt(estadoID)];
    if (notif) {
      await crearNotificacion(conn, { cuentaID: novedad.cuentaID, titulo: notif.titulo, mensaje: notif.msg, tipoID: notif.tipo });
    }

    await conn.commit();
    res.json({ message: 'Estado actualizado.' });
  } catch (err) {
    await conn.rollback();
    console.error('[Novedades] PATCH /novedades/:id/estado:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/**
 * DELETE /novedades/:id
 * Solo Admin. Borrado lógico: estado → Eliminado.
 */
app.delete('/novedades/:id', requireAuth, requireRole(ROLES.ADMINISTRADOR), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[novedad]] = await conn.query(
      'SELECT ID, cuentaID, titulo, estadoID FROM Novedad WHERE ID = ? AND estadoID != ?',
      [req.params.id, ESTADOS_CONTENIDO.ELIMINADO]
    );
    if (!novedad) { await conn.rollback(); conn.release(); return res.status(404).json({ error: 'Novedad no encontrada.' }); }

    await conn.query('UPDATE Novedad SET estadoID = ? WHERE ID = ?', [ESTADOS_CONTENIDO.ELIMINADO, novedad.ID]);

    await registrarHistorialContenido(conn, {
      novedadID: novedad.ID,
      estadoAnteriorID: novedad.estadoID,
      estadoNuevoID: ESTADOS_CONTENIDO.ELIMINADO,
      cuentaID: req.userJwt.id,
    });

    await crearNotificacion(conn, {
      cuentaID: novedad.cuentaID,
      titulo: 'Tu novedad fue eliminada',
      mensaje: `"${novedad.titulo}" fue eliminada por un administrador.`,
      tipoID: TIPOS_NOTIFICACION.ELIMINACION,
    });

    await conn.commit();
    res.json({ message: 'Novedad eliminada.' });
  } catch (err) {
    await conn.rollback();
    console.error('[Novedades] DELETE /novedades/:id:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ─────────────────────────────────────────────────────────────
// EVENTOS
// Requieren auth. Alumnos ven solo los de sus cursos. Docentes y Admin ven todos los Publicados.
// ─────────────────────────────────────────────────────────────

/**
 * GET /eventos
 * Auth requerida. Alumnos: solo eventos de sus cursos. Docentes/Admin: todos los Publicados (+ propios si Docente).
 */
app.get('/eventos', requireAuth, async (req, res) => {
  try {
    const cuenta = req.userJwt;

    if (cuenta.roleId === ROLES.ADMINISTRADOR) {
      // Admin ve todos excepto eliminados
      const [rows] = await pool.query(
        `SELECT e.ID, e.titulo, e.cuerpo, e.cuentaID, c.NombreApellido AS autorNombre,
                e.fecha_publicacion, e.asignaturaID, a.Nombre AS asignaturaNombre,
                e.estadoID, es.estado AS estadoNombre, e.comentarioAdmin, e.fechaDeCreacion,
                GROUP_CONCAT(ec.CursoID) AS cursoIDs
         FROM Evento e
         LEFT JOIN Cuenta c ON e.cuentaID = c.ID
         LEFT JOIN Asignatura a ON e.asignaturaID = a.ID
         LEFT JOIN Estado es ON e.estadoID = es.ID
         LEFT JOIN EventosCursos ec ON e.ID = ec.EventoID
         WHERE e.estadoID != ?
         GROUP BY e.ID
         ORDER BY e.fecha_publicacion ASC`,
        [ESTADOS_CONTENIDO.ELIMINADO]
      );
      return res.json(rows);
    }

    if (cuenta.roleId === ROLES.DOCENTE) {
      // Docente ve publicados + los propios en cualquier estado
      const [rows] = await pool.query(
        `SELECT e.ID, e.titulo, e.cuerpo, e.cuentaID, c.NombreApellido AS autorNombre,
                e.fecha_publicacion, e.asignaturaID, a.Nombre AS asignaturaNombre,
                e.estadoID, es.estado AS estadoNombre, e.comentarioAdmin, e.fechaDeCreacion,
                GROUP_CONCAT(ec.CursoID) AS cursoIDs
         FROM Evento e
         LEFT JOIN Cuenta c ON e.cuentaID = c.ID
         LEFT JOIN Asignatura a ON e.asignaturaID = a.ID
         LEFT JOIN Estado es ON e.estadoID = es.ID
         LEFT JOIN EventosCursos ec ON e.ID = ec.EventoID
         WHERE (e.estadoID = ? OR (e.cuentaID = ? AND e.estadoID != ?))
         GROUP BY e.ID
         ORDER BY e.fecha_publicacion ASC`,
        [ESTADOS_CONTENIDO.PUBLICADO, cuenta.id, ESTADOS_CONTENIDO.ELIMINADO]
      );
      return res.json(rows);
    }

    // Alumno: solo eventos publicados de sus cursos
    const [[alumno]] = await pool.query(
      'SELECT a.ID FROM Alumno a WHERE a.cuentaID = ?', [cuenta.id]
    );
    if (!alumno) return res.json([]); // Sin perfil de alumno = sin eventos

    const [[cursoActual]] = await pool.query(
      'SELECT CursoID FROM AlumnoCurso WHERE AlumnoID = ? AND fechaHasta IS NULL', [alumno.ID]
    );
    if (!cursoActual) return res.json([]); // Sin curso asignado = sin eventos

    const [rows] = await pool.query(
      `SELECT e.ID, e.titulo, e.cuerpo, e.cuentaID, c.NombreApellido AS autorNombre,
              e.fecha_publicacion, e.asignaturaID, a.Nombre AS asignaturaNombre,
              e.estadoID, es.estado AS estadoNombre, e.fechaDeCreacion
       FROM Evento e
       JOIN EventosCursos ec ON e.ID = ec.EventoID
       LEFT JOIN Cuenta c ON e.cuentaID = c.ID
       LEFT JOIN Asignatura a ON e.asignaturaID = a.ID
       LEFT JOIN Estado es ON e.estadoID = es.ID
       WHERE e.estadoID = ? AND ec.CursoID = ?
       GROUP BY e.ID
       ORDER BY e.fecha_publicacion ASC`,
      [ESTADOS_CONTENIDO.PUBLICADO, cursoActual.CursoID]
    );
    res.json(rows);
  } catch (err) {
    console.error('[Eventos] GET /eventos:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /eventos
 * Admin (publica directo) o Docente (queda Pendiente).
 * Body: { titulo, cuerpo, fecha_publicacion, asignaturaID?, cursoIDs: number[] }
 * cursoIDs: IDs de los cursos que pueden ver el evento (obligatorio al menos uno).
 */
app.post('/eventos', requireAuth, requireRole(ROLES.ADMINISTRADOR, ROLES.DOCENTE), async (req, res) => {
  const { titulo, cuerpo, fecha_publicacion, asignaturaID, cursoIDs } = req.body;
  if (!titulo || !cuerpo) return res.status(400).json({ error: 'titulo y cuerpo son requeridos.' });
  if (!Array.isArray(cursoIDs) || cursoIDs.length === 0) return res.status(400).json({ error: 'cursoIDs debe tener al menos un curso.' });

  const estadoID = estadoInicialContenido(req.cuenta.rolID);
  const fechaPublicacion = estadoID === ESTADOS_CONTENIDO.PUBLICADO ? (fecha_publicacion ?? null) : null;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO Evento (titulo, cuerpo, cuentaID, fecha_publicacion, asignaturaID, estadoID)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titulo, cuerpo, req.userJwt.id, fechaPublicacion, asignaturaID ?? null, estadoID]
    );
    const eventoID = result.insertId;

    // Asociar cursos
    const cursosValues = cursoIDs.map(cID => [eventoID, cID]);
    await conn.query('INSERT INTO EventosCursos (EventoID, CursoID) VALUES ?', [cursosValues]);

    await registrarHistorialContenido(conn, {
      eventoID,
      estadoAnteriorID: estadoID,
      estadoNuevoID: estadoID,
      cuentaID: req.userJwt.id,
    });

    if (estadoID === ESTADOS_CONTENIDO.PENDIENTE) {
      const [admins] = await conn.query('SELECT ID FROM Cuenta WHERE rolID = ? AND estadoCuentaID = ?', [ROLES.ADMINISTRADOR, ESTADOS_CUENTA.ACTIVO]);
      for (const admin of admins) {
        await crearNotificacion(conn, {
          cuentaID: admin.ID,
          titulo: 'Nuevo evento pendiente',
          mensaje: `"${titulo}" fue enviado por ${req.userJwt.name} y espera revisión.`,
          tipoID: TIPOS_NOTIFICACION.NUEVA_PUBLICACION,
        });
      }
    }

    await conn.commit();
    res.status(201).json({ id: eventoID, estadoID, message: estadoID === ESTADOS_CONTENIDO.PUBLICADO ? 'Evento publicado.' : 'Evento enviado para revisión.' });
  } catch (err) {
    await conn.rollback();
    console.error('[Eventos] POST /eventos:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/**
 * PATCH /eventos/:id
 * Admin edita cualquier evento. Docente edita solo el propio (Pendiente o Devuelto).
 * Body: { titulo?, cuerpo?, fecha_publicacion?, asignaturaID?, cursoIDs? }
 */
app.patch('/eventos/:id', requireAuth, requireRole(ROLES.ADMINISTRADOR, ROLES.DOCENTE), async (req, res) => {
  const { titulo, cuerpo, fecha_publicacion, asignaturaID, cursoIDs } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[evento]] = await conn.query(
      'SELECT ID, cuentaID, estadoID FROM Evento WHERE ID = ? AND estadoID != ?',
      [req.params.id, ESTADOS_CONTENIDO.ELIMINADO]
    );
    if (!evento) { await conn.rollback(); conn.release(); return res.status(404).json({ error: 'Evento no encontrado.' }); }

    if (req.cuenta.rolID === ROLES.DOCENTE) {
      if (evento.cuentaID !== req.userJwt.id) { await conn.rollback(); conn.release(); return res.status(403).json({ error: 'Solo podés editar tus propios eventos.' }); }
      if (![ESTADOS_CONTENIDO.PENDIENTE, ESTADOS_CONTENIDO.DEVUELTO].includes(evento.estadoID)) { await conn.rollback(); conn.release(); return res.status(403).json({ error: 'Solo podés editar eventos en estado Pendiente o Devuelto.' }); }
    }

    const campos = [];
    const params = [];
    if (titulo !== undefined) { campos.push('titulo = ?'); params.push(titulo); }
    if (cuerpo !== undefined) { campos.push('cuerpo = ?'); params.push(cuerpo); }
    if (fecha_publicacion !== undefined) { campos.push('fecha_publicacion = ?'); params.push(fecha_publicacion); }
    if (asignaturaID !== undefined) { campos.push('asignaturaID = ?'); params.push(asignaturaID); }
    if (req.cuenta.rolID === ROLES.DOCENTE && evento.estadoID === ESTADOS_CONTENIDO.DEVUELTO) {
      campos.push('estadoID = ?', 'comentarioAdmin = NULL');
      params.push(ESTADOS_CONTENIDO.PENDIENTE);
    }

    if (campos.length > 0) {
      params.push(req.params.id);
      await conn.query(`UPDATE Evento SET ${campos.join(', ')} WHERE ID = ?`, params);
    }

    if (Array.isArray(cursoIDs) && cursoIDs.length > 0) {
      await conn.query('DELETE FROM EventosCursos WHERE EventoID = ?', [req.params.id]);
      const cursosValues = cursoIDs.map(cID => [parseInt(req.params.id), cID]);
      await conn.query('INSERT INTO EventosCursos (EventoID, CursoID) VALUES ?', [cursosValues]);
    }

    await conn.commit();
    res.json({ message: 'Evento actualizado.' });
  } catch (err) {
    await conn.rollback();
    console.error('[Eventos] PATCH /eventos/:id:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/**
 * PATCH /eventos/:id/estado
 * Solo Admin. Cambia estado + comentario opcional → historial + notificación.
 */
app.patch('/eventos/:id/estado', requireAuth, requireRole(ROLES.ADMINISTRADOR), async (req, res) => {
  const { estadoID, comentario } = req.body;
  if (!estadoID) return res.status(400).json({ error: 'estadoID es requerido.' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[evento]] = await conn.query(
      'SELECT ID, cuentaID, titulo, estadoID FROM Evento WHERE ID = ? AND estadoID != ?',
      [req.params.id, ESTADOS_CONTENIDO.ELIMINADO]
    );
    if (!evento) { await conn.rollback(); conn.release(); return res.status(404).json({ error: 'Evento no encontrado.' }); }

    const camposUpdate = ['estadoID = ?'];
    const paramsUpdate = [estadoID];
    if (comentario !== undefined) { camposUpdate.push('comentarioAdmin = ?'); paramsUpdate.push(comentario); }
    if (parseInt(estadoID) === ESTADOS_CONTENIDO.PUBLICADO) { camposUpdate.push('fecha_publicacion = COALESCE(fecha_publicacion, NOW())'); }
    paramsUpdate.push(req.params.id);

    await conn.query(`UPDATE Evento SET ${camposUpdate.join(', ')} WHERE ID = ?`, paramsUpdate);
    await registrarHistorialContenido(conn, { eventoID: evento.ID, estadoAnteriorID: evento.estadoID, estadoNuevoID: estadoID, cuentaID: req.userJwt.id, comentario: comentario || null });

    const tipoMap = {
      [ESTADOS_CONTENIDO.PUBLICADO]: { tipo: TIPOS_NOTIFICACION.APROBACION, titulo: 'Tu evento fue aprobado', msg: `"${evento.titulo}" fue publicado.` },
      [ESTADOS_CONTENIDO.DEVUELTO]:  { tipo: TIPOS_NOTIFICACION.DEVOLUCION, titulo: 'Tu evento fue devuelto', msg: `"${evento.titulo}" requiere correcciones. ${comentario || ''}` },
    };
    const notif = tipoMap[parseInt(estadoID)];
    if (notif) await crearNotificacion(conn, { cuentaID: evento.cuentaID, titulo: notif.titulo, mensaje: notif.msg, tipoID: notif.tipo });

    await conn.commit();
    res.json({ message: 'Estado del evento actualizado.' });
  } catch (err) {
    await conn.rollback();
    console.error('[Eventos] PATCH /eventos/:id/estado:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/**
 * DELETE /eventos/:id
 * Solo Admin. Borrado lógico → Eliminado.
 */
app.delete('/eventos/:id', requireAuth, requireRole(ROLES.ADMINISTRADOR), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[evento]] = await conn.query('SELECT ID, cuentaID, titulo, estadoID FROM Evento WHERE ID = ? AND estadoID != ?', [req.params.id, ESTADOS_CONTENIDO.ELIMINADO]);
    if (!evento) { await conn.rollback(); conn.release(); return res.status(404).json({ error: 'Evento no encontrado.' }); }

    await conn.query('UPDATE Evento SET estadoID = ? WHERE ID = ?', [ESTADOS_CONTENIDO.ELIMINADO, evento.ID]);
    await registrarHistorialContenido(conn, { eventoID: evento.ID, estadoAnteriorID: evento.estadoID, estadoNuevoID: ESTADOS_CONTENIDO.ELIMINADO, cuentaID: req.userJwt.id });
    await crearNotificacion(conn, { cuentaID: evento.cuentaID, titulo: 'Tu evento fue eliminado', mensaje: `"${evento.titulo}" fue eliminado.`, tipoID: TIPOS_NOTIFICACION.ELIMINACION });

    await conn.commit();
    res.json({ message: 'Evento eliminado.' });
  } catch (err) {
    await conn.rollback();
    console.error('[Eventos] DELETE /eventos/:id:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ─────────────────────────────────────────────────────────────
// MATERIALES
// Requieren auth. Acceso por curso (si no tiene cursos asignados = visible para todos los alumnos).
// Soporta múltiples asignaturas vía MaterialAsignaturas.
// ─────────────────────────────────────────────────────────────

/**
 * GET /materiales
 * Auth requerida. Alumnos: solo materiales de sus cursos (o todos si el material no tiene cursos).
 */
app.get('/materiales', requireAuth, async (req, res) => {
  try {
    const cuenta = req.userJwt;

    if (cuenta.roleId === ROLES.ADMINISTRADOR) {
      const [rows] = await pool.query(
        `SELECT m.ID, m.Titulo, m.descripcion, m.archivo, m.cuentaID,
                c.NombreApellido AS autorNombre,
                m.fecha_publicacion, m.clasificacionID, cl.Clasificacion AS clasificacionNombre,
                m.estadoID, es.estado AS estadoNombre, m.fechaDeCreacion,
                GROUP_CONCAT(DISTINCT mc.CursoID) AS cursoIDs,
                GROUP_CONCAT(DISTINCT ma.AsignaturaID) AS asignaturaIDs
         FROM Material m
         LEFT JOIN Cuenta c ON m.cuentaID = c.ID
         LEFT JOIN Clasificacion cl ON m.clasificacionID = cl.ID
         LEFT JOIN Estado es ON m.estadoID = es.ID
         LEFT JOIN MaterialCursos mc ON m.ID = mc.MaterialID
         LEFT JOIN MaterialAsignaturas ma ON m.ID = ma.MaterialID
         WHERE m.estadoID != ?
         GROUP BY m.ID
         ORDER BY m.fechaDeCreacion DESC`,
        [ESTADOS_CONTENIDO.ELIMINADO]
      );
      return res.json(rows);
    }

    if (cuenta.roleId === ROLES.DOCENTE) {
      const [rows] = await pool.query(
        `SELECT m.ID, m.Titulo, m.descripcion, m.archivo, m.cuentaID,
                c.NombreApellido AS autorNombre,
                m.fecha_publicacion, m.clasificacionID, cl.Clasificacion AS clasificacionNombre,
                m.estadoID, es.estado AS estadoNombre, m.fechaDeCreacion,
                GROUP_CONCAT(DISTINCT mc.CursoID) AS cursoIDs,
                GROUP_CONCAT(DISTINCT ma.AsignaturaID) AS asignaturaIDs
         FROM Material m
         LEFT JOIN Cuenta c ON m.cuentaID = c.ID
         LEFT JOIN Clasificacion cl ON m.clasificacionID = cl.ID
         LEFT JOIN Estado es ON m.estadoID = es.ID
         LEFT JOIN MaterialCursos mc ON m.ID = mc.MaterialID
         LEFT JOIN MaterialAsignaturas ma ON m.ID = ma.MaterialID
         WHERE (m.estadoID = ? OR (m.cuentaID = ? AND m.estadoID != ?))
         GROUP BY m.ID
         ORDER BY m.fechaDeCreacion DESC`,
        [ESTADOS_CONTENIDO.PUBLICADO, cuenta.id, ESTADOS_CONTENIDO.ELIMINADO]
      );
      return res.json(rows);
    }

    // Alumno: materiales publicados accesibles por su curso o para todos
    const [[alumno]] = await pool.query('SELECT a.ID FROM Alumno a WHERE a.cuentaID = ?', [cuenta.id]);
    if (!alumno) return res.json([]);

    const [[cursoActual]] = await pool.query('SELECT CursoID FROM AlumnoCurso WHERE AlumnoID = ? AND fechaHasta IS NULL', [alumno.ID]);
    const cursoID = cursoActual?.CursoID ?? null;

    const [rows] = await pool.query(
      `SELECT m.ID, m.Titulo, m.descripcion, m.archivo, m.cuentaID,
              c.NombreApellido AS autorNombre,
              m.fecha_publicacion, m.clasificacionID, cl.Clasificacion AS clasificacionNombre,
              m.estadoID, m.fechaDeCreacion,
              GROUP_CONCAT(DISTINCT ma.AsignaturaID) AS asignaturaIDs
       FROM Material m
       LEFT JOIN Cuenta c ON m.cuentaID = c.ID
       LEFT JOIN Clasificacion cl ON m.clasificacionID = cl.ID
       LEFT JOIN MaterialCursos mc ON m.ID = mc.MaterialID
       LEFT JOIN MaterialAsignaturas ma ON m.ID = ma.MaterialID
       WHERE m.estadoID = ?
         AND (
           NOT EXISTS (SELECT 1 FROM MaterialCursos WHERE MaterialID = m.ID)
           OR (? IS NOT NULL AND mc.CursoID = ?)
         )
       GROUP BY m.ID
       ORDER BY m.fechaDeCreacion DESC`,
      [ESTADOS_CONTENIDO.PUBLICADO, cursoID, cursoID]
    );
    res.json(rows);
  } catch (err) {
    console.error('[Materiales] GET /materiales:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /materiales
 * Admin (publica directo) o Docente (queda Pendiente).
 * Body: { Titulo, descripcion?, archivo, clasificacionID, asignaturaIDs?: number[], cursoIDs?: number[] }
 * cursoIDs vacío o ausente = visible para todos los alumnos.
 */
app.post('/materiales', requireAuth, requireRole(ROLES.ADMINISTRADOR, ROLES.DOCENTE), async (req, res) => {
  const { Titulo, descripcion, archivo, clasificacionID, asignaturaIDs, cursoIDs } = req.body;
  if (!Titulo || !archivo || !clasificacionID) return res.status(400).json({ error: 'Titulo, archivo y clasificacionID son requeridos.' });

  const estadoID = estadoInicialContenido(req.cuenta.rolID);
  const fechaPublicacion = estadoID === ESTADOS_CONTENIDO.PUBLICADO ? new Date() : null;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO Material (Titulo, descripcion, archivo, cuentaID, fecha_publicacion, clasificacionID, estadoID)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [Titulo, descripcion ?? null, archivo, req.userJwt.id, fechaPublicacion, clasificacionID, estadoID]
    );
    const materialID = result.insertId;

    // Asociar asignaturas (múltiples)
    if (Array.isArray(asignaturaIDs) && asignaturaIDs.length > 0) {
      const aValues = asignaturaIDs.map(aID => [materialID, aID]);
      await conn.query('INSERT INTO MaterialAsignaturas (MaterialID, AsignaturaID) VALUES ?', [aValues]);
    }

    // Asociar cursos (vacío = todos los alumnos)
    if (Array.isArray(cursoIDs) && cursoIDs.length > 0) {
      const cValues = cursoIDs.map(cID => [materialID, cID]);
      await conn.query('INSERT INTO MaterialCursos (MaterialID, CursoID) VALUES ?', [cValues]);
    }

    await registrarHistorialContenido(conn, {
      materialID,
      estadoAnteriorID: estadoID,
      estadoNuevoID: estadoID,
      cuentaID: req.userJwt.id,
    });

    if (estadoID === ESTADOS_CONTENIDO.PENDIENTE) {
      const [admins] = await conn.query('SELECT ID FROM Cuenta WHERE rolID = ? AND estadoCuentaID = ?', [ROLES.ADMINISTRADOR, ESTADOS_CUENTA.ACTIVO]);
      for (const admin of admins) {
        await crearNotificacion(conn, {
          cuentaID: admin.ID,
          titulo: 'Nuevo material pendiente',
          mensaje: `"${Titulo}" fue enviado por ${req.userJwt.name} y espera revisión.`,
          tipoID: TIPOS_NOTIFICACION.NUEVA_PUBLICACION,
        });
      }
    }

    await conn.commit();
    res.status(201).json({ id: materialID, estadoID, message: estadoID === ESTADOS_CONTENIDO.PUBLICADO ? 'Material publicado.' : 'Material enviado para revisión.' });
  } catch (err) {
    await conn.rollback();
    console.error('[Materiales] POST /materiales:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/**
 * PATCH /materiales/:id
 * Admin edita cualquier material. Docente edita solo el propio (Pendiente o Devuelto).
 * Body: { Titulo?, descripcion?, archivo?, clasificacionID?, asignaturaIDs?, cursoIDs? }
 */
app.patch('/materiales/:id', requireAuth, requireRole(ROLES.ADMINISTRADOR, ROLES.DOCENTE), async (req, res) => {
  const { Titulo, descripcion, archivo, clasificacionID, asignaturaIDs, cursoIDs } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[material]] = await conn.query(
      'SELECT ID, cuentaID, estadoID FROM Material WHERE ID = ? AND estadoID != ?',
      [req.params.id, ESTADOS_CONTENIDO.ELIMINADO]
    );
    if (!material) { await conn.rollback(); conn.release(); return res.status(404).json({ error: 'Material no encontrado.' }); }

    if (req.cuenta.rolID === ROLES.DOCENTE) {
      if (material.cuentaID !== req.userJwt.id) { await conn.rollback(); conn.release(); return res.status(403).json({ error: 'Solo podés editar tu propio material.' }); }
      if (![ESTADOS_CONTENIDO.PENDIENTE, ESTADOS_CONTENIDO.DEVUELTO].includes(material.estadoID)) { await conn.rollback(); conn.release(); return res.status(403).json({ error: 'Solo podés editar material en estado Pendiente o Devuelto.' }); }
    }

    const campos = [];
    const params = [];
    if (Titulo !== undefined) { campos.push('Titulo = ?'); params.push(Titulo); }
    if (descripcion !== undefined) { campos.push('descripcion = ?'); params.push(descripcion); }
    if (archivo !== undefined) { campos.push('archivo = ?'); params.push(archivo); }
    if (clasificacionID !== undefined) { campos.push('clasificacionID = ?'); params.push(clasificacionID); }
    if (req.cuenta.rolID === ROLES.DOCENTE && material.estadoID === ESTADOS_CONTENIDO.DEVUELTO) {
      campos.push('estadoID = ?', 'comentarioAdmin = NULL');
      params.push(ESTADOS_CONTENIDO.PENDIENTE);
    }

    if (campos.length > 0) {
      params.push(req.params.id);
      await conn.query(`UPDATE Material SET ${campos.join(', ')} WHERE ID = ?`, params);
    }

    if (Array.isArray(asignaturaIDs)) {
      await conn.query('DELETE FROM MaterialAsignaturas WHERE MaterialID = ?', [req.params.id]);
      if (asignaturaIDs.length > 0) {
        const aValues = asignaturaIDs.map(aID => [parseInt(req.params.id), aID]);
        await conn.query('INSERT INTO MaterialAsignaturas (MaterialID, AsignaturaID) VALUES ?', [aValues]);
      }
    }

    if (Array.isArray(cursoIDs)) {
      await conn.query('DELETE FROM MaterialCursos WHERE MaterialID = ?', [req.params.id]);
      if (cursoIDs.length > 0) {
        const cValues = cursoIDs.map(cID => [parseInt(req.params.id), cID]);
        await conn.query('INSERT INTO MaterialCursos (MaterialID, CursoID) VALUES ?', [cValues]);
      }
    }

    await conn.commit();
    res.json({ message: 'Material actualizado.' });
  } catch (err) {
    await conn.rollback();
    console.error('[Materiales] PATCH /materiales/:id:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/**
 * PATCH /materiales/:id/estado
 * Solo Admin. Cambia estado + comentario opcional → historial + notificación.
 */
app.patch('/materiales/:id/estado', requireAuth, requireRole(ROLES.ADMINISTRADOR), async (req, res) => {
  const { estadoID, comentario } = req.body;
  if (!estadoID) return res.status(400).json({ error: 'estadoID es requerido.' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[material]] = await conn.query(
      'SELECT ID, cuentaID, Titulo, estadoID FROM Material WHERE ID = ? AND estadoID != ?',
      [req.params.id, ESTADOS_CONTENIDO.ELIMINADO]
    );
    if (!material) { await conn.rollback(); conn.release(); return res.status(404).json({ error: 'Material no encontrado.' }); }

    const camposUpdate = ['estadoID = ?'];
    const paramsUpdate = [estadoID];
    if (comentario !== undefined) { camposUpdate.push('comentarioAdmin = ?'); paramsUpdate.push(comentario); }
    if (parseInt(estadoID) === ESTADOS_CONTENIDO.PUBLICADO) { camposUpdate.push('fecha_publicacion = NOW()'); }
    paramsUpdate.push(req.params.id);

    await conn.query(`UPDATE Material SET ${camposUpdate.join(', ')} WHERE ID = ?`, paramsUpdate);
    await registrarHistorialContenido(conn, { materialID: material.ID, estadoAnteriorID: material.estadoID, estadoNuevoID: estadoID, cuentaID: req.userJwt.id, comentario: comentario || null });

    const tipoMap = {
      [ESTADOS_CONTENIDO.PUBLICADO]: { tipo: TIPOS_NOTIFICACION.APROBACION, titulo: 'Tu material fue aprobado', msg: `"${material.Titulo}" fue publicado.` },
      [ESTADOS_CONTENIDO.DEVUELTO]:  { tipo: TIPOS_NOTIFICACION.DEVOLUCION, titulo: 'Tu material fue devuelto', msg: `"${material.Titulo}" requiere correcciones. ${comentario || ''}` },
    };
    const notif = tipoMap[parseInt(estadoID)];
    if (notif) await crearNotificacion(conn, { cuentaID: material.cuentaID, titulo: notif.titulo, mensaje: notif.msg, tipoID: notif.tipo });

    await conn.commit();
    res.json({ message: 'Estado del material actualizado.' });
  } catch (err) {
    await conn.rollback();
    console.error('[Materiales] PATCH /materiales/:id/estado:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/**
 * DELETE /materiales/:id
 * Solo Admin. Borrado lógico → Eliminado.
 */
app.delete('/materiales/:id', requireAuth, requireRole(ROLES.ADMINISTRADOR), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[material]] = await conn.query('SELECT ID, cuentaID, Titulo, estadoID FROM Material WHERE ID = ? AND estadoID != ?', [req.params.id, ESTADOS_CONTENIDO.ELIMINADO]);
    if (!material) { await conn.rollback(); conn.release(); return res.status(404).json({ error: 'Material no encontrado.' }); }

    await conn.query('UPDATE Material SET estadoID = ? WHERE ID = ?', [ESTADOS_CONTENIDO.ELIMINADO, material.ID]);
    await registrarHistorialContenido(conn, { materialID: material.ID, estadoAnteriorID: material.estadoID, estadoNuevoID: ESTADOS_CONTENIDO.ELIMINADO, cuentaID: req.userJwt.id });
    await crearNotificacion(conn, { cuentaID: material.cuentaID, titulo: 'Tu material fue eliminado', mensaje: `"${material.Titulo}" fue eliminado.`, tipoID: TIPOS_NOTIFICACION.ELIMINACION });

    await conn.commit();
    res.json({ message: 'Material eliminado.' });
  } catch (err) {
    await conn.rollback();
    console.error('[Materiales] DELETE /materiales/:id:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ─────────────────────────────────────────────────────────────
// INICIO DEL SERVIDOR
// ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend de Escuela PRoA corriendo en http://localhost:${PORT}`);
  console.log(`OAuth Callback esperado en: ${process.env.GOOGLE_REDIRECT || 'http://localhost:3000/oauth2callback'}`);
});