# Contributing to MarkPDF

First off, thank you for considering contributing to MarkPDF! Contributions, issues, and feature requests are always welcome.

## Tech Stack
Before you start, it's helpful to know the technologies we use in this project:
- **Framework**: React (v19.2.0)
- **Build Tool**: Vite (v6.2.0)
- **Styling**: Tailwind CSS (v4.2.1)
- **Testing**: Vitest with React Testing Library

## Local Development Setup

To get the project running locally on your machine, follow these steps:

1. **Ensure Prerequisites**: Make sure you have Node.js installed on your machine.
2. **Fork and Clone**:
   Fork the project to your own GitHub account, then clone it locally:
   ```bash
   git clone https://github.com/dhaatrik/free-markdown-to-pdf-converter.git
   cd free-markdown-to-pdf-converter
   ```

3. **Install Dependencies**:
    ```bash
    npm install
    ```


4. **Start the Development Server**:
    ```bash
    npm run dev
    ```


Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:3000`).

## Available Scripts

Here are the useful npm scripts you can run during development:

* `npm run dev`: Starts the Vite development server.
* `npm run build`: Builds the app for production into the `dist` folder.
* `npm run preview`: Previews the production build locally.
* `npm run test`: Runs the test suite using Vitest.
* `npm run coverage`: Runs the tests and generates a test coverage report.

## Contribution Workflow

We use a standard GitHub flow for contributions:

1. **Fork the project** to your own account.
2. **Create your feature branch**: (`git checkout -b feature/AmazingFeature`).
3. **Make your changes**: Write your code and make sure to update tests as appropriate.
4. **Run tests**: Ensure all tests pass by running `npm run test`.
5. **Commit your changes**: (`git commit -m 'Add some AmazingFeature'`).
6. **Push to the branch**: (`git push origin feature/AmazingFeature`).
7. **Open a Pull Request**: Submit your PR against the main repository for review.

## Guidelines

* **Privacy First**: Ensure any new features respect the core tenet of the app: all processing must happen in the browser, and user data must never leave their device.
* **Testing**: Please include tests for any new features or bug fixes. We use `@testing-library/react` and `vitest` for our testing environment.

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.