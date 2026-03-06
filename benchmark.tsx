import React from 'react';
import { render } from 'react-dom/client';
import App from './App';

const container = document.createElement('div');
document.body.appendChild(container);
const root = render(<App />, container);

// We'll write a simple test for App rendering
