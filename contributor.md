# Contributing to Markdown to PDF Converter

Thank you for your interest in contributing to the Markdown to PDF Converter! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Running Tests](#running-tests)
- [Building the Project](#building-the-project)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please be respectful and considerate in all interactions.

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/DhaatuTheGamer/free-markdown-to-pdf-converter.git
   cd free-markdown-to-pdf-converter
   ```
3. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- Node.js (version 20.x or later)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000` (or the URL shown in the terminal).

## Running Tests

This project uses Vitest for testing. To run the tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm run coverage
```

## Building the Project

To build the project for production:

```bash
npm run build
```

This creates a `dist` folder with the optimized build.

## Code Style

- This project uses TypeScript for type safety.
- Follow React best practices.
- Use Tailwind CSS for styling.
- Write meaningful commit messages.
- Add tests for new features.

## Submitting Changes

1. Ensure your code passes all tests and builds successfully.
2. Update documentation if necessary.
3. Commit your changes:
   ```bash
   git commit -m "Add your descriptive commit message"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Create a Pull Request on GitHub.

### Pull Request Guidelines

- Provide a clear description of the changes.
- Reference any related issues.
- Ensure CI checks pass.
- Be open to feedback and make requested changes.

## Reporting Issues

If you find a bug or have a feature request:

1. Check existing issues to avoid duplicates.
2. Use the issue templates if available.
3. Provide detailed information including:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Browser/OS information

Thank you for contributing!