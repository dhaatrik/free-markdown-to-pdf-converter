
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Settings, Undo, Redo, Download, FileText, Trash2, 
  Bold, Italic, List, ListOrdered, Quote, Code, Link, Image as ImageIcon,
  Moon, Sun
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_MARKDOWN = `
# Markdown to PDF Converter

This is a modern, beautifully crafted Markdown to PDF converter. Write your Markdown on the left, and see the live preview on the right.

## Features

- **Live Preview**: See your changes in real-time.
- **PDF Export**: Download your formatted document as a high-quality PDF.
- **Syntax Support**: Handles various Markdown elements including tables and GFM.
- **Syntax Highlighting**: Code blocks are beautifully highlighted.

### Code Blocks

\`\`\`javascript
// A simple hello world function
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

> "The details are not the details. They make the design." 
> - Charles Eames

Click the **Download PDF** button to get started!
`;

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [uiTheme, setUiTheme] = useState<'light' | 'dark'>('light');
  
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const isUndoRedo = useRef(false);

  // History state for undo/redo
  const [history, setHistory] = useState<string[]>([DEFAULT_MARKDOWN]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Customization state
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#1e293b'); // slate-800
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [margin, setMargin] = useState(15); // in mm
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [pdfHeader, setPdfHeader] = useState<string>('');
  const [pdfFooter, setPdfFooter] = useState<string>('');

  // Debounced effect to save markdown changes to history
  useEffect(() => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }
    
    const handler = setTimeout(() => {
      if (markdown !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(markdown);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [markdown, history, historyIndex]);

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const handleClear = () => {
    setMarkdown('');
    editorRef.current?.focus();
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedo.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setMarkdown(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setMarkdown(history[newIndex]);
    }
  }, [history, historyIndex]);
  
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
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

  const insertText = (before: string, after: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    
    setMarkdown(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleDownloadPdf = useCallback(async () => {
    if (!previewRef.current || markdown.trim() === '') return;

    setIsGenerating(true);
    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
      });

      const originalBg = previewRef.current.style.backgroundColor;
      previewRef.current.style.backgroundColor = backgroundColor;

      const marginPt = margin * 2.83465; // 1 mm = 2.83465 pt
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const contentWidth = pdfWidth - (marginPt * 2);

      await pdf.html(previewRef.current, {
        x: marginPt,
        y: marginPt,
        width: contentWidth,
        windowWidth: previewRef.current.scrollWidth,
        autoPaging: 'text',
        html2canvas: {
          scale: contentWidth / previewRef.current.scrollWidth,
          useCORS: true,
          logging: false,
        }
      });

      const pageCount = pdf.internal.getNumberOfPages();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        const parsedHeader = pdfHeader
          .replace(/{page}/g, i.toString())
          .replace(/{pages}/g, pageCount.toString());
          
        const parsedFooter = pdfFooter
          .replace(/{page}/g, i.toString())
          .replace(/{pages}/g, pageCount.toString());

        if (parsedHeader) {
          pdf.text(parsedHeader, pdfWidth / 2, Math.max(marginPt / 2, 20), { align: 'center' });
        }
        if (parsedFooter) {
          pdf.text(parsedFooter, pdfWidth / 2, pdfHeight - Math.max(marginPt / 2, 20), { align: 'center' });
        }
      }

      pdf.save('document.pdf');

      previewRef.current.style.backgroundColor = originalBg;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [markdown, backgroundColor, margin, pdfHeader, pdfFooter]);
  
  const lineCount = React.useMemo(() => {
    let count = 0;
    let pos = markdown.indexOf('\n');
    while (pos !== -1) {
      count++;
      pos = markdown.indexOf('\n', pos + 1);
    }
    return count + 1;
  }, [markdown]);

  return (
    <div className={cn(
      "flex flex-col h-screen font-sans overflow-hidden print:h-auto print:bg-white print:overflow-visible transition-colors duration-200",
      uiTheme === 'dark' ? "bg-neutral-900 text-neutral-100 dark" : "bg-neutral-50 text-neutral-900"
    )}>
      {/* Header */}
      <header className={cn(
        "border-b px-6 py-3 flex items-center justify-between shrink-0 z-20 print:hidden transition-colors duration-200",
        uiTheme === 'dark' ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
      )}>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className={cn(
            "text-lg font-semibold hidden sm:block",
            uiTheme === 'dark' ? "text-neutral-100" : "text-neutral-800"
          )}>MarkPDF</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUiTheme(uiTheme === 'light' ? 'dark' : 'light')}
            className={cn(
              "p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500",
              uiTheme === 'dark' ? "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
            )}
            title="Toggle Dark Mode"
          >
            {uiTheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={cn(
                "p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                isSettingsOpen 
                  ? (uiTheme === 'dark' ? "bg-indigo-900/30 text-indigo-400" : "bg-indigo-50 text-indigo-600") 
                  : (uiTheme === 'dark' ? "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800")
              )}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-50 p-5",
                    uiTheme === 'dark' ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
                  )}
                >
                  <h3 className={cn(
                    "text-sm font-semibold mb-4 uppercase tracking-wider",
                    uiTheme === 'dark' ? "text-neutral-200" : "text-neutral-800"
                  )}>Document Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={cn(
                        "block text-xs font-medium mb-1",
                        uiTheme === 'dark' ? "text-neutral-400" : "text-neutral-500"
                      )}>Typography</label>
                      <select 
                        value={fontFamily} 
                        onChange={(e) => setFontFamily(e.target.value)} 
                        className={cn(
                          "w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                          uiTheme === 'dark' ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                        )}
                      >
                        <option value="sans-serif">Inter (Sans-serif)</option>
                        <option value="serif">Playfair Display (Serif)</option>
                        <option value="monospace">JetBrains Mono (Monospace)</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={cn(
                          "block text-xs font-medium mb-1",
                          uiTheme === 'dark' ? "text-neutral-400" : "text-neutral-500"
                        )}>Font Size (px)</label>
                        <input 
                          type="number" 
                          value={fontSize} 
                          onChange={(e) => setFontSize(Number(e.target.value))} 
                          className={cn(
                            "w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                            uiTheme === 'dark' ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                          )}
                        />
                      </div>
                      <div>
                        <label className={cn(
                          "block text-xs font-medium mb-1",
                          uiTheme === 'dark' ? "text-neutral-400" : "text-neutral-500"
                        )}>Margin (mm)</label>
                        <input 
                          type="number" 
                          value={margin} 
                          onChange={(e) => setMargin(Number(e.target.value))} 
                          className={cn(
                            "w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                            uiTheme === 'dark' ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={cn(
                          "block text-xs font-medium mb-1",
                          uiTheme === 'dark' ? "text-neutral-400" : "text-neutral-500"
                        )}>Text Color</label>
                        <div className={cn(
                          "flex items-center gap-2 border rounded-md px-2 py-1",
                          uiTheme === 'dark' ? "bg-neutral-800 border-neutral-700" : "bg-neutral-50 border-neutral-200"
                        )}>
                          <input 
                            type="color" 
                            value={textColor} 
                            onChange={(e) => setTextColor(e.target.value)} 
                            className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent" 
                          />
                          <span className={cn(
                            "text-xs uppercase",
                            uiTheme === 'dark' ? "text-neutral-300" : "text-neutral-600"
                          )}>{textColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className={cn(
                          "block text-xs font-medium mb-1",
                          uiTheme === 'dark' ? "text-neutral-400" : "text-neutral-500"
                        )}>Background</label>
                        <div className={cn(
                          "flex items-center gap-2 border rounded-md px-2 py-1",
                          uiTheme === 'dark' ? "bg-neutral-800 border-neutral-700" : "bg-neutral-50 border-neutral-200"
                        )}>
                          <input 
                            type="color" 
                            value={backgroundColor} 
                            onChange={(e) => setBackgroundColor(e.target.value)} 
                            className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent" 
                          />
                          <span className={cn(
                            "text-xs uppercase",
                            uiTheme === 'dark' ? "text-neutral-300" : "text-neutral-600"
                          )}>{backgroundColor}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                      <div>
                        <label className={cn(
                          "block text-xs font-medium mb-1",
                          uiTheme === 'dark' ? "text-neutral-400" : "text-neutral-500"
                        )}>PDF Header Text</label>
                        <input 
                          type="text" 
                          value={pdfHeader} 
                          onChange={(e) => setPdfHeader(e.target.value)} 
                          placeholder="e.g., Confidential Document"
                          className={cn(
                            "w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                            uiTheme === 'dark' ? "bg-neutral-800 border-neutral-700 text-neutral-200 placeholder-neutral-500" : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400"
                          )}
                        />
                      </div>
                      <div>
                        <label className={cn(
                          "block text-xs font-medium mb-1",
                          uiTheme === 'dark' ? "text-neutral-400" : "text-neutral-500"
                        )}>PDF Footer Text</label>
                        <input 
                          type="text" 
                          value={pdfFooter} 
                          onChange={(e) => setPdfFooter(e.target.value)} 
                          placeholder="e.g., Page {page} of {pages}"
                          className={cn(
                            "w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                            uiTheme === 'dark' ? "bg-neutral-800 border-neutral-700 text-neutral-200 placeholder-neutral-500" : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400"
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className={cn(
                      "pt-4 border-t flex items-center justify-between",
                      uiTheme === 'dark' ? "border-neutral-800" : "border-neutral-100"
                    )}>
                      <label className={cn(
                        "text-sm font-medium",
                        uiTheme === 'dark' ? "text-neutral-300" : "text-neutral-700"
                      )}>Code Block Theme</label>
                      <select 
                        value={theme} 
                        onChange={(e) => setTheme(e.target.value as 'light' | 'dark')} 
                        className={cn(
                          "text-sm border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                          uiTheme === 'dark' ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                        )}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    <div className={cn(
                      "pt-4 border-t flex items-center justify-between",
                      uiTheme === 'dark' ? "border-neutral-800" : "border-neutral-100"
                    )}>
                      <label className={cn(
                        "text-sm font-medium",
                        uiTheme === 'dark' ? "text-neutral-300" : "text-neutral-700"
                      )}>Show Line Numbers</label>
                      <button 
                        onClick={() => setShowLineNumbers(!showLineNumbers)}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                          showLineNumbers ? "bg-indigo-600" : (uiTheme === 'dark' ? "bg-neutral-700" : "bg-neutral-200")
                        )}
                      >
                        <span 
                          className={cn(
                            "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                            showLineNumbers ? "translate-x-5" : "translate-x-1"
                          )} 
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={cn(
            "h-6 w-px mx-1",
            uiTheme === 'dark' ? "bg-neutral-800" : "bg-neutral-200"
          )}></div>

          <button 
            onClick={handleDownloadPdf} 
            disabled={isGenerating || markdown.trim() === ''} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isGenerating ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden print:block print:overflow-visible">
        {/* Editor Pane */}
        <div className={cn(
          "flex-1 lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r relative min-h-0 min-w-0 print:hidden transition-colors duration-200",
          uiTheme === 'dark' ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
        )}>
          {/* Toolbar */}
          <div className={cn(
            "flex items-center justify-between px-4 py-2 border-b shrink-0 overflow-x-auto transition-colors duration-200",
            uiTheme === 'dark' ? "border-neutral-800 bg-neutral-900/50" : "border-neutral-100 bg-neutral-50/50"
          )}>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => insertText('**', '**')} className={cn("p-1.5 rounded transition-colors", uiTheme === 'dark' ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200")} title="Bold"><Bold className="w-4 h-4" /></button>
              <button onClick={() => insertText('*', '*')} className={cn("p-1.5 rounded transition-colors", uiTheme === 'dark' ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200")} title="Italic"><Italic className="w-4 h-4" /></button>
              <div className={cn("w-px h-4 mx-1", uiTheme === 'dark' ? "bg-neutral-700" : "bg-neutral-300")}></div>
              <button onClick={() => insertText('- ')} className={cn("p-1.5 rounded transition-colors", uiTheme === 'dark' ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200")} title="Bullet List"><List className="w-4 h-4" /></button>
              <button onClick={() => insertText('1. ')} className={cn("p-1.5 rounded transition-colors", uiTheme === 'dark' ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200")} title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
              <div className={cn("w-px h-4 mx-1", uiTheme === 'dark' ? "bg-neutral-700" : "bg-neutral-300")}></div>
              <button onClick={() => insertText('> ')} className={cn("p-1.5 rounded transition-colors", uiTheme === 'dark' ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200")} title="Quote"><Quote className="w-4 h-4" /></button>
              <button onClick={() => insertText('\`\`\`\n', '\n\`\`\`')} className={cn("p-1.5 rounded transition-colors", uiTheme === 'dark' ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200")} title="Code Block"><Code className="w-4 h-4" /></button>
              <div className={cn("w-px h-4 mx-1", uiTheme === 'dark' ? "bg-neutral-700" : "bg-neutral-300")}></div>
              <button onClick={() => insertText('[', '](url)')} className={cn("p-1.5 rounded transition-colors", uiTheme === 'dark' ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200")} title="Link"><Link className="w-4 h-4" /></button>
              <button onClick={() => insertText('![alt text](', ')')} className={cn("p-1.5 rounded transition-colors", uiTheme === 'dark' ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200")} title="Image"><ImageIcon className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-4">
              <button onClick={handleUndo} disabled={historyIndex <= 0} className={cn("p-1.5 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent", uiTheme === 'dark' ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200")} title="Undo"><Undo className="w-4 h-4" /></button>
              <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className={cn("p-1.5 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent", uiTheme === 'dark' ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200")} title="Redo"><Redo className="w-4 h-4" /></button>
              <div className={cn("w-px h-4 mx-1", uiTheme === 'dark' ? "bg-neutral-700" : "bg-neutral-300")}></div>
              <button onClick={handleClear} className={cn("p-1.5 rounded transition-colors", uiTheme === 'dark' ? "text-red-400 hover:text-red-300 hover:bg-red-900/30" : "text-red-500 hover:text-red-700 hover:bg-red-50")} title="Clear All"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Editor Area */}
          <div className={cn(
            "flex-1 flex overflow-hidden relative transition-colors duration-200",
            uiTheme === 'dark' ? "bg-neutral-900" : "bg-white"
          )}>
            {showLineNumbers && (
              <div
                ref={lineNumbersRef}
                aria-hidden="true"
                className={cn(
                  "w-12 py-4 text-right select-none font-mono text-[13px] overflow-hidden border-r shrink-0 transition-colors duration-200",
                  uiTheme === 'dark' ? "bg-neutral-900 border-neutral-800 text-neutral-600" : "bg-neutral-50 border-neutral-100 text-neutral-400"
                )}
                style={{ lineHeight: '1.6rem' }}
              >
                {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
                  <div key={i} className="pr-3">{i + 1}</div>
                ))}
              </div>
            )}
            <textarea
              ref={editorRef}
              value={markdown}
              onChange={handleMarkdownChange}
              onScroll={showLineNumbers ? handleEditorScroll : undefined}
              placeholder="Start writing your markdown here..."
              className={cn(
                "flex-1 w-full h-full p-4 resize-none focus:outline-none font-mono text-[13px] bg-transparent caret-indigo-500 overflow-auto whitespace-pre custom-scrollbar transition-colors duration-200",
                uiTheme === 'dark' ? "text-neutral-200" : "text-neutral-800"
              )}
              style={{ lineHeight: '1.6rem', tabSize: 2 }}
              spellCheck="false"
              wrap="off"
            />
          </div>
        </div>

        {/* Preview Pane */}
        <div className={cn(
          "flex-1 lg:w-1/2 overflow-y-auto p-4 sm:p-8 min-h-0 min-w-0 custom-scrollbar print:block print:w-full print:p-0 print:m-0 print:overflow-visible print:bg-transparent transition-colors duration-200",
          uiTheme === 'dark' ? "bg-neutral-950" : "bg-neutral-100/50"
        )}>
          <div 
            className={cn(
              "w-full max-w-[210mm] mx-auto shadow-sm border rounded-sm overflow-hidden transition-all duration-300 ease-in-out print:max-w-none print:shadow-none print:border-none print:m-0",
              uiTheme === 'dark' ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            )}
            style={{ minHeight: '297mm' }} // A4 aspect ratio min height
          >
            <div
              ref={previewRef}
              className="prose max-w-none print:max-w-none"
              style={{
                fontFamily: fontFamily === 'sans-serif' ? 'Inter, sans-serif' : fontFamily === 'serif' ? '"Playfair Display", serif' : '"JetBrains Mono", monospace',
                fontSize: `${fontSize}px`,
                backgroundColor: backgroundColor,
                color: textColor,
                padding: `${margin}mm`,
                minHeight: '100%',
              }}
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  img({node, src, alt, ...props}: any) {
                    if (!src) return <span className="text-neutral-400 italic border border-dashed border-neutral-300 px-2 py-1 rounded inline-block text-sm">[{alt || 'Image without URL'}]</span>;
                    return <img src={src} alt={alt} {...props} referrerPolicy="no-referrer" />;
                  },
                  code({node, inline, className, children, ...props}: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        {...props}
                        children={String(children).replace(/\\n$/, '')}
                        style={theme === 'dark' ? vscDarkPlus : coy}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.375rem',
                          fontSize: '0.85em',
                        }}
                      />
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

