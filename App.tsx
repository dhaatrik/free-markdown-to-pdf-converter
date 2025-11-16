
import React, { useState, useRef, useCallback, useEffect } from 'react';

// TypeScript type declarations for libraries loaded from CDN
declare global {
  interface Window {
    marked: {
      parse: (markdown: string) => string;
    };
    jspdf: any;
    html2canvas: any;
    Prism: {
      highlightAll: () => void;
    };
  }
}

const DEFAULT_MARKDOWN = `
# Markdown to PDF Converter

This is a demo of the Markdown to PDF converter. You can write your own Markdown on the left, and see the live preview on the right.

## Features

- **Live Preview**: See your changes in real-time.
- **PDF Export**: Download your formatted document as a PDF.
- **Syntax Support**: Handles various Markdown elements.
- **Syntax Highlighting**: Code blocks are now highlighted!

### Code Blocks

\`\`\`javascript
/**
 * A simple hello world function to demonstrate code highlighting.
 * It logs a greeting message to the console.
 */
function helloWorld() {
  console.log("Hello, world!");
}
\`\`\`

### Tables

| Feature         | Status      | Priority |
|-----------------|-------------|----------|
| Markdown Parsing| Implemented | High     |
| PDF Generation  | Implemented | High     |
| UI Design       | Implemented | Medium   |
| Cloud Storage   | Future      | Low      |

### Lists

1.  First ordered list item
2.  Another item
    - Unordered sub-list.
1.  Actual numbers don't matter, just that it's a number
    1.  Ordered sub-list

### Blockquotes

> "The only way to do great work is to love what you do." 
> - Steve Jobs

Click the **Download PDF** button to get started!
`;

/**
 * A React functional component that renders an animated SVG spinner icon.
 * This component is used to indicate a loading or processing state.
 *
 * @param {object} props - The properties for the component.
 * @param {string} [props.className] - Optional additional CSS classes to apply to the SVG element.
 * @returns {React.ReactElement} The SVG spinner icon.
 */
const SpinnerIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

/**
 * A React functional component that renders a settings (gear) icon.
 *
 * @param {object} props - The properties for the component.
 * @param {string} [props.className] - Optional additional CSS classes to apply to the SVG element.
 * @returns {React.ReactElement} The SVG settings icon.
 */
const SettingsIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.242 1.417l-1.072.93c-.12.104-.19.252-.19.41v.838c0 .158.07.306.19.41l1.072.93a1.125 1.125 0 01.242 1.417l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.242-1.417l1.072-.93c.12-.104.19-.252.19-.41v-.838c0-.158-.07-.306-.19-.41l-1.072-.93a1.125 1.125 0 01-.242-1.417l1.296-2.247a1.125 1.125 0 011.37.49l1.217.456c.355.133.75.072 1.075-.124.073-.044.146-.087.22-.127.332-.183.582-.495.645.87l.213-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

/**
 * A React functional component that renders an undo icon.
 *
 * @param {object} props - The properties for the component.
 * @param {string} [props.className] - Optional additional CSS classes to apply to the SVG element.
 * @returns {React.ReactElement} The SVG undo icon.
 */
const UndoIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

/**
 * A React functional component that renders a redo icon.
 *
 * @param {object} props - The properties for the component.
 * @param {string} [props.className] - Optional additional CSS classes to apply to the SVG element.
 * @returns {React.ReactElement} The SVG redo icon.
 */
const RedoIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
  </svg>
);

/**
 * A React functional component that renders a download icon.
 *
 * @param {object} props - The properties for the component.
 * @param {string} [props.className] - Optional additional CSS classes to apply to the SVG element.
 * @returns {React.ReactElement} The SVG download icon.
 */
const DownloadIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

/**
 * A React functional component that renders a document text icon.
 *
 * @param {object} props - The properties for the component.
 * @param {string} [props.className] - Optional additional CSS classes to apply to the SVG element.
 * @returns {React.ReactElement} The SVG document text icon.
 */
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

/**
 * The main application component for the Markdown to PDF converter.
 * It manages the state for the editor, preview, and PDF generation settings.
 *
 * @returns {React.ReactElement} The fully rendered application UI.
 */
