const { RATES, CATEGORIES } = require('../utils/wasteConfig');

const getRates = (req, res) => {
  res.json({ categories: CATEGORIES, rates: RATES });
};

module.exports = { getRates };
