const { query } = require('../config/database');

const Role = {
  async findAll() {
    const { rows } = await query('SELECT * FROM roles ORDER BY id');
    return rows;
  },
  async findByName(name) {
    const { rows } = await query('SELECT * FROM roles WHERE name=$1', [name]);
    return rows[0];
  },
};

module.exports = Role;
