const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');

exports.plans = async (req, res, next) => {
  try { res.json(await SubscriptionPlan.findAll()); } catch (e) { next(e); }
};

exports.subscribe = async (req, res, next) => {
  try {
    const { business_id, plan_id, start_date, end_date } = req.body;
    const s = await Subscription.create({ business_id, plan_id, start_date, end_date });
    res.status(201).json(s);
  } catch (e) { next(e); }
};