const App: React.FC = () => {
  /**
   * @state {string} markdown - The current Markdown text in the editor.
   */
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  /**
   * @state {boolean} isGenerating - A flag to indicate if a PDF is currently being generated.
   */
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  /**
   * @state {boolean} showLineNumbers - A flag to determine if line numbers should be displayed in the editor.
   */
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  
  /**
   * @ref {React.RefObject<HTMLDivElement>} previewRef - A ref to the live preview container element.
   */
  const previewRef = useRef<HTMLDivElement>(null);
  /**
   * @ref {React.RefObject<HTMLTextAreaElement>} editorRef - A ref to the main textarea editor element.
   */
  const editorRef = useRef<HTMLTextAreaElement>(null);
  /**
   * @ref {React.RefObject<HTMLDivElement>} lineNumbersRef - A ref to the line numbers display element.
   */
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  /**
   * @ref {React.MutableRefObject<boolean>} isUndoRedo - A ref to track if the current state change is due to an undo/redo action,
   * used to prevent the debounced history update from firing.
   */
  const isUndoRedo = useRef(false);

  /**
   * @state {string[]} history - An array storing the history of markdown states for undo/redo functionality.
   */
  const [history, setHistory] = useState<string[]>([DEFAULT_MARKDOWN]);
  /**
   * @state {number} historyIndex - The current index in the history array.
   */
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  /**
   * @state {string} fontFamily - The font family for the PDF preview.
   */
  const [fontFamily, setFontFamily] = useState('sans-serif');
  /**
   * @state {number} fontSize - The font size in pixels for the PDF preview.
   */
  const [fontSize, setFontSize] = useState(16);
  /**
   * @state {string} textColor - The text color for the PDF preview.
   */
  const [textColor, setTextColor] = useState('#334155'); // slate-700
  /**
   * @state {string} backgroundColor - The background color for the PDF preview.
   */
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  /**
   * @state {number} margin - The page margin in millimeters for the PDF output.
   */
  const [margin, setMargin] = useState(15); // in mm

  /**
   * A debounced effect that saves changes to the markdown content into the history state.
   * This allows for undo/redo functionality. It waits for 500ms of inactivity before saving.
   * It skips saving if the change was triggered by an undo or redo action itself.
   */
  useEffect(() => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }

    const handler = setTimeout(() => {
      // Check if the markdown has changed since the timeout was set
      if (markdown !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(markdown);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 500); // 500ms debounce delay

    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(handler);
    };
  }, [markdown, history, historyIndex]);

  /**
   * Handles changes to the textarea element and updates the markdown state.
   *
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - The textarea change event.
   */
  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  /**
   * Clears the markdown content from the editor.
   */
  const handleClear = () => {
    setMarkdown('');
  };

  /**
   * A memoized callback to handle the "undo" action.
   * It reverts the markdown state to the previous entry in the history.
   */
  const handleUndo = useCallback(() => {
    const hasUncommittedChanges = markdown !== history[historyIndex];

    if (historyIndex > 0) {
      isUndoRedo.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setMarkdown(history[newIndex]);
    } else if (hasUncommittedChanges) {
      isUndoRedo.current = true;
      setMarkdown(history[0]);
    }
  }, [markdown, history, historyIndex]);

  /**
   * A memoized callback to handle the "redo" action.
   * It advances the markdown state to the next entry in the history.
   */
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setMarkdown(history[newIndex]);
    }
  }, [history, historyIndex]);
  
  /**
   * Synchronizes the scroll position of the line numbers with the editor's scroll position.
   *
   * @param {React.UIEvent<HTMLTextAreaElement>} e - The scroll event from the textarea.
   */
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  /**
   * An effect that sets up keyboard shortcuts for undo (Ctrl/Cmd + Z) and redo (Ctrl/Cmd + Y).
   * It attaches a keydown event listener to the editor.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    
    const editorEl = editorRef.current;
    editorEl?.addEventListener('keydown', handleKeyDown);
    
    return () => {
      editorEl?.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  /**
   * A memoized callback that handles the PDF generation and download process.
   * It uses `html2canvas` to capture the preview content and `jsPDF` to create a downloadable PDF.
   * The function is asynchronous and sets the `isGenerating` state during execution.
   */
  const handleDownloadPdf = useCallback(async () => {
    if (!previewRef.current || markdown.trim() === '') return;

    setIsGenerating(true);
    try {
      const { jsPDF } = window.jspdf;
      const canvas = await window.html2canvas(previewRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: backgroundColor,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const marginValue = margin;
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const ratio = canvasWidth / canvasHeight;
      const imgWidth = pdfWidth - (marginValue * 2);
      const imgHeight = imgWidth / ratio;
      
      let heightLeft = imgHeight;
      let position = marginValue;

      pdf.addImage(imgData, 'PNG', marginValue, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - (marginValue * 2));

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + marginValue;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', marginValue, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - (marginValue * 2));
      }
      
      pdf.save('markdown-export.pdf');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [markdown, fontFamily, fontSize, textColor, backgroundColor, margin]);
  
  /**
   * Parses the current markdown string into HTML using the `marked` library.
   * @type {string}
   */
  const parsedHtml = window.marked.parse(markdown);

  /**
   * An effect that triggers syntax highlighting using Prism.js whenever the parsed HTML changes.
   */
  useEffect(() => {
    if (window.Prism) {
      window.Prism.highlightAll();
    }
  }, [parsedHtml]);

  /**
   * Calculates the number of lines in the current markdown content.
   * @type {number}
   */
  const lineCount = markdown.split('\n').length;

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-50 text-slate-800">
      <style>{`
        .prose tbody td, .prose thead th { color: ${textColor}; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; border-radius: 0.375rem; }
        input[type="color"] { -webkit-appearance: none; -moz-appearance: none; appearance: none; background-color: transparent; }
      `}</style>

      <header className="bg-slate-800 shadow-lg p-4 flex items-center justify-between z-10 text-white shrink-0">
        <div className="flex items-center gap-3">
          <DocumentTextIcon className="w-8 h-8 text-sky-400" />
          <h1 className="text-xl md:text-2xl font-bold text-white hidden sm:block">Markdown to PDF</h1>
        </div>
        <div className="flex items-center space-x-2">
          <details className="relative" title="Settings">
            <summary className="cursor-pointer list-none p-2 text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400">
              <SettingsIcon className="w-5 h-5" />
            </summary>
            <div className="absolute right-0 mt-2 w-72 bg-slate-700 rounded-lg shadow-xl z-20 p-4 border border-slate-600 text-slate-300">
              <div className="space-y-4">
                <div>
                  <label htmlFor="font-family" className="block text-sm font-medium mb-1">Font Family</label>
                  <select id="font-family" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base bg-slate-800 border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                    <option value="sans-serif">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                    <option value="'Courier New', Courier, monospace">Courier New</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="font-size" className="block text-sm font-medium mb-1">Font Size (px)</label>
                  <input type="number" id="font-size" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="block w-full bg-slate-800 border-slate-600 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="text-color" className="block text-sm font-medium">Text Color</label>
                  <input type="color" id="text-color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-8 p-0 border-none rounded-md cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="bg-color" className="block text-sm font-medium">Background</label>
                  <input type="color" id="bg-color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-8 p-0 border-none rounded-md cursor-pointer" />
                </div>
                <div>
                  <label htmlFor="margin" className="block text-sm font-medium mb-1">Page Margin (mm)</label>
                  <input type="number" id="margin" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="block w-full bg-slate-800 border-slate-600 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-600 mt-4">
                  <label htmlFor="show-line-numbers" className="block text-sm font-medium">Line Numbers</label>
                  <input type="checkbox" id="show-line-numbers" checked={showLineNumbers} onChange={(e) => setShowLineNumbers(e.target.checked)} className="h-4 w-4 text-sky-500 bg-slate-800 border-slate-600 rounded focus:ring-sky-500 cursor-pointer" />
                </div>
              </div>
            </div>
          </details>
          <button onClick={handleUndo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)" className="p-2 text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed">
            <UndoIcon className="w-5 h-5" />
          </button>
          <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Y)" className="p-2 text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed">
            <RedoIcon className="w-5 h-5" />
          </button>
          <button onClick={handleClear} className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400">
            Clear
          </button>
          <button onClick={handleDownloadPdf} disabled={isGenerating || markdown.trim() === ''} title={isGenerating ? "Generating PDF..." : "Download PDF"} className="px-4 py-2 text-sm font-bold text-white bg-sky-600 rounded-md hover:bg-sky-500 disabled:bg-sky-400/50 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center min-w-[100px]">
            {isGenerating ? (
                <SpinnerIcon className="w-5 h-5" />
            ) : (
              <span className='flex items-center gap-2'><DownloadIcon className="w-5 h-5" /> PDF</span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="h-full flex flex-row overflow-hidden bg-slate-900 border-r border-slate-700">
          {showLineNumbers && (
            <div
              ref={lineNumbersRef}
              aria-hidden="true"
              className="w-14 p-4 md:p-6 text-right text-slate-600 select-none font-mono text-sm overflow-y-hidden custom-scrollbar"
              style={{ lineHeight: '1.5rem' }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <textarea
            ref={editorRef}
            value={markdown}
            onChange={handleMarkdownChange}
            onScroll={showLineNumbers ? handleEditorScroll : undefined}
            placeholder="Type your Markdown here..."
            className="flex-1 h-full p-4 md:p-6 resize-none focus:outline-none font-mono text-sm bg-transparent text-slate-300 custom-scrollbar caret-sky-400"
            style={{ lineHeight: '1.5rem' }}
            spellCheck="false"
          />
        </div>

        <div className="h-full overflow-y-auto" style={{ backgroundColor }}>
          <div
            ref={previewRef}
            className="prose prose-sm sm:prose lg:prose-base max-w-none p-4 md:p-8"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              backgroundColor: backgroundColor,
              color: textColor,
              maxWidth: '210mm', // A4 width
              '--tw-prose-body': textColor,
              '--tw-prose-headings': textColor,
              '--tw-prose-lead': textColor,
              '--tw-prose-links': textColor,
              '--tw-prose-bold': textColor,
              '--tw-prose-counters': textColor,
              '--tw-prose-bullets': textColor,
              '--tw-prose-quotes': textColor,
              '--tw-prose-captions': textColor,
              '--tw-prose-code': textColor,
            } as React.CSSProperties}
          >
            <div dangerouslySetInnerHTML={{ __html: parsedHtml }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
