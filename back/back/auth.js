const { google } = require('googleapis');

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT || 'http://localhost:3000/oauth2callback'
  );
}

const defaultScopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

/**
 * Genera la URL de autorización para iniciar sesión con Google
 */
function getConnectionUrl() {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScopes,
  });
}

/**
 * Intercambia el código de autorización devuelto por Google por los tokens y obtiene el perfil del usuario
 */
async function getUserDetails(code) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const userInfo = await oauth2.userinfo.get();
  return userInfo.data;
}

/**
 * Verifica un ID Token (JWT) enviado desde el frontend (Google Identity Services)
 */
async function verifyIdToken(idToken) {
  const client = getOAuthClient();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

module.exports = {
  getOAuthClient,
  getConnectionUrl,
  getUserDetails,
  verifyIdToken,
};
