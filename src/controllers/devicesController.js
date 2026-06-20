const Device = require('../models/Device');

// Admin registers device and assigns to a user
exports.register = async (req, res, next) => {
  try {
    const { device_id, user_id, device_name } = req.body;
    if (!device_id || !user_id) return res.status(400).json({ message: 'device_id and user_id are required.' });
    const d = await Device.create({ device_id, user_id, device_name });
    res.status(201).json(d);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try { res.json(await Device.findAll()); } catch (e) { next(e); }
};
