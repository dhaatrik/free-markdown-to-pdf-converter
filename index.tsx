
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * The main entry point for the React application.
 * It finds the root DOM element and renders the `App` component into it.
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/**
 * Creates a React root for the provided `rootElement`.
 * The root is then used to render the main `App` component.
 * @type {ReactDOM.Root}
 */
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
