const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

/**
 * Genera el hash bcrypt de una contraseña en texto plano.
 * @param {string} plainPassword
 * @returns {Promise<string>} Hash bcrypt listo para almacenar en la BD
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Verifica si una contraseña en texto plano coincide con el hash almacenado.
 * @param {string} plainPassword
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
