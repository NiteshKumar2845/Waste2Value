const RATES = {
  plastic: 12,
  paper: 10,
  cardboard: 8,
  iron: 28,
  aluminium: 110,
  copper: 550,
  ewaste: 25,
  glass: 2,
};

const CO2_PER_KG = {
  plastic: 1.5,
  paper: 0.9,
  cardboard: 0.9,
  iron: 1.5,
  aluminium: 9,
  copper: 3,
  ewaste: 2.5,
  glass: 0.3,
};

const CATEGORIES = Object.keys(RATES);
const KG_CO2_ABSORBED_PER_TREE_PER_YEAR = 21;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const estimateValue = (items, field = 'estimatedKg') =>
  round2(items.reduce((sum, i) => sum + (Number(i[field]) || 0) * (RATES[i.category] || 0), 0));

const calcImpact = (kgByCategory) => {
  let co2 = 0;
  let kg = 0;
  Object.entries(kgByCategory).forEach(([cat, amount]) => {
    co2 += amount * (CO2_PER_KG[cat] || 0);
    kg += amount;
  });
  return {
    co2SavedKg: round2(co2),
    treesEquivalent: round2(co2 / KG_CO2_ABSORBED_PER_TREE_PER_YEAR),
    landfillDivertedKg: round2(kg),
  };
};

const computeGreenScore = ({ totalKg, pickups, categories }) => {
  const volume = Math.min(60, totalKg * 0.8);
  const consistency = Math.min(20, pickups * 4);
  const variety = Math.min(20, categories * 5);
  return Math.round(volume + consistency + variety);
};

const levelFor = (score) => {
  if (score >= 75) return 'Evergreen';
  if (score >= 50) return 'Sapling';
  if (score >= 25) return 'Sprout';
  return 'Seedling';
};

module.exports = {
  RATES,
  CATEGORIES,
  round2,
  estimateValue,
  calcImpact,
  computeGreenScore,
  levelFor,
};