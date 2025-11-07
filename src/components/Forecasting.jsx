import React, { useMemo, useState } from 'react';
import { Play, LineChart } from 'lucide-react';

// Simple inline SVG line/area chart for history + prediction + confidence interval
const ForecastChart = ({ data }) => {
  const width = 760;
  const height = 260;
  const padding = 32;

  const points = data.map((d) => d.value);
  const lows = data.map((d) => d.low ?? d.value);
  const highs = data.map((d) => d.high ?? d.value);
  const minY = Math.min(...lows) * 0.9;
  const maxY = Math.max(...highs) * 1.1;
  const yScale = (v) => padding + (height - 2 * padding) * (1 - (v - minY) / (maxY - minY));
  const xScale = (i) => padding + (i * (width - 2 * padding)) / (data.length - 1 || 1);

  const linePath = (arr) =>
    arr
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(2)} ${yScale(v).toFixed(2)}`)
      .join(' ');

  // Confidence band area path
  const areaPath = () => {
    const top = data.map((d, i) => `L ${xScale(i).toFixed(2)} ${yScale(d.high ?? d.value).toFixed(2)}`);
    const bottom = [...data]
      .reverse()
      .map((d, idx) => {
        const i = data.length - 1 - idx;
        return `L ${xScale(i).toFixed(2)} ${yScale(d.low ?? d.value).toFixed(2)}`;
      });
    const start = `M ${xScale(0).toFixed(2)} ${yScale(data[0].high ?? data[0].value).toFixed(2)}`;
    return [start, ...top, `L ${xScale(data.length - 1).toFixed(2)} ${yScale(data[data.length - 1].low ?? data[data.length - 1].value).toFixed(2)}`, ...bottom, 'Z'].join(' ');
  };

  return (
    <svg width={width} height={height} className="w-full">
      {/* Axes */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" />

      {/* Confidence interval */}
      <path d={areaPath()} fill="rgba(16, 185, 129, 0.15)" />

      {/* History line (solid) */}
      <path d={linePath(data.map((d) => d.value))} fill="none" stroke="#34d399" strokeWidth={2} />

      {/* Prediction line (dashed for last third) */}
      {(() => {
        const split = Math.floor(data.length * 0.7);
        const past = data.slice(0, split).map((d) => d.value);
        const future = data.slice(split).map((d) => d.value);
        return (
          <>
            <path d={linePath(past)} fill="none" stroke="#60a5fa" strokeWidth={2} />
            <path d={linePath([past[past.length - 1], ...future])} fill="none" stroke="#60a5fa" strokeWidth={2} strokeDasharray="6 6" />
          </>
        );
      })()}
    </svg>
  );
};

const generateSeries = (n = 36, base = 100, noise = 12) => {
  const arr = [];
  let val = base;
  for (let i = 0; i < n; i++) {
    const season = 10 * Math.sin((i / 12) * Math.PI * 2);
    val = val + (Math.random() - 0.5) * noise + season + (i > n * 0.7 ? 1.2 : 0);
    const low = val * 0.9;
    const high = val * 1.1;
    arr.push({ value: Math.max(0, Math.round(val)), low, high });
  }
  return arr;
};

const Forecasting = () => {
  const products = ['Widget A', 'Widget B', 'Gadget C', 'Device D'];
  const [selected, setSelected] = useState(products[0]);
  const [data, setData] = useState(generateSeries());
  const [running, setRunning] = useState(false);

  const runModel = () => {
    setRunning(true);
    setTimeout(() => {
      // Regenerate demo prediction with slightly different pattern
      setData(generateSeries(40, 110 + Math.random() * 30, 14));
      setRunning(false);
    }, 600);
  };

  const stats = useMemo(() => {
    const last = data[data.length - 1]?.value ?? 0;
    const avg = Math.round(data.reduce((a, b) => a + b.value, 0) / data.length);
    return { last, avg, ci: '±10%' };
  }, [data]);

  return (
    <div className="space-y-6 p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Forecasting</h2>
          <p className="text-sm text-white/70">Run GAT-LSTM (demo) and view predictions with confidence intervals.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            onClick={runModel}
            disabled={running}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              running ? 'bg-white/20 text-white/60' : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            <Play className="h-4 w-4" /> {running ? 'Running…' : 'Run GAT-LSTM'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80">
            <LineChart className="h-5 w-5 text-emerald-300" />
            <span className="text-sm">{selected} demand prediction</span>
          </div>
          <div className="flex gap-4 text-xs text-white/70">
            <span>Avg: <span className="text-white">{stats.avg}</span></span>
            <span>Last: <span className="text-white">{stats.last}</span></span>
            <span>CI: <span className="text-white">{stats.ci}</span></span>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <ForecastChart data={data} />
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <span className="inline-flex items-center gap-2 rounded-md bg-emerald-500/20 px-2 py-1 text-emerald-300">
            <span className="h-2 w-4 rounded-sm bg-emerald-400" /> Confidence Interval
          </span>
          <span className="inline-flex items-center gap-2 rounded-md bg-sky-500/20 px-2 py-1 text-sky-300">
            <span className="h-0.5 w-6 bg-sky-400" /> Prediction
          </span>
          <span className="inline-flex items-center gap-2 rounded-md bg-green-500/10 px-2 py-1 text-green-300">
            <span className="h-0.5 w-6 bg-green-400" /> History
          </span>
        </div>
      </div>
    </div>
  );
};

export default Forecasting;
