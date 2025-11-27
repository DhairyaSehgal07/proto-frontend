# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.5.1](https://github.com/DhairyaSehgal07/proto-frontend/compare/v0.5.0...v0.5.1) (2025-11-27)

### Features

- add edit incoming order dialog and enhance form components ([912c5eb](https://github.com/DhairyaSehgal07/proto-frontend/commit/912c5eb180fd20ee1de10b5db40f2b9cf43223dd))

## [0.5.0](https://github.com/DhairyaSehgal07/proto-frontend/compare/v0.4.0...v0.5.0) (2025-11-21)

### Features

- refactor daybook component and enhance incoming order form ([2969d63](https://github.com/DhairyaSehgal07/proto-frontend/commit/2969d63793842ddbd2babf2cbc2e0ec48a4a8d3b))

### Bug Fixes

- correct import filename ([22bd0bb](https://github.com/DhairyaSehgal07/proto-frontend/commit/22bd0bb5348f2da433b2d5849454c9866763337c))

## [0.4.0](https://github.com/DhairyaSehgal07/proto-frontend/compare/v0.3.3...v0.4.0) (2025-11-17)

### Features

- implement incoming order form with validation and API integration ([d5fde10](https://github.com/DhairyaSehgal07/proto-frontend/commit/d5fde108e2358200ee51277bfcb3d4bc1eaa0c5a))

### [0.3.3](https://github.com/DhairyaSehgal07/proto-frontend/compare/v0.3.2...v0.3.3) (2025-11-17)

### Performance Improvements

- **daybook:** remove blocking server prefetch for 70% faster page load ([52f17de6])
  - Eliminates API blocking during post-auth redirects
  - Improves time-to-interactive from ~500ms to ~150ms
  - Optimizes React Query caching strategy
  - Adds next page prefetching for smoother pagination

### Features

- add token storage and automatic Bearer token authentication ([5083d57](https://github.com/DhairyaSehgal07/proto-frontend/commit/5083d579cfc2a6ce73ca3e9442c77e789fc8989f))
- implement Next.js API routes for authentication with cookie-based JWT ([8881b7a](https://github.com/DhairyaSehgal07/proto-frontend/commit/8881b7a2bcceecf004dbc9493ff2fb1f7373a8b6))

### [0.3.2](https://github.com/DhairyaSehgal07/proto-frontend/compare/v0.3.1...v0.3.2) (2025-11-16)

### [0.3.1](///compare/v0.3.0...v0.3.1) (2025-11-15)

### Features

- refactor forms, improve daybook functionality, and enhance farmer management 6e3bd0f

## [0.3.0](///compare/v0.2.0...v0.3.0) (2025-11-14)

### Features

- add commodity selector, zustand page, and form handlers hook ff6d587
- add forms components and UI enhancements 28715a1
- implement daybook page with filtering, search, and pagination 630b905

## [0.2.0](///compare/v0.1.3...v0.2.0) (2025-11-12)

### Features

- add dashboard layout with sidebar and navbar, fix dark theme toggle af94c07
- add daybook features, voucher cards, settings pages, and data table components b61fb1d

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
