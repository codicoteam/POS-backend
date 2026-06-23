const Business = require('../models/Business');

exports.create = async (req, res, next) => {
  try {
    const b = await Business.create(req.body);
    res.status(201).json(b);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try { res.json(await Business.findAll()); } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try { res.json(await Business.findById(req.params.id)); } catch (e) { next(e); }
};
