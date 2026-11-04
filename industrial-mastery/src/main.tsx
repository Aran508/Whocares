import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import { ProgressProvider } from './lib/progress';
import './index.css';

// Hash routing for single-file / sandboxed hosting (npm run build:artifact)
const Router = import.meta.env.VITE_HASH_ROUTER === '1' ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </Router>
  </React.StrictMode>,
);
