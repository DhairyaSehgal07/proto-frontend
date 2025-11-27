# Coldop Frontend

A modern web application for cold storage management built with Next.js, React, and TypeScript.

## Overview

Coldop is a comprehensive cold storage management system that helps manage incoming and outgoing orders, track daybook entries, manage farmers, and handle store administration tasks.

## Features

- **Authentication**: Secure login and registration with JWT token-based authentication
- **Incoming Orders**: Create and edit incoming orders with farmer details, commodities, varieties, and storage locations
- **Daybook**: View and filter daybook entries with search, pagination, and advanced filtering
- **Farmer Management**: Register and search for farmers in the system
- **Store Administration**: Comprehensive dashboard for store admin operations
- **Settings**: Manage preferences, profile, and RBAC (Role-Based Access Control)
- **Dark Mode**: Full dark theme support with theme toggle
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS and ShadCN UI components

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10.18.3+

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd coldop-frontend
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage
- `pnpm release` - Create a new release (uses standard-version)

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── forms/            # Form components
│   ├── ui/               # ShadCN UI components
│   └── ...
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── schemas/               # Zod validation schemas
├── services/              # API service hooks
├── store.ts              # Zustand store
└── types/                # TypeScript type definitions
```

## Code Quality

This project uses:

- **ESLint** for linting with Next.js and TypeScript rules
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for pre-commit checks
- **Commitlint** for conventional commit messages
- **Jest** for testing with React Testing Library

## Versioning

This project uses [standard-version](https://github.com/conventional-changelog/standard-version) for automated version management and changelog generation. See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

Private project - All rights reserved.
