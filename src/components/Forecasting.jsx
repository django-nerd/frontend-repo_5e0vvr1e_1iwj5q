import React, { useEffect, useMemo, useState } from 'react';
import { Play, LineChart, Hash } from 'lucide-react';

// Deterministic PRNG (Mulberry32)
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

// Simple inline SVG line/area chart for history + prediction + confidence interval
const ForecastChart = ({ data }) => {
  const width = 760;
  const height = 260;
  const padding = 32;

  const lows = data.map((d) => d.low ?? d.value);
  const highs = data.map((d) => d.high ?? d.value);
  const minY = Math.min(...lows) * 0.9;
  const maxY = Math.max(...highs) * 1.1;
  const yScale = (v) => padding + (height - 2 * padding) * (1 - (v - minY) / (maxY - minY || 1));
  const xScale = (i) => padding + (i * (width - 2 * padding)) / (data.length - 1 || 1);

  const linePath = (arr) =>
    arr
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(2)} ${yScale(v).toFixed(2)}`)
      .join(' ');

  // Confidence band area path
  const areaPath = () => {
    if (!data.length) return '';
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

  if (!data.length) return null;

  return (
    <svg width={width} height={height} className="w-full">
      {/* Axes */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" />

      {/* Confidence interval */}
      <path d={areaPath()} fill="rgba(16, 185, 129, 0.15)" />

      {/* History + prediction split */}
      {(() => {
        const split = Math.floor(data.length * 0.7);
        const past = data.slice(0, split).map((d) => d.value);
        const future = data.slice(split).map((d) => d.value);
        return (
          <>
            <path d={linePath(past)} fill="none" stroke="#34d399" strokeWidth={2} />
            <path d={linePath([past[past.length - 1], ...future])} fill="none" stroke="#60a5fa" strokeWidth={2} strokeDasharray="6 6" />
          </>
        );
      })()}
    </svg>
  );
};

const generateSeries = (rng, n = 36, base = 100, noise = 12) => {
  const arr = [];
  let val = base;
  for (let i = 0; i < n; i++) {
    const season = 10 * Math.sin((i / 12) * Math.PI * 2);
    // pseudo-noise from rng
    val = val + (rng() - 0.5) * noise + season + (i > n * 0.7 ? 1.2 : 0);
    const low = val * 0.9;
    const high = val * 1.1;
    arr.push({ value: Math.max(0, Math.round(val)), low, high });
  }
  return arr;
};

const Forecasting = () => {
  const [productId, setProductId] = useState('P-1001');
  const [data, setData] = useState([]);
  const [runCount, setRunCount] = useState(0);
  const [running, setRunning] = useState(false);

  // Generate series any time productId or runCount changes (deterministic per product)
  useEffect(() => {
    const seed = hashStringToSeed(`${productId}::${runCount}`);
    const rng = mulberry32(seed);
    // derive base and noise deterministically
    const base = 90 + Math.floor(rng() * 80); // 90..170
    const noise = 8 + Math.floor(rng() * 12); // 8..20
    const points = 40; // fixed horizon
    setData(generateSeries(rng, points, base, noise));
  }, [productId, runCount]);

  const runModel = () => {
    setRunning(true);
    setTimeout(() => {
      // bump runCount to create a new deterministic trajectory for same product
      setRunCount((c) => c + 1);
      setRunning(false);
    }, 500);
  };

  const stats = useMemo(() => {
    if (!data.length) return { last: 0, avg: 0, ci: '±0%' };
    const last = data[data.length - 1]?.value ?? 0;
    const avg = Math.round(data.reduce((a, b) => a + b.value, 0) / data.length);
    return { last, avg, ci: '±10%' };
  }, [data]);

  return (
    <div className="space-y-6 p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Forecasting</h2>
          <p className="text-sm text-white/70">Enter a product ID to view its demand history and prediction with confidence intervals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <Hash className="h-4 w-4 text-white/70" />
            <input
              value={productId}
              onChange={(e) => setProductId(e.target.value.trim())}
              placeholder="Enter Product ID (e.g., P-1001)"
              className="w-44 bg-transparent text-sm placeholder:text-white/40 focus:outline-none"
            />
          </div>
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white/80">
            <LineChart className="h-5 w-5 text-emerald-300" />
            <span className="text-sm">Product {productId || '—'} demand prediction</span>
          </div>
          <div className="flex gap-4 text-xs text-white/70">
            <span>
              Avg: <span className="text-white">{stats.avg}</span>
            </span>
            <span>
              Last: <span className="text-white">{stats.last}</span>
            </span>
            <span>
              CI: <span className="text-white">{stats.ci}</span>
            </span>
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
