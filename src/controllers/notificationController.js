const Notification = require('../models/Notification');

exports.list = async (req, res, next) => {
  try {
    const business_id = req.user.business_id;
    res.json(await Notification.listForBusiness(business_id));
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const business_id = req.body.business_id || req.user.business_id;
    const n = await Notification.create({ business_id, user_id: req.body.user_id, type: req.body.type, title: req.body.title, body: req.body.body, data: req.body.data });
    res.status(201).json(n);
  } catch (e) { next(e); }
};
