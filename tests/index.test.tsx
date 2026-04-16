import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Create a mock for the render function
const mockRender = vi.fn();

// Mock react-dom/client
vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn(() => ({
      render: mockRender,
    })),
  },
}));

// Mock the App component
vi.mock('../App', () => ({
  default: () => <div data-testid="mock-app" />
}));

describe('index.tsx', () => {
  let originalDocumentBody: string;

  beforeEach(() => {
    // Save original DOM and clear it
    originalDocumentBody = document.body.innerHTML;
    document.body.innerHTML = '';

    // Clear mock histories
    vi.clearAllMocks();

    // Crucial: reset modules so index.tsx is evaluated again in each test
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original DOM
    document.body.innerHTML = originalDocumentBody;
  });

  it('throws an error if root element is not found', async () => {
    // document.body is empty, so getElementById('root') will return null
    await expect(async () => {
      await import('../index.tsx');
    }).rejects.toThrow('Could not find root element to mount to');
  });

  it('mounts the App component if root element exists', async () => {
    // Create the root element
    const rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    // Import react-dom/client to check if createRoot was called
    const ReactDOM = await import('react-dom/client');

    // Import index.tsx which should now find the root element
    await import('../index.tsx');

    // Verify createRoot was called with our element
    expect(ReactDOM.default.createRoot).toHaveBeenCalledWith(rootElement);

    // Verify render was called
    expect(mockRender).toHaveBeenCalled();
  });
});
