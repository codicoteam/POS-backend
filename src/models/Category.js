const { query } = require('../config/database');

const Category = {
  async findAll() {
    const { rows } = await query('SELECT * FROM categories ORDER BY name');
    return rows;
  },
  async create(name) {
    const { rows } = await query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]
    );
    return rows[0];
  },
  async update(id, name) {
    const { rows } = await query(
      'UPDATE categories SET name=$1 WHERE id=$2 RETURNING *', [name, id]
    );
    return rows[0];
  },
  async delete(id) {
    await query('DELETE FROM categories WHERE id=$1', [id]);
  },
};

module.exports = Category;
