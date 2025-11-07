import React, { useMemo, useState } from 'react';
import { Calculator, AlertTriangle } from 'lucide-react';

// Demo LP-like computation mimicking PuLP objective (minimize cost with bounds)
// Not a real solver, but provides sensible outputs for the UI until backend is wired.
const computeOptimal = ({ demand, capacity, suppliers }) => {
  // Greedy by cost while respecting capacity and max per-supplier (implicit by reliability)
  const sorted = [...suppliers].sort((a, b) => a.price_per_unit - b.price_per_unit);
  let remaining = Math.min(demand, capacity);
  const out = [];
  for (const s of sorted) {
    if (remaining <= 0) break;
    const maxAllowed = Math.floor(remaining * (0.5 + s.reliability * 0.5)); // more reliable → larger allocation
    const qty = Math.min(maxAllowed, remaining);
    out.push({ supplier: s.name, price: s.price_per_unit, qty, cost: +(qty * s.price_per_unit).toFixed(2) });
    remaining -= qty;
  }
  const totalQty = out.reduce((a, b) => a + b.qty, 0);
  const totalCost = out.reduce((a, b) => a + b.cost, 0);
  const warnings = [];
  if (totalQty < demand) warnings.push('Understock risk: insufficient quantity to meet demand');
  if (totalQty > capacity) warnings.push('Overstock risk: exceeds warehouse capacity');
  return { plan: out, totalQty, totalCost: totalCost.toFixed(2), warnings };
};

const defaultSuppliers = [
  { name: 'Alpha Supply', price_per_unit: 4.1, reliability: 0.98 },
  { name: 'Bravo Logistics', price_per_unit: 3.7, reliability: 0.92 },
  { name: 'Cinder Trade', price_per_unit: 4.6, reliability: 0.88 },
  { name: 'Delta Partners', price_per_unit: 3.9, reliability: 0.95 },
];

const InventoryOptimization = () => {
  const [demand, setDemand] = useState(520);
  const [capacity, setCapacity] = useState(480);
  const [suppliers, setSuppliers] = useState(defaultSuppliers);

  const result = useMemo(() => computeOptimal({ demand, capacity, suppliers }), [demand, capacity, suppliers]);

  return (
    <div className="space-y-6 p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Inventory Optimization</h2>
          <p className="text-sm text-white/70">Minimize cost while staying within stock and supplier limits.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/70">Demand</label>
          <input type="number" value={demand} onChange={(e) => setDemand(Number(e.target.value))} className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right text-sm" />
          <label className="text-sm text-white/70">Capacity</label>
          <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right text-sm" />
          <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium hover:bg-emerald-600">
            <Calculator className="h-4 w-4" /> Recompute
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between border-b border-white/10 p-4 text-sm text-white/70">
          <span>Optimal Plan</span>
          <span>
            Total Qty: <span className="text-white font-medium">{result.totalQty}</span> · Total Cost: <span className="text-white font-medium">${result.totalCost}</span>
          </span>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="min-w-[640px] w-full">
            <thead>
              <tr className="text-left text-xs text-white/60">
                <th className="border-b border-white/10 px-4 py-3">Supplier</th>
                <th className="border-b border-white/10 px-4 py-3">Price / Unit</th>
                <th className="border-b border-white/10 px-4 py-3">Quantity</th>
                <th className="border-b border-white/10 px-4 py-3">Cost</th>
              </tr>
            </thead>
            <tbody>
              {result.plan.map((p) => (
                <tr key={p.supplier} className="text-sm">
                  <td className="border-b border-white/10 px-4 py-3">{p.supplier}</td>
                  <td className="border-b border-white/10 px-4 py-3">${p.price.toFixed(2)}</td>
                  <td className="border-b border-white/10 px-4 py-3">{p.qty}</td>
                  <td className="border-b border-white/10 px-4 py-3">${p.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
          <div className="mb-2 inline-flex items-center gap-2 text-amber-300">
            <AlertTriangle className="h-4 w-4" /> Warnings
          </div>
          <ul className="list-disc space-y-1 pl-6 text-sm text-amber-200">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InventoryOptimization;
