const crypto = require('crypto');
const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const { query, pool } = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES } = require('../config/environment');

function generateTemporaryPassword() {
  return `Temp-${crypto.randomBytes(4).toString('hex')}`;
}

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findByEmail(email.toLowerCase().trim());
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password.' });
    if (!user.is_active)
      return res.status(403).json({ message: 'Account is deactivated. Contact your administrator.' });

    const valid = await User.verifyPassword(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const payload = { id: user.id, name: user.name, role: user.role, email: user.email, business_id: user.business_id, must_change_password: user.must_change_password };
    const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1, 'LOGIN', $2)`,
      [user.id, req.ip]
    );

    res.json({
      token,
      expires_in: JWT_EXPIRES,
      user: payload,
      must_change_password: user.must_change_password || false,
    });
  } catch (e) { next(e); }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (e) { next(e); }
};

// POST /api/auth/register  (public, creates business + owner in one transaction)
exports.register = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, email, password, business_name } = req.body;
    if (!name || !email || !password || !business_name)
      return res.status(400).json({ message: 'name, email, password and business_name are required.' });

    await client.query('BEGIN');

    const business = await Business.create({
      name: business_name,
      email: req.body.business_email || null,
      phone: req.body.business_phone || null,
      address: req.body.business_address || null,
      status: 'active',
    }, client);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'owner',
      business_id: business.id,
      must_change_password: true,
    }, client);

    await client.query('COMMIT');
    res.status(201).json({ business, user });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    next(e);
  } finally {
    client.release();
  }
};

// POST /api/auth/staff  (owner only, creates staff under own business)
exports.createStaff = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, email, role } = req.body;
    if (!name || !email || !role)
      return res.status(400).json({ message: 'name, email and role are required.' });

    if (!req.user || req.user.role !== 'owner')
      return res.status(403).json({ message: 'Only owners can create staff accounts.' });

    if (!['manager', 'cashier', 'inventory_clerk'].includes(role))
      return res.status(400).json({ message: 'role must be manager, cashier, or inventory_clerk.' });

    const business_id = req.user.business_id;
    if (!business_id)
      return res.status(400).json({ message: 'Business context missing.' });

    const temporaryPassword = generateTemporaryPassword();

    await client.query('BEGIN');
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: temporaryPassword,
      role,
      business_id,
      must_change_password: true,
    }, client);
    await client.query('COMMIT');

    res.status(201).json({ user, temporary_password: temporaryPassword });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    next(e);
  } finally {
    client.release();
  }
};

// PUT /api/auth/password  (change own password)
exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ message: 'current_password and new_password are required.' });

    const user = await User.findByEmail(req.user.email);
    const valid = await User.verifyPassword(current_password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect.' });

    await User.updatePassword(req.user.id, new_password);
    res.json({ message: 'Password updated successfully.' });
  } catch (e) { next(e); }
};

// PUT /api/auth/reset-password/:id  (owner/manager resets another user's password)
exports.resetPassword = async (req, res, next) => {
  try {
    const { new_password } = req.body;
    if (!new_password)
      return res.status(400).json({ message: 'new_password is required.' });

    await User.updatePassword(req.params.id, new_password);
    res.json({ message: 'Password reset successfully.' });
  } catch (e) { next(e); }
};

// GET /api/auth/users
exports.listUsers = async (req, res, next) => {
  try {
    res.json(await User.findAll());
  } catch (e) { next(e); }
};

// PUT /api/auth/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    res.json(await User.update(req.params.id, req.body));
  } catch (e) { next(e); }
};

// DELETE /api/auth/users/:id
exports.deactivateUser = async (req, res, next) => {
  try {
    await User.deactivate(req.params.id);
    res.json({ message: 'User deactivated.' });
  } catch (e) { next(e); }
};

// GET /api/auth/roles
exports.listRoles = async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM roles ORDER BY id');
    res.json(rows);
  } catch (e) { next(e); }
};
