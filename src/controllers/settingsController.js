const BusinessSettings = require('../models/BusinessSettings');

exports.upsert = async (req, res, next) => {
  try {
    const business_id = req.body.business_id || req.user.business_id;
    const s = await BusinessSettings.upsert({ business_id, ...req.body });
    res.json(s);
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const business_id = req.query.business_id || req.user.business_id;
    res.json(await BusinessSettings.findByBusiness(business_id));
  } catch (e) { next(e); }
};
