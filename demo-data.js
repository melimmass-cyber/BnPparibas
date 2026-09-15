// User-specified illustrative values. These are not live prices or verified holdings.
export const assets = Object.freeze([
  { id: 'gold', name: 'Gold', category: 'Precious assets', quantity: 50, unit: 'kg', value: 7000000, currency: 'USD', approximate: false },
  { id: 'gemstones', name: 'Gemstones', category: 'Precious assets', quantity: 60, unit: 'kg', value: 5000000, currency: 'USD', approximate: false },
  { id: 'property', name: 'Real estate', category: 'Real estate', quantity: null, unit: '', value: 2200000, currency: 'USD', approximate: true },
]);
export const usdTotal = assets.reduce((sum, asset) => sum + asset.value, 0);
export const deposit = Object.freeze({ value: 3500000, available: 0, currency: 'EUR' });
export const money = (value, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
export function createDemoCsv(kind = 'portfolio') {
  const rows = kind === 'deposit'
    ? [['DEMO ONLY — not a bank statement'], ['Asset','Currency','Value','Status'], ['Sample fixed deposit','EUR',deposit.value,'Illustrative restricted deposit']]
    : [['DEMO ONLY — not a bank statement'], ['Asset','Quantity','Unit','Currency','Sample valuation','Estimate'], ...assets.map(a => [a.name,a.quantity ?? '',a.unit,a.currency,a.value,a.approximate ? 'Approximate' : 'User-supplied demo value']), ['Total USD assets','','','USD',usdTotal,'Excludes EUR deposit']];
  return '\uFEFF' + rows.map(row => row.map(value => '"' + String(value).replaceAll('"','""') + '"').join(',')).join('\r\n');
}
