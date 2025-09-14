import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { MarbleRace } from '@random-number-animation/core';
import { ConfigForm } from '@random-number-animation/core';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'race' | 'config'>('race');

  return (
    <div>
      <nav style={{ marginBottom: '20px' }}>
        <button onClick={() => setCurrentView('race')} style={{ marginRight: '10px' }}>
          Race
        </button>
        <button onClick={() => setCurrentView('config')}>
          Config
        </button>
      </nav>
      {currentView === 'race' ? <MarbleRace /> : <ConfigForm />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);