import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Stat = ({ title, value, trend = 'up', delta = '2.4%' }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
    <div className="text-sm text-white/70">{title}</div>
    <div className="mt-2 flex items-end justify-between">
      <div className="text-2xl font-semibold">{value}</div>
      <div
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
          trend === 'up' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
        }`}
      >
        {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {delta}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat title="Products" value="128" trend="up" delta="+3.1%" />
        <Stat title="Suppliers" value="24" trend="up" delta="+1.2%" />
        <Stat title="Fill Rate" value="96.2%" trend="down" delta="-0.6%" />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Overview</h3>
          <span className="text-xs text-white/60">Sample data</span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-64 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 p-4">
            <div className="text-sm text-white/70">Demand trend (sample)</div>
            <div className="mt-2 h-48 w-full rounded-md border border-white/10 bg-black/30" />
          </div>
          <div className="h-64 rounded-lg bg-gradient-to-br from-amber-500/20 to-pink-500/10 p-4">
            <div className="text-sm text-white/70">Inventory utilization (sample)</div>
            <div className="mt-2 h-48 w-full rounded-md border border-white/10 bg-black/30" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
