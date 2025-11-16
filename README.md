# 📄 Markdown to PDF Converter

A simple and elegant web application to convert your Markdown text into a downloadable, professionally styled PDF file. It features a live preview, syntax highlighting for code, and a range of customization options to make your documents look exactly the way you want.

## ✨ Features

- **✍️ Live Editor**: A clean, distraction-free editor with optional line numbers.
- **👁️ Real-time Preview**: Instantly see how your Markdown will look as a formatted document.
- **🎨 PDF Customization**: Easily change the font family, font size, text color, background color, and page margins for your PDF output.
- **💻 Code Syntax Highlighting**: Code blocks are automatically highlighted for improved readability, powered by Prism.js.
- **🔄 Undo/Redo Support**: Quickly undo and redo changes in the editor with buttons or keyboard shortcuts (Ctrl/Cmd + Z, Ctrl/Cmd + Y).
- **🚀 Fast PDF Generation**: Converts your formatted content into a high-quality PDF in your browser using `jspdf` and `html2canvas`.
- **📱 Responsive Design**: Works beautifully on desktops, tablets, and mobile devices.
- **🆓 Completely Free**: No ads, no sign-ups. Use it online or run it on your own computer for free.

## 🛠️ Tech Stack

This project is built with modern web technologies and does not require a complex backend or build process.

- **Frontend Framework**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Markdown Parsing**: [Marked.js](https://marked.js.org/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)
- **Syntax Highlighting**: [Prism.js](https://prismjs.com/) - For highlighting code blocks within the Markdown preview.

## 📂 File Structure

The repository is structured to be clean and easy to navigate:

```
.
├── 📄 index.html        # The main HTML file that hosts the React app.
├── 📁 src/
│   ├── ⚛️ App.tsx         # The main React component containing all the UI and logic.
│   └── 🎬 index.tsx        # The entry point for the React application.
├── 📦 package.json        # Lists project dependencies and scripts.
├── vite.config.ts     # Configuration file for Vite.
└── README.md          # This file, providing an overview of the project.
```

## 🚀 How to Use (Online)

Using the web app is straightforward:

1.  **Write Markdown**: Type or paste your Markdown text into the editor pane on the left.
2.  **Preview**: See the formatted output appear instantly in the preview pane on the right.
3.  **Customize (Optional)**: Click the **Settings** (⚙️) icon to adjust fonts, colors, and margins.
4.  **Download**: Click the **Download PDF** button to generate and save your document.

## 💻 How to Run Locally

To run this project on your local machine, you'll need to have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) (which comes with Node.js) installed.

### Step 1: Get the Code

First, you need to get the project files onto your computer.

**Option A: Download ZIP**
1.  Go to the project's repository page (e.g., on GitHub).
2.  Click the green `<> Code` button and select **Download ZIP**.
3.  Unzip the downloaded file.

**Option B: Clone with Git (Recommended)**
If you have Git installed, open your terminal and run:
```bash
git clone <repository-url>
```

### Step 2: Install Dependencies

Navigate into the project folder you just downloaded or cloned and install the necessary dependencies using npm:

```bash
cd <project-folder>
npm install
```

### Step 3: Start the Development Server

Once the dependencies are installed, you can start the local development server:

```bash
npm run dev
```

This command will start the Vite development server and provide you with a local URL (usually `http://localhost:5173`) that you can open in your web browser to see the application running. The server supports hot-reloading, so any changes you make to the code will be reflected in the browser instantly.

---

Enjoy creating beautiful documents!
