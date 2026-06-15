const { query } = require('../config/database');

const getAll = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.*, COUNT(p.id)::int as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
       GROUP BY c.id ORDER BY c.name`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const result = await query(
      `INSERT INTO categories (name, description) VALUES ($1,$2) RETURNING *`,
      [name, description]
    );
    res.status(201).json({ success: true, message: 'Category created', data: result.rows[0] });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const result = await query(
      `UPDATE categories SET name=$1, description=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [name, description, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category updated', data: result.rows[0] });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const check = await query('SELECT COUNT(*) FROM products WHERE category_id=$1 AND is_active=true', [req.params.id]);
    if (parseInt(check.rows[0].count) > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete category with active products' });
    }
    await query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
