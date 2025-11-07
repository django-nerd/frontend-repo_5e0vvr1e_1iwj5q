import React, { useMemo, useState } from 'react';
import { SortAsc, SortDesc, Truck, BadgeDollarSign } from 'lucide-react';

const demoSuppliers = [
  { supplier_id: 'S-101', name: 'Alpha Supply', price_per_unit: 4.1, lead_time: 3, reliability: 0.98 },
  { supplier_id: 'S-204', name: 'Bravo Logistics', price_per_unit: 3.7, lead_time: 7, reliability: 0.92 },
  { supplier_id: 'S-318', name: 'Cinder Trade', price_per_unit: 4.6, lead_time: 2, reliability: 0.88 },
  { supplier_id: 'S-427', name: 'Delta Partners', price_per_unit: 3.9, lead_time: 5, reliability: 0.95 },
];

const recommend = (demand = 500) => {
  // Simple heuristic: score by price, lead, reliability; allocate quantities proportionally
  const scored = demoSuppliers.map((s) => ({
    ...s,
    score: (1 / s.price_per_unit) * 0.45 + (1 / (s.lead_time + 0.1)) * 0.25 + s.reliability * 0.30,
  }));
  const totalScore = scored.reduce((a, b) => a + b.score, 0);
  return scored.map((s) => {
    const qty = Math.round((s.score / totalScore) * demand);
    return { ...s, quantity: qty, eta_days: s.lead_time, cost: +(qty * s.price_per_unit).toFixed(2) };
  });
};

const Procurement = () => {
  const [forecastDemand, setForecastDemand] = useState(500);
  const [sort, setSort] = useState({ key: 'cost', dir: 'asc' });

  const rows = useMemo(() => recommend(forecastDemand), [forecastDemand]);
  const sorted = useMemo(() => {
    const r = [...rows];
    r.sort((a, b) => {
      const k = sort.key;
      const v = a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0;
      return sort.dir === 'asc' ? v : -v;
    });
    return r;
  }, [rows, sort]);

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  };

  const totals = useMemo(() => {
    const totalQty = sorted.reduce((a, b) => a + b.quantity, 0);
    const totalCost = sorted.reduce((a, b) => a + b.cost, 0);
    return { totalQty, totalCost: totalCost.toFixed(2) };
  }, [sorted]);

  return (
    <div className="space-y-6 p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Procurement Suggestions</h2>
          <p className="text-sm text-white/70">Recommended supplier mix using lead time, reliability, and price.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/70">Forecast demand</label>
          <input
            type="number"
            className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right text-sm"
            value={forecastDemand}
            onChange={(e) => setForecastDemand(Math.max(0, Number(e.target.value)))}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between border-b border-white/10 p-4 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-300" /> Recommended Orders
          </div>
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="h-4 w-4 text-amber-300" /> Total Cost: <span className="text-white font-medium">${totals.totalCost}</span>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="min-w-[720px] w-full">
            <thead>
              <tr className="text-left text-xs text-white/60">
                {[
                  ['supplier_id', 'Supplier ID'],
                  ['name', 'Supplier'],
                  ['price_per_unit', 'Price/Unit'],
                  ['lead_time', 'Lead (days)'],
                  ['reliability', 'Reliability'],
                  ['quantity', 'Quantity'],
                  ['eta_days', 'ETA'],
                  ['cost', 'Cost'],
                ].map(([key, label]) => (
                  <th key={key} className="border-b border-white/10 px-4 py-3">
                    <button onClick={() => toggleSort(key)} className="inline-flex items-center gap-1">
                      <span>{label}</span>
                      {sort.key === key ? (
                        sort.dir === 'asc' ? <SortAsc className="h-3.5 w-3.5" /> : <SortDesc className="h-3.5 w-3.5" />
                      ) : null}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.supplier_id} className="text-sm">
                  <td className="border-b border-white/10 px-4 py-3 text-white/80">{r.supplier_id}</td>
                  <td className="border-b border-white/10 px-4 py-3">{r.name}</td>
                  <td className="border-b border-white/10 px-4 py-3">${r.price_per_unit.toFixed(2)}</td>
                  <td className="border-b border-white/10 px-4 py-3">{r.lead_time}</td>
                  <td className="border-b border-white/10 px-4 py-3">{(r.reliability * 100).toFixed(1)}%</td>
                  <td className="border-b border-white/10 px-4 py-3">{r.quantity}</td>
                  <td className="border-b border-white/10 px-4 py-3">{r.eta_days}d</td>
                  <td className="border-b border-white/10 px-4 py-3">${r.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Procurement;
