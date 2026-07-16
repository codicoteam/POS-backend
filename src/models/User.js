const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  async findByEmail(email) {
    const { rows } = await query(
      `SELECT u.*, r.name AS role, u.must_change_password, u.business_id
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = $1`,
      [email]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT u.id, u.name, u.email, u.is_active, u.created_at, r.name AS role, u.must_change_password, u.business_id
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1`,
      [id]
    );
    return rows[0];
  },

  async findAll() {
    const { rows } = await query(
      `SELECT u.id, u.name, u.email, u.is_active, u.created_at, r.name AS role, u.must_change_password, u.business_id
       FROM users u
       JOIN roles r ON r.id = u.role_id
       ORDER BY u.name`
    );
    return rows;
  },

  async create({ name, email, password, role_id, role, business_id, must_change_password = false }, client = null) {
    const db = client ? client.query.bind(client) : query;
    const hash = await bcrypt.hash(password, 10);

    let resolvedRoleId = role_id;
    if (!resolvedRoleId && role) {
      const roleResult = await db('SELECT id FROM roles WHERE name = $1', [role]);
      if (!roleResult.rows[0]) {
        throw new Error(`Unknown role: ${role}`);
      }
      resolvedRoleId = roleResult.rows[0].id;
    }

    const { rows } = await db(
      `INSERT INTO users (name, email, password_hash, role_id, business_id, must_change_password)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, business_id`,
      [name, email, hash, resolvedRoleId, business_id || null, must_change_password]
    );
    return rows[0];
  },

  async update(id, { name, email, is_active }) {
    const { rows } = await query(
      `UPDATE users
       SET name=$1, email=$2, is_active=$3, updated_at=NOW()
       WHERE id=$4
       RETURNING id, name, email, is_active`,
      [name, email, is_active, id]
    );
    return rows[0];
  },

  async updatePassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash=$1, must_change_password=false, updated_at=NOW() WHERE id=$2', [hash, id]);
  },

  async verifyPassword(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  },

  async deactivate(id) {
    await query('UPDATE users SET is_active=false, updated_at=NOW() WHERE id=$1', [id]);
  },
};

module.exports = User;
