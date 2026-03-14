import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { act } from '@testing-library/react';

vi.mock('./App', () => ({
  default: () => <textarea defaultValue="test" />
}));

describe('measure.tsx', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.resetModules();
  });

  it('runs the benchmark correctly and interacts with textarea if present', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);

    // We mock querySelector to return a mock textarea element
    // This allows us to hit the branch `if (textarea)` without actually triggering
    // a real jsdom event on a React-managed textarea which can cause memory leaks.
    const mockTextarea = {
        value: 'initial',
        dispatchEvent: vi.fn(),
    };
    const querySelectorMock = vi.spyOn(document, 'querySelector').mockImplementation((sel) => {
        if (sel === 'textarea') return mockTextarea as any as HTMLTextAreaElement;
        return null;
    });

    const mockSet = vi.fn();
    const originalDescriptor = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
    if (originalDescriptor) {
      Object.defineProperty(window.HTMLTextAreaElement.prototype, 'value', {
        set: mockSet,
        get: () => 'test',
        configurable: true,
      });
    } else {
        Object.defineProperty(window.HTMLTextAreaElement.prototype, 'value', {
            set: mockSet,
            get: () => 'test',
            configurable: true,
        });
    }

    // Dynamic import to execute measure.tsx after DOM setup
    await act(async () => {
        await import('./measure.tsx');
    });

    for(let i=0; i<105; i++) {
        await act(async () => {
            vi.runOnlyPendingTimers();
        });
    }

    const completeDiv = document.getElementById('benchmark-complete');
    expect(completeDiv).toBeInTheDocument();

    // Check that we interacted with textarea
    expect(mockTextarea.dispatchEvent).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalled();

    querySelectorMock.mockRestore();
    if (originalDescriptor) {
        Object.defineProperty(window.HTMLTextAreaElement.prototype, 'value', originalDescriptor);
    }
  });

  it('runs without textarea successfully', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);

    const querySelectorMock = vi.spyOn(document, 'querySelector').mockReturnValue(null);

    await act(async () => {
        await import('./measure.tsx?no-textarea');
    });

    for(let i=0; i<105; i++) {
        await act(async () => {
            vi.runOnlyPendingTimers();
        });
    }

    const completeDiv = document.getElementById('benchmark-complete');
    expect(completeDiv).toBeInTheDocument();

    querySelectorMock.mockRestore();
  });

  it('handles missing root element', async () => {
    document.body.innerHTML = ''; // no root

    vi.spyOn(performance, 'now').mockReturnValue(1000);
    const querySelectorMock = vi.spyOn(document, 'querySelector').mockReturnValue(null);

    await act(async () => {
        await import('./measure.tsx?no-root');
    });

    for(let i=0; i<105; i++) {
        await act(async () => {
            vi.runOnlyPendingTimers();
        });
    }

    const completeDiv = document.getElementById('benchmark-complete');
    expect(completeDiv).toBeInTheDocument();

    querySelectorMock.mockRestore();
  });
});
