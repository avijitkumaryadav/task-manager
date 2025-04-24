// Polyfills for WebRTC
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Import other polyfills if needed
import process from 'process';
window.process = process;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)