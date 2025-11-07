import React, { useMemo, useState } from 'react';
import { TriangleAlert } from 'lucide-react';

const generateTimeline = (n = 50) => {
  const points = [];
  for (let i = 0; i < n; i++) {
    const base = 100 + 20 * Math.sin((i / 12) * Math.PI * 2) + (Math.random() - 0.5) * 10;
    const spike = Math.random() < 0.06 ? base + 80 + Math.random() * 60 : base;
    const delay = Math.random() < 0.05 ? true : false;
    points.push({ idx: i + 1, demand: Math.max(0, Math.round(spike)), delay, outlier: spike > base + 50 });
  }
  return points;
};

const severity = (p) => {
  if (p.outlier && p.delay) return 'critical';
  if (p.outlier || p.delay) return 'warning';
  return 'normal';
};

const Badge = ({ level }) => {
  const map = {
    normal: { label: 'Normal', cls: 'bg-emerald-500/20 text-emerald-300' },
    warning: { label: 'Warning', cls: 'bg-amber-400/20 text-amber-300' },
    critical: { label: 'Critical', cls: 'bg-red-500/20 text-red-300' },
  };
  const cfg = map[level] ?? map.normal;
  return <span className={`rounded-md px-2 py-1 text-xs ${cfg.cls}`}>{cfg.label}</span>;
};

const TimelineChart = ({ data }) => {
  const width = 760;
  const height = 220;
  const padding = 30;
  const maxY = Math.max(...data.map((d) => d.demand)) * 1.1;
  const xScale = (i) => padding + (i * (width - 2 * padding)) / (data.length - 1 || 1);
  const yScale = (v) => padding + (height - 2 * padding) * (1 - v / maxY);

  const path = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(2)} ${yScale(d.demand).toFixed(2)}`)
    .join(' ');

  return (
    <svg width={width} height={height} className="w-full">
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" />
      <path d={path} fill="none" stroke="#93c5fd" strokeWidth={2} />
      {data.map((d, i) => (
        <circle
          key={i}
          cx={xScale(i)}
          cy={yScale(d.demand)}
          r={d.outlier ? 4 : 2.5}
          fill={d.delay ? '#f59e0b' : d.outlier ? '#ef4444' : '#10b981'}
          opacity={0.9}
        />
      ))}
    </svg>
  );
};

const Anomalies = () => {
  const [data] = useState(generateTimeline(60));
  const summary = useMemo(() => {
    const totals = { normal: 0, warning: 0, critical: 0 };
    data.forEach((p) => totals[severity(p)]++);
    const status = totals.critical > 0 ? 'critical' : totals.warning > 0 ? 'warning' : 'normal';
    return { totals, status };
  }, [data]);

  return (
    <div className="space-y-6 p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Anomaly Detection</h2>
          <p className="text-sm text-white/70">Isolation Forest / Z-score (demo) to flag spikes, delays, and outliers.</p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-white/70">
          <TriangleAlert className="h-4 w-4 text-red-300" />
          <span>Critical: {summary.totals.critical} · Warning: {summary.totals.warning} · Normal: {summary.totals.normal}</span>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 text-sm text-white/70">Timeline</div>
        <div className="w-full overflow-x-auto">
          <TimelineChart data={data} />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4 text-sm text-white/70">Flagged Points</div>
        <div className="w-full overflow-x-auto">
          <table className="min-w-[680px] w-full">
            <thead>
              <tr className="text-left text-xs text-white/60">
                <th className="border-b border-white/10 px-4 py-3">Index</th>
                <th className="border-b border-white/10 px-4 py-3">Demand</th>
                <th className="border-b border-white/10 px-4 py-3">Delivery Delay</th>
                <th className="border-b border-white/10 px-4 py-3">Outlier</th>
                <th className="border-b border-white/10 px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.idx} className="text-sm">
                  <td className="border-b border-white/10 px-4 py-3">{p.idx}</td>
                  <td className="border-b border-white/10 px-4 py-3">{p.demand}</td>
                  <td className="border-b border-white/10 px-4 py-3">{p.delay ? 'Yes' : 'No'}</td>
                  <td className="border-b border-white/10 px-4 py-3">{p.outlier ? 'Yes' : 'No'}</td>
                  <td className="border-b border-white/10 px-4 py-3"><Badge level={severity(p)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Anomalies;
