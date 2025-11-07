import React from 'react';
import { Home, BarChart2, PackageSearch, Boxes, TriangleAlert } from 'lucide-react';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'forecasting', label: 'Forecasting', icon: BarChart2 },
  { key: 'procurement', label: 'Procurement', icon: PackageSearch },
  { key: 'inventory', label: 'Inventory Opt.', icon: Boxes },
  { key: 'anomalies', label: 'Anomalies', icon: TriangleAlert },
];

const Sidebar = ({ current, onNavigate }) => {
  return (
    <aside className="h-full w-full max-w-64 border-r border-white/10 bg-black/60 backdrop-blur">
      <div className="px-4 py-4 text-lg font-semibold text-white/90">Menu</div>
      <nav className="flex flex-col">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`flex items-center gap-3 px-4 py-3 text-left transition hover:bg-white/10 ${
              current === key ? 'bg-white/10 text-emerald-300' : 'text-white/80'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
