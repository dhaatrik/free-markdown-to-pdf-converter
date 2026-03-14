
import '@testing-library/jest-dom';

describe('measure.tsx benchmark', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it('runs benchmark correctly and simulates rendering 100 times', async () => {
    // 1. Initialize empty body to test root creation logic
    document.body.innerHTML = '';

    // 2. Dynamically import the file which triggers the benchmark
    await import('./measure');

    // 3. Root should be created and appended to document
    const root = document.querySelector('div');
    expect(root).toBeInTheDocument();

    // 4. Simulate the complex async timeout loop for 100 renders
    // Loop slightly more than 100 times to ensure we catch the completion callback
    for (let i = 0; i < 110; i++) {
        await vi.runOnlyPendingTimersAsync();
    }

    // 5. Assert that the #benchmark-complete element is attached to the document body
    const completeEl = document.getElementById('benchmark-complete');
    expect(completeEl).toBeInTheDocument();

    // Also assert that the completed result is a number as totalTime / 100
    expect(Number(completeEl?.textContent)).toBeGreaterThanOrEqual(0);
  }, 10000);
});
