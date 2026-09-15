const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); 
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pagina_proa',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

 function requireRole(...rolesPermitidos) {
    return async (req, res, next) => {

        const cuenta = await obtenerCuenta(req.user.id);

        if (cuenta.estadoCuentaID !== ESTADO_ACTIVO) {
            return res.status(403).json({
                error: "Cuenta no activa"
            });
        }

        if (!rolesPermitidos.includes(cuenta.rolID)) {
            return res.status(403).json({
                error: "No tienes permisos"
            });
        }

        req.cuenta = cuenta;
        next();
    };
}

app.patch('/api/cuenta/rol', (req,res) => {
    const {cuentaID, rolID, estadoCuentaID} = res.body;
    try {
        const query = `UPDATE Cuenta
        SET rolID = ?,
        estadoCuentaID = ?
        WHERE ID = ?;`;
    }
    catch(error) {
    console.error('Error cambiando el rol:', error);
    res.status(500).send('EL cambio no se realizó.');
  }
})
app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://googleapis.com',
    'https://googleapis.com'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Gets a refresh_token to renew access tokens automatically
    scope: scopes,
    prompt: 'consent'
  });

  res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange the authorization code for access and refresh tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Use the credentials to fetch user information
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // The user is authenticated. Log them in or save them to your database.
    res.json({
      message: 'Authentication successful!',
      user: userInfo.data
    });

  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed.');
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

app.get('/novedades', async (req, res) => {
    try {
        const query = `
            SELECT a.id, n.titulo, n.cuerpo, n.image, n.cuentaID, n.fecha_publicacion, n.asignaturaID, n.estadoID, n.comentarioAdmin, n.fechaDeCreacion 
            FROM Novedad n
            ORDER BY fecha DESC;
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
            SELECT e.id, e.titulo, e.cuerpo, e.image, e.cuentaID, e.fecha_publicacion, e.acceso, e.asignaturaID, e.estadoID, e.comentarioAdmin, e.fechaDeCreacion 
            FROM Evento e
            ORDER BY fecha DESC;
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
            SELECT m.id, m.titulo, m.descripcion, m.archivo, m.cuentaID, m.fecha_publicacion, m.asignaturaID, m.clasificacionID, n.estadoID, n.fechaDeCreacion 
            FROM Material m
            ORDER BY fecha DESC;
        `;
        const [results] = await pool.query(query);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/novedad/nueva', async (req, res) => {
    const { titulo, cuerpo, imagen, asignaturaID, estadoID} = req.body;

    try {
        const juegoActual = rows[0];
        const yaGano = nuevo_intento_id === juegoActual.secret_agent_id;
        const estadoCompletado = juegoActual.completed === 1 || yaGano ? 1 : 0;

        await pool.query(
            'INSERT INTO Novedad (titulo, cuerpo, imagen, fecha_publicacion asignaturaID, estadoID, fechaDeCreacion) VALUES (?, ?, ?, NULL, ?, ?, CURDATE()) ',
            [titulo, cuerpo, imagen, asignaturaID, estadoID]
        );

        res.json({
            success: true,
        });

    } catch (error) {
        console.error("Error al solicitar publicación:", error);
        res.status(500).json({ error: "Error interno al procesar tu solicitud." });
    }
    finally {
        connection.release();
    }
});
app.post('/api/evento/nuevo', async (req, res) => {
    const { titulo, cuerpo, imagen, asignaturaID, estadoID } = req.body;

    try {
        const juegoActual = rows[0];
        const yaGano = nuevo_intento_id === juegoActual.secret_agent_id;
        const estadoCompletado = juegoActual.completed === 1 || yaGano ? 1 : 0;

        await pool.query(
            'INSERT INTO Novedad (titulo, cuerpo, imagen, fecha_publicacion, asignaturaID, estadoID, fechaDeCreacion) VALUES (?, ?, ?, NULL, ?, ?, CURDATE()) ',
            [titulo, cuerpo, imagen, asignaturaID, estadoID]
        );

        res.json({
            success: true,
        });

    } catch (error) {
        console.error("Error al solicitar publicación:", error);
        res.status(500).json({ error: "Error interno al procesar tu solicitud." });
    }
    finally {
        connection.release();
    }
});
app.post('/api/material/nuevo', async (req, res) => {
    const { titulo, cuerpo, imagen, asignaturaID, estadoID } = req.body;

    try {
        const juegoActual = rows[0];
        const yaGano = nuevo_intento_id === juegoActual.secret_agent_id;
        const estadoCompletado = juegoActual.completed === 1 || yaGano ? 1 : 0;

        await pool.query(
            'INSERT INTO Novedad (titulo, cuerpo, imagen, fecha_publicacion, asignaturaID, estadoID, fechaDeCreacion) VALUES (?, ?, ?, NULL, ?, ?, CURDATE()) ',
            [titulo, cuerpo, imagen, asignaturaID, estadoID]
        );

        res.json({
            success: true,
        });

    } catch (error) {
        console.error("Error al solicitar publicación:", error);
        res.status(500).json({ error: "Error interno al procesar tu solicitud." });
    }
    finally {
        connection.release();
    }
});

app.patch('/api/novedad/editar', async (req, res) => {
    requireAuth,
    requireRole(ROL_ADMIN),
    cambiarEstadoNovedad
    if (
    cuenta.rolID === DOCENTE &&
    novedad.cuentaID !== cuenta.ID
) {
    return res.status(403).json({
        error: "No puedes editar esta publicación"
    });
}
})