import React, { useState } from 'react';
import HeroCover from './components/HeroCover';
import Sidebar from './components/Sidebar';
import NotificationBar from './components/NotificationBar';
import Dashboard from './components/Dashboard';
import Forecasting from './components/Forecasting';
import Procurement from './components/Procurement';
import InventoryOptimization from './components/InventoryOptimization';
import Anomalies from './components/Anomalies';

const App = () => {
  const [started, setStarted] = useState(false);
  const [route, setRoute] = useState('dashboard');
  const [anomalyStatus, setAnomalyStatus] = useState('normal');

  const handleStart = () => setStarted(true);

  const handleNotificationClick = () => {
    setRoute('anomalies');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-slate-950 to-black">
      {!started ? (
        <HeroCover onStart={handleStart} />
      ) : (
        <div className="flex h-screen w-full flex-col">
          <NotificationBar status={anomalyStatus} onClick={handleNotificationClick} />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <Sidebar current={route} onNavigate={setRoute} />
            <main className="min-h-0 flex-1 overflow-y-auto">
              {route === 'dashboard' && <Dashboard />}
              {route === 'forecasting' && <Forecasting />}
              {route === 'procurement' && <Procurement />}
              {route === 'inventory' && <InventoryOptimization />}
              {route === 'anomalies' && <Anomalies />}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
