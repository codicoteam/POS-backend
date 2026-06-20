const Shift = require('../models/Shift');

exports.start = async (req, res, next) => {
  try {
    const s = await Shift.start({ user_id: req.user.id });
    res.status(201).json(s);
  } catch (e) { next(e); }
};

exports.end = async (req, res, next) => {
  try {
    const shift = await Shift.end(req.params.id);
    res.json(shift);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try { res.json(await Shift.findByUser(req.user.id)); } catch (e) { next(e); }
};
