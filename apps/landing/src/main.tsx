import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './index.css';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root was not found in the document.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
