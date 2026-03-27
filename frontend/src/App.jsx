import React from 'react';
import 'golden-layout/dist/css/goldenlayout-base.css';
import 'golden-layout/dist/css/themes/goldenlayout-light-theme.css';
import Dashboard from './components/Dashboard';
import './styles/app.css';

function App() {
  return (
    <div className="app">
      <Dashboard />
    </div>
  );
}

export default App;
