# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.3](///compare/v0.1.2...v0.1.3) (2025-11-10)

### Features

- implement token refresh and migrate to cookie-based authentication 2e6b56f

### [0.1.2](///compare/v0.1.1...v0.1.2) (2025-11-09)

### Features

- add authentication pages and migrate configs to TypeScript 5f23028

### Bug Fixes

- rename commitlint config to .mjs for ES module support 9438cfa

### 0.1.1 (2025-11-09)

## [0.1.0] - 2024-XX-XX

### Added

- Initial project setup with `package.json`
- Project configuration for Next.js + React + TypeScript stack
- Package manager configuration (pnpm@10.18.3)
- Project metadata and basic structure
- Production-level Husky setup for Git hooks
- Pre-commit hook with lint-staged for code quality checks
- Commit-msg hook with Commitlint for conventional commit messages
- Pre-push hook for running tests before pushing
- Commitlint configuration with conventional commit standards
- Lint-staged configuration for staged file checks
- `.gitignore` file with standard Node.js exclusions
- Prettier configuration with production-level settings
- `.prettierrc` and `.prettierignore` files
- Prettier integration with lint-staged for pre-commit formatting
- Production-level ESLint configuration with TypeScript support
- ESLint flat config (`eslint.config.mjs`) using ESLint 9
- Integration with Next.js ESLint config
- ESLint-Prettier integration to avoid conflicts
- Comprehensive ESLint rules for code quality and best practices
- ESLint integration with lint-staged for pre-commit checks
- Production-level Jest configuration for testing
- Jest setup with TypeScript and ES module support
- Jest configuration for React/Next.js with jsdom environment
- TypeScript configuration (`tsconfig.json`) for type-aware linting
- Test scripts for development, watch mode, coverage, and CI
- Coverage thresholds set to 80% for branches, functions, lines, and statements
- Example test suite demonstrating Jest usage with React Testing Library
- Jest integration with pre-push Git hook
- Standard-version for automated version management and changelog generation
- Integrated custom fonts via app/fonts.ts for consistent typography across the app
- Set up ShadCN UI with Tailwind and configured global styles and theme support
- Created a basic login form using ShadCN UI components (Button, Input, Form, etc.)
- CHANGELOG.md for tracking version history

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- N/A

---

[0.1.0]: https://github.com/DhairyaSehgal07/coldop-frontend/releases/tag/v0.1.0
