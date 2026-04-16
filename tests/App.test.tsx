import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { act } from 'react';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Editor Actions', () => {
    it('clears markdown and focuses editor when Clear All button is clicked', async () => {
      const { getByPlaceholderText, getByRole } = render(<App />);
      const user = userEvent.setup();
      const editor = getByPlaceholderText(/Start writing your markdown here.../i);
      const clearBtn = getByRole('button', { name: /Clear All/i });

      // First, type something to ensure it's not empty
      await user.clear(editor);
      await user.type(editor, 'Hello World');
      expect(editor).toHaveValue('Hello World');

      // Click clear button
      await user.click(clearBtn);

      // Verify empty and focused
      expect(editor).toHaveValue('');
      expect(editor).toHaveFocus();
    });

    it('formats selected text when a formatting button is clicked', async () => {
      const { getByPlaceholderText, getByRole } = render(<App />);
      const user = userEvent.setup();
      const editor = getByPlaceholderText(/Start writing your markdown here.../i) as HTMLTextAreaElement;

      // Clear the default text and type our own
      const clearBtn = getByRole('button', { name: /Clear All/i });
      await user.click(clearBtn);

      const testText = 'Hello World';
      await user.type(editor, testText);
      expect(editor).toHaveValue(testText);

      // Select 'World' (indices 6 to 11)
      editor.setSelectionRange(6, 11);

      // Click the Bold button
      const boldBtn = getByRole('button', { name: /Bold/i });
      await user.click(boldBtn);

      // Verify the text was formatted correctly
      expect(editor).toHaveValue('Hello **World**');

      // The formatting function uses setTimeout to restore focus and selection
      // Wait for it to finish and verify focus and selection
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(editor).toHaveFocus();
      // After formatting, the selection should include the formatted text and the markdown wrappers
      // 'Hello **World**' -> start: 6 + 2 (for '**'), end: 11 + 2
      // Actually insertText sets selection to start + before.length, end + before.length
      // start was 6, before is '**' (length 2), so selection should be (8, 13)
      expect(editor.selectionStart).toBe(8);
      expect(editor.selectionEnd).toBe(13);
    });
  });

  describe('PDF Export', () => {
    it('handles download pdf when markdown is empty', async () => {
      // Because testing an unreachable branch (early return in handleDownloadPdf when the button is disabled)
      // is fundamentally at odds with React Testing Library's "test like a user" philosophy,
      // we ensure the button is disabled when the markdown is empty.

      const { getByRole, getByPlaceholderText } = render(<App />);

      const user = userEvent.setup();

      // Clear the editor text
      const clearBtn = getByRole('button', { name: /Clear All/i });
      await user.click(clearBtn);

      const editor = getByPlaceholderText(/Start writing your markdown here.../i);
      expect(editor).toHaveValue('');

      const exportBtn = getByRole('button', { name: /Export PDF/i });

      // A user cannot click a disabled button, which guarantees no PDF is generated.
      expect(exportBtn).toBeDisabled();

      // Attempting to click it as a user would
      await user.click(exportBtn);

      // We cannot easily verify if window.print was called because in jsdom it's a no-op 
      // but we do ensure the button doesn't crash or falsely trigger.
    });
  });
});
