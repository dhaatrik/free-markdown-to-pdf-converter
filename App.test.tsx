import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as jsPDFModule from 'jspdf';
import { act } from 'react';

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn(),
  }),
}));

vi.mock('jspdf', () => {
  const saveMock = vi.fn();
  const htmlMock = vi.fn().mockResolvedValue(undefined);
  const getWidthMock = vi.fn().mockReturnValue(595.28);
  const getHeightMock = vi.fn().mockReturnValue(841.89);

  return {
    jsPDF: vi.fn().mockImplementation(() => ({
      internal: {
        pageSize: {
          getWidth: getWidthMock,
          getHeight: getHeightMock,
        },
        getNumberOfPages: vi.fn().mockReturnValue(1),
      },
      html: htmlMock,
      setFontSize: vi.fn(),
      setTextColor: vi.fn(),
      setPage: vi.fn(),
      text: vi.fn(),
      save: saveMock,
    })),
  };
});

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PDF Export', () => {
    it('handles download pdf when markdown is empty', async () => {
      // Because testing an unreachable branch (early return in handleDownloadPdf when the button is disabled)
      // is fundamentally at odds with React Testing Library's "test like a user" philosophy,
      // we ensure the button is disabled when the markdown is empty.

      render(<App />);

      const user = userEvent.setup();

      // Clear the editor text
      const clearBtn = screen.getByRole('button', { name: /Clear All/i });
      await user.click(clearBtn);

      const editor = screen.getByPlaceholderText(/Start writing your markdown here.../i);
      expect(editor).toHaveValue('');

      const exportBtn = screen.getByRole('button', { name: /Export PDF/i });

      // A user cannot click a disabled button, which guarantees no PDF is generated.
      expect(exportBtn).toBeDisabled();

      // Attempting to click it as a user would
      await user.click(exportBtn);

      // Verify no PDF generation was triggered
      expect(jsPDFModule.jsPDF).not.toHaveBeenCalled();
    });
  });
});
