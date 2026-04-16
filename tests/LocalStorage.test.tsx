import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('LocalStorage Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    vi.spyOn(window.localStorage, 'setItem');
    vi.spyOn(window.localStorage, 'getItem');
  });

  it('saves markdown to localStorage when it changes', async () => {
    render(<App />);
    const user = userEvent.setup();
    const editor = screen.getByPlaceholderText(/Start writing your markdown here.../i);

    await user.clear(editor);
    await user.type(editor, 'Persisted Content');

    // Wait for the save
    await waitFor(() => {
      expect(window.localStorage.setItem).toHaveBeenCalledWith('markpdf_content', 'Persisted Content');
    }, { timeout: 3000 });
  });

  it('loads markdown from localStorage on initial render', () => {
    window.localStorage.setItem('markpdf_content', 'Loaded Content');
    render(<App />);
    
    const editor = screen.getByPlaceholderText(/Start writing your markdown here.../i);
    expect(editor).toHaveValue('Loaded Content');
  });

  it('saves settings to localStorage when they change', async () => {
    render(<App />);
    const user = userEvent.setup();
    
    // Open settings
    const settingsBtn = screen.getByTitle(/Settings/i);
    await user.click(settingsBtn);

    // Change a setting (e.g., Font Family)
    const fontSelect = screen.getByLabelText(/Typography/i);
    await user.selectOptions(fontSelect, 'serif');

    await waitFor(() => {
      expect(window.localStorage.setItem).toHaveBeenCalledWith('markpdf_settings', expect.stringContaining('"fontFamily":"serif"'));
    }, { timeout: 3000 });
  });

  it('loads settings from localStorage on initial render', () => {
    const initialSettings = {
      fontFamily: 'monospace',
      fontSize: 20,
      uiTheme: 'dark'
    };
    window.localStorage.setItem('markpdf_settings', JSON.stringify(initialSettings));
    
    render(<App />);
    
    // Check if UI theme is dark
    const mainDiv = screen.getByRole('banner').parentElement;
    expect(mainDiv).toHaveClass('dark');
  });

  it('resets settings to defaults when Reset button is clicked', async () => {
    // Set some non-default settings first
    const initialSettings = {
      fontFamily: 'monospace',
      fontSize: 24,
      uiTheme: 'dark'
    };
    window.localStorage.setItem('markpdf_settings', JSON.stringify(initialSettings));
    
    render(<App />);
    const user = userEvent.setup();

    // Open settings
    const settingsBtn = screen.getByTitle(/Settings/i);
    await user.click(settingsBtn);

    // Click Reset button
    const resetBtn = screen.getByRole('button', { name: /Reset to Defaults/i });
    await user.click(resetBtn);

    // Verify localStorage was updated or cleared
    await waitFor(() => {
      const savedSettingsStr = window.localStorage.getItem('markpdf_settings');
      // If it's cleared or reset, fontFamily should be back to 'sans-serif' (default)
      if (savedSettingsStr) {
        const savedSettings = JSON.parse(savedSettingsStr);
        expect(savedSettings.fontFamily).toBe('sans-serif');
      }
    });

    // Verify UI reflected the change
    const mainDiv = screen.getByRole('banner').parentElement;
    expect(mainDiv).not.toHaveClass('dark');
  });
});
