# SurfSight Monorepo

A pnpm monorepo for SurfSight - a surf conditions dashboard application.

## Structure

```
surf-sight/
├── web-app/          # Next.js web application
├── services/         # Microservices and backend services
│   └── api/          # API service
├── libs/             # Shared libraries
│   └── shared/       # Shared utilities, config, and database setup
└── package.json      # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

Install all dependencies:

```bash
pnpm install
```

### Development

Run the web app in development mode:

```bash
pnpm dev
```

Or run a specific package:

```bash
pnpm --filter web-app dev
pnpm --filter @surf-sight/api dev
```

### Building

Build all packages:

```bash
pnpm build:all
```

Build a specific package:

```bash
pnpm --filter web-app build
```

## Packages

### `web-app`

Next.js 15 web application with App Router. Contains the main user interface.

- **Run**: `pnpm --filter web-app dev`
- **Build**: `pnpm --filter web-app build`
- **Start**: `pnpm --filter web-app start`

### `@surf-sight/api`

API microservice for handling backend logic and data processing.

- **Run**: `pnpm --filter @surf-sight/api dev`
- **Build**: `pnpm --filter @surf-sight/api build`

### `@surf-sight/shared`

Shared library containing:

- Database configuration and utilities
- Shared configuration
- Common types and utilities

Used by both services and the web-app.

## Workspace Commands

- `pnpm dev` - Run web-app in dev mode
- `pnpm build` - Build web-app
- `pnpm lint` - Lint all packages
- `pnpm build:all` - Build all packages

## Technologies

- **Web App**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Package Manager**: pnpm workspaces
- **Monorepo**: pnpm workspace

## Original Design

The original project design is available at https://www.figma.com/design/1cFcaWf7MGLHjlNinL8K0X/SurfSight-Dashboard-Design.
