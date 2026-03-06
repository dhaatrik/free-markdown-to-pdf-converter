# 📄 Markdown to PDF Converter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.1-38B2AC.svg)](https://tailwindcss.com/)

> **Turn your notes into professional PDFs instantly.**

Welcome to the **Markdown to PDF Converter**! This is a simple, free, and privacy-focused web tool that lets you write text using Markdown and convert it into a beautifully formatted PDF document. It runs entirely in your browser—no sign-ups, no installations, and no data uploads required.

## 📑 Table of Contents
- [Features](#-features)
- [Installation & Setup](#-installation--setup)
- [Usage Examples](#-usage-examples)
- [Contributing Guidelines](#-contributing-guidelines)
- [License](#-license)

## 🌟 Features
- **✍️ Live Editor**: Write in a clean, distraction-free environment with line numbers.
- **👁️ Real-time Preview**: See your document transform instantly as you type.
- **🎨 Custom Styling**: Customize fonts, text size, colors, and page margins to fit your needs.
- **💻 Syntax Highlighting**: Automatic coloring for code blocks (great for technical docs).
- **🔒 Privacy First**: All processing happens in your browser. Your data never leaves your device.
- **📱 Responsive Design & Dark Mode**: Works beautifully on desktops, tablets, and mobile phones, with a togglable dark/light theme.


## 🚀 Installation & Setup

This project is built using React, Vite, and Tailwind CSS. To run it locally on your machine, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/DhaatuTheGamer/free-markdown-to-pdf-converter.git
   cd free-markdown-to-pdf-converter
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:3000`).

### Building for Production
To build the app for production, run:
```bash
npm run build
```
This will generate a `dist` folder containing the optimized production build.

## 💡 Usage Examples

### How to use the app
1.  **Start Typing**: Use the editor pane on the left side of the screen.
2.  **Format with Toolbar**: Use the rich-text toolbar to easily insert bold text, lists, code blocks, quotes, and more.
3.  **Customize Appearance**: Click the **Settings (⚙️)** icon in the top right to adjust:
    *   **Typography**: Choose between Serif, Sans-serif, or Monospace fonts.
    *   **Colors**: Change text and background colors for your final document.
    *   **Margins**: Adjust the white space around your text.
    *   **Header/Footer**: Add custom header or footer text with dynamic page numbers.
4.  **Download**: Once satisfied with the preview on the right, click the **Export PDF** button to generate and download your file.

### Markdown Code Examples

Here is a quick cheat sheet of Markdown you can try out in the editor:

```markdown
# Heading 1 (Big Title)
## Heading 2 (Subtitle)

**Bold Text** and *Italic Text*

- Bullet list item 1
- Bullet list item 2

1. Numbered list item 1
2. Numbered list item 2

> This is a blockquote.

```javascript
// A code block with syntax highlighting
function helloWorld() {
  console.log("Hello, world!");
}
```


## 🤝 Contributing Guidelines

Contributions, issues, and feature requests are welcome! 

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please make sure to update tests as appropriate.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
