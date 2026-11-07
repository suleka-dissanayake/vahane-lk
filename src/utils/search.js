// Maps the vehicle type dropdown to the category stored on each listing
export const TYPE_CATEGORIES = {
  car: ['sedan', 'hatchback', 'car'],
  suv: ['suv'],
  van: ['van'],
  lorry: ['lorry'],
  motorcycle: ['motorcycle'],
  threewheel: ['threewheel', 'three-wheel', 'three wheel'],
  pickup: ['truck', 'pickup'],
};

export function filterListings(listings, { query = '', type = 'all', condition = 'all', sort = 'newest' }) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return listings
    .filter((l) => {
      const text = `${l.make} ${l.model} ${l.year} ${l.district}`.toLowerCase();
      const typeOk = type === 'all' || TYPE_CATEGORIES[type].includes(String(l.category).toLowerCase());
      const conditionOk = condition === 'all' || (l.condition || 'Used') === condition;
      return typeOk && conditionOk && terms.every((t) => text.includes(t));
    })
    .sort((a, b) => {
      if (sort === 'priceLow') return a.price - b.price;
      if (sort === 'priceHigh') return b.price - a.price;
      if (sort === 'inspection') return b.report.score - a.report.score;
      return b.postedDate.localeCompare(a.postedDate);
    });
}
