import React from 'react';

const statusConfig = {
  normal: {
    label: 'No anomalies detected',
    emoji: '✅',
    classes: 'bg-emerald-500 text-white',
  },
  warning: {
    label: 'Warnings detected',
    emoji: '⚠️',
    classes: 'bg-amber-400 text-black',
  },
  critical: {
    label: 'Critical anomalies',
    emoji: '🔴',
    classes: 'bg-red-600 text-white',
  },
};

const NotificationBar = ({ status = 'normal', onClick }) => {
  const cfg = statusConfig[status] ?? statusConfig.normal;
  return (
    <button
      onClick={onClick}
      className={`sticky top-0 z-40 flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-medium shadow ${cfg.classes}`}
    >
      <span>{cfg.emoji}</span>
      <span>{cfg.label}</span>
    </button>
  );
};

export default NotificationBar;
