const { rating } = require("../bussiness/rating.bussiness");

exports.rating = async (req) => await rating(req.user, req.query, req.body);
