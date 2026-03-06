import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root') || document.createElement('div');
if (!document.getElementById('root')) document.body.appendChild(container);

const root = createRoot(container);

function Benchmark() {
  const [renders, setRenders] = useState(0);
  const [startTime, setStartTime] = useState(performance.now());
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const end = performance.now();
    if (renders > 0) {
      setTotalTime(prev => prev + (end - startTime));
    }

    if (renders < 100) {
      setTimeout(() => {
        setStartTime(performance.now());
        setRenders(r => r + 1);

        // Find the textarea and simulate typing
        const textarea = document.querySelector('textarea');
        if (textarea) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
          nativeInputValueSetter.call(textarea, textarea.value + "a");
          const event = new Event('input', { bubbles: true});
          textarea.dispatchEvent(event);
        }
      }, 0);
    } else {
      console.log(`Average render time over 100 renders: ${totalTime / 100}ms`);
      // Signal completion
      const el = document.createElement('div');
      el.id = 'benchmark-complete';
      el.textContent = `${totalTime / 100}`;
      document.body.appendChild(el);
    }
  });

  return <App />;
}

root.render(<Benchmark />);
