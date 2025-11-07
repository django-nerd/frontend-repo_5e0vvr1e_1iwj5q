import React from 'react';
import Spline from '@splinetool/react-spline';
import { Rocket } from 'lucide-react';

const HeroCover = ({ onStart }) => {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/LU2mWMPbF3Qi1Qxh/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center text-white">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
          <Rocket className="h-4 w-4 text-emerald-300" />
          <span className="tracking-wide">Smart Supply Chain Studio</span>
        </div>
        <h1 className="mt-6 text-4xl font-semibold leading-tight md:text-6xl">
          Forecast, Procure, and Optimize
          <span className="block text-emerald-300">with Confidence</span>
        </h1>
        <p className="mt-4 max-w-2xl text-white/80">
          A colorful, modern workspace to load data, forecast demand, generate procurement plans,
          optimize inventory, and detect anomalies — all in one minimal, hackathon‑friendly UI.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 font-medium text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
          >
            <Rocket className="h-5 w-5" /> Start Application
          </button>
          <a
            href="#learn-more"
            className="rounded-lg bg-white/10 px-5 py-3 font-medium text-white backdrop-blur transition hover:bg-white/20"
          >
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroCover;
