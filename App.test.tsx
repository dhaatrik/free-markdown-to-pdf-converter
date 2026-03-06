import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock dependencies that might cause issues in JSDOM
vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => ({
    internal: {
      pageSize: {
        getWidth: vi.fn(() => 595.28),
        getHeight: vi.fn(() => 841.89)
      },
      getNumberOfPages: vi.fn(() => 1)
    },
    html: vi.fn().mockResolvedValue(undefined),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setPage: vi.fn(),
    text: vi.fn(),
    save: vi.fn()
  }))
}));

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn(() => 'data:image/png;base64,mock')
  })
}));

// Mock react-markdown and related plugins if they cause issues
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="markdown-preview">{children}</div>
}));

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders without crashing and shows the header', () => {
    render(<App />);
    expect(screen.getByText('MarkPDF')).toBeInTheDocument();
  });

  it('contains the default markdown text in the editor', () => {
    render(<App />);
    const editor = screen.getByPlaceholderText('Start writing your markdown here...');
    expect(editor).toBeInTheDocument();
    expect((editor as HTMLTextAreaElement).value).toContain('# Markdown to PDF Converter');
  });

  it('updates the editor and preview when typing', () => {
    render(<App />);
    const editor = screen.getByPlaceholderText('Start writing your markdown here...');

    // Clear and type new text
    fireEvent.change(editor, { target: { value: '# Hello World\nThis is a test.' } });

    expect((editor as HTMLTextAreaElement).value).toBe('# Hello World\nThis is a test.');
    expect(screen.getByTestId('markdown-preview')).toHaveTextContent('# Hello World This is a test.');
  });

  it('clears the editor when the Clear All button is clicked', () => {
    render(<App />);
    const editor = screen.getByPlaceholderText('Start writing your markdown here...');

    // Change text first to ensure it is not empty
    fireEvent.change(editor, { target: { value: 'Some text to clear' } });
    expect((editor as HTMLTextAreaElement).value).toBe('Some text to clear');

    // Find and click the clear button (it has a title "Clear All")
    const clearButton = screen.getByTitle('Clear All');
    fireEvent.click(clearButton);

    expect((editor as HTMLTextAreaElement).value).toBe('');
  });

  it('toggles between light and dark themes', () => {
    const { container } = render(<App />);

    // Initially should be light mode (no 'dark' class on the main wrapper)
    const mainWrapper = container.firstChild as HTMLElement;
    expect(mainWrapper).not.toHaveClass('dark');
    expect(mainWrapper).toHaveClass('bg-neutral-50'); // light theme class

    // Find and click the theme toggle button
    const themeToggle = screen.getByTitle('Toggle Dark Mode');
    fireEvent.click(themeToggle);

    // Should now have dark mode classes
    expect(mainWrapper).toHaveClass('dark');
    expect(mainWrapper).toHaveClass('bg-neutral-900'); // dark theme class

    // Click again to switch back
    fireEvent.click(themeToggle);

    // Should be light mode again
    expect(mainWrapper).not.toHaveClass('dark');
  });

  it('opens and closes the settings panel', async () => {
    render(<App />);

    // Settings panel should not be visible initially
    expect(screen.queryByText('Document Settings')).not.toBeInTheDocument();

    // Find and click the settings button
    const settingsButton = screen.getByTitle('Settings');
    fireEvent.click(settingsButton);

    // Settings panel should now be visible
    expect(screen.getByText('Document Settings')).toBeInTheDocument();

    // Check if some specific settings are present
    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByText('Show Line Numbers')).toBeInTheDocument();

    // Click settings button again to close
    fireEvent.click(settingsButton);

    // Wait for the panel to disappear (since it has an AnimatePresence exit animation)
    await waitFor(() => {
      expect(screen.queryByText('Document Settings')).not.toBeInTheDocument();
    });
  });

  it('handles toolbar formatting actions (bold text)', () => {
    render(<App />);
    const editor = screen.getByPlaceholderText('Start writing your markdown here...') as HTMLTextAreaElement;

    // First clear the editor
    fireEvent.change(editor, { target: { value: '' } });

    // Simulate setting cursor position and clicking the Bold button
    editor.focus();
    editor.setSelectionRange(0, 0);

    const boldButton = screen.getByTitle('Bold');
    fireEvent.click(boldButton);

    // After clicking bold, it should insert **** and place cursor between them
    expect(editor.value).toBe('****');
  });
});
