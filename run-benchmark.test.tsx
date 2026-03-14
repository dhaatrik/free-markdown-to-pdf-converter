import { test } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App from './App';

test('benchmark typing', () => {
  const { getByPlaceholderText } = render(<App />);
  const textarea = getByPlaceholderText(/Start writing your markdown here/);

  const start = performance.now();
  for(let i=0; i<100; i++) {
    fireEvent.change(textarea, { target: { value: textarea.value + 'a' } });
  }
  const end = performance.now();
  console.log(`Time taken for 100 character insertions: ${(end - start).toFixed(2)}ms`);
});
