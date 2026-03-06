import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { jsPDF } from 'jspdf';

// Mock jsPDF
vi.mock('jspdf', () => {
  return {
    jsPDF: vi.fn().mockImplementation(function() {
      return {
        internal: {
          pageSize: {
            getWidth: vi.fn().mockReturnValue(595.28), // A4 width in pt
            getHeight: vi.fn().mockReturnValue(841.89), // A4 height in pt
          },
          getNumberOfPages: vi.fn().mockReturnValue(1),
        },
        html: vi.fn().mockImplementation(() => {
          return Promise.reject(new Error('Mock PDF generation error'));
        }),
        setFontSize: vi.fn(),
        setTextColor: vi.fn(),
        setPage: vi.fn(),
        text: vi.fn(),
        save: vi.fn(),
      };
    }),
  };
});

// Mock html2canvas
vi.mock('html2canvas', () => {
  return {
    default: vi.fn().mockResolvedValue(document.createElement('canvas')),
  };
});

describe('App', () => {
  let consoleErrorSpy: any;
  let windowAlertSpy: any;

  beforeEach(() => {
    // Spy on console.error and window.alert
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(function() {});
    windowAlertSpy = vi.spyOn(window, 'alert').mockImplementation(function() {});
  });

  afterEach(() => {
    // Restore mocks
    consoleErrorSpy.mockRestore();
    windowAlertSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<App />);
    expect(screen.getByText('MarkPDF')).toBeInTheDocument();
  });

  it('handles PDF generation error gracefully', async () => {
    render(<App />);

    // Find the export button
    const exportButton = screen.getByRole('button', { name: /Export PDF/i });
    expect(exportButton).toBeInTheDocument();

    // Check it's not disabled
    expect(exportButton).not.toBeDisabled();

    // Click the button to trigger PDF generation
    fireEvent.click(exportButton);

    // Wait for the async PDF generation (and our mocked error) to process
    await waitFor(() => {
      // Expect console.error to be called
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error generating PDF:',
        expect.any(Error)
      );

      // Expect window.alert to be called
      expect(windowAlertSpy).toHaveBeenCalledWith(
        'An error occurred while generating the PDF. Please try again.'
      );
    });

    // Check if the finally block is executed: isGenerating is set back to false
    // Since isGenerating controls the text, let's verify it goes back to Export PDF
    expect(screen.getByRole('button', { name: /Export PDF/i })).toBeInTheDocument();
  });
});