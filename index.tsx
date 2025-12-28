
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Error: Root element '#root' not found in DOM.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Morrigan Kernel: UI Mounted successfully.");
  } catch (error) {
    console.error("Morrigan Kernel: Fatal initialization error:", error);
    rootElement.innerHTML = `<div style="color: white; padding: 20px; font-family: sans-serif;">
      <h1 style="color: #ff3b30;">SYSTEM_HALT</h1>
      <p>An initialization error occurred. Check browser console for logs.</p>
    </div>`;
  }
}
