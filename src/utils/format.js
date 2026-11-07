export const formatLKR = (n) => 'LKR ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export const formatM = (n) => (n / 1000000).toFixed(1) + 'M';
export const formatKm = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' km';
