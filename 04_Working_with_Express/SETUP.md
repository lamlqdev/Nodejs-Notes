# How to Set Up TypeScript with Node.js and Express

> Source: [**Aman Mittal** - LogRocket Blog](https://blog.logrocket.com/express-typescript-node/)  
> Published: March 28, 2025

---

Creating a server with TypeScript using Node.js and Express is a good alternative to using JavaScript because it makes it easier to manage complex applications. It also helps when you need to collaborate with a distributed team of developers.

In this article, we'll explore a beginner-friendly way to configure TypeScript in an Express app, and gain an understanding of the fundamental constraints that accompany it. To follow along, you should have:

- Node.js ≥ v18.x installed in your local development environment
- Access to a package manager like npm, pnpm, or Yarn
- Basic familiarity with Node.js and Express

---

## What is Express TypeScript?

"Express TypeScript" refers to using the Express framework within a TypeScript project. It involves writing your Express server code in TypeScript, leveraging type definitions (often provided via `@types/express`) to enable type checking, auto-completion, and better documentation. Essentially, it's about combining Express's flexibility with TypeScript's safety and developer tooling benefits.

## Is TypeScript good with Express?

TypeScript is a great companion for Express because it provides static typing, which can catch potential bugs during development. With TypeScript, you can define interfaces for requests, responses, and even middleware, making your Express code more predictable and maintainable. This leads to improved developer productivity and more robust applications.

## 1. Initialize the project

Start with the following:

```bash
mkdir ts-node-express && cd ts-node-express
npm init -y
```

Then install dependencies:

```bash
npm install express dotenv
npm install -D typescript tsx @types/node @types/express nodemon eslint prettier
```

The DotEnv package is used to read environment variables from a `.env` file.

The `-D`, or `--dev`, flag directs the package manager to install these libraries as development dependencies.

- **`tsx`** — Enables running TypeScript files directly with better ESM support
- **`@types/node`** — Provides TypeScript type definitions for Node.js core modules
- **`@types/express`** — Adds TypeScript type definitions for the Express framework
- `nodemon` — Automatically restarts the server when file changes are detected during development
- `eslint` — Lints the code to catch errors and enforce coding standards
- **`prettier`** — Formats the code to ensure consistent style across the project

Installing these packages will add a new `devDependencies` object to the `package.json` file, featuring version details for each package, as shown below:

```json
{
...
   "devDependencies": {
    "@types/express": "^5.0.1",
    "@types/node": "^22.13.11",
    "eslint": "^9.22.0",
    "nodemon": "^3.1.9",
    "prettier": "^3.5.3",
    "tsx": "^4.0.0",
    "typescript": "^5.8.2"
  }
}
```

## 2. Configure TypeScript

Every TypeScript project utilizes a configuration file to manage various project settings. The `tsconfig.json` file, which serves as the TypeScript configuration file, outlines these default options and offers the flexibility to modify or customize compiler settings to suit your needs.

The `tsconfig.json` file is usually placed at the project's root. To generate this file, use the following `tsc` command, initiating the TypeScript compiler:

```bash
npx tsc --init
```

Once you execute this command, you'll notice the tsconfig.json file is created at the root of your project directory.

**Important:** Update your `tsconfig.json` for ESM support without explicit `.js` extensions:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "target": "esnext"
    // ... other options
  }
}
```

Also, ensure your `package.json` includes:

```json
{
  "type": "module"
}
```

Develop this project structure:

```text
ts-node-express/
├── src/
│   ├── config/
│   │   └── config.ts        // Load and type environment variables
│   ├── controllers/
│   ├── middlewares/
│   │   └── error.middleware.ts    // Global typed error handling middleware
│   ├── models/
│   ├── routes/
│   ├── app.ts               // Express app configuration (middlewares, routes)
│   └── server.ts            // Start the server
├── .env                     // Environment variables
├── package.json             // Project scripts, dependencies, etc.
├── tsconfig.json            // TypeScript configuration
├── .eslintrc.js             // ESLint configuration
└── .prettierrc              // Prettier configuration
```

## 3. Environment configuration (typed environment variables)

**File:** `src/config/config.ts`:

```typescript
import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
};

export default config;
```

This file loads your environment variables from a `.env` file and provides type checking.

**File:** `.env`

```text
PORT=3000
NODE_ENV=development
```

## 4. Global error handling middleware

**File:** `src/middlewares/error.middleware.ts`:

```typescript
import type { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};
```

This middleware catches errors thrown in your routes/controllers and sends a consistent, type-safe JSON error response.

## 5. App setup

**File:** `src/app.ts`:

```typescript
import express from "express";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(express.json());

// Routes

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
```

## 6. Server entry point

**File:** `src/server.ts`:

```typescript
import app from "./app";
import config from "./config/config";

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
```

## Watchers and development scripts

In your `package.json`, add scripts for TypeScript compilation and automatic server restart. For example:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "nodemon --watch 'src/**/*.ts' --exec 'tsx' src/server.ts",
  },
  ...
}
```

- **`tsc --watch`** — For continuous compilation in development.
- **`nodemon`** — To automatically restart your server when files change.

Start the server:

```bash
npm run dev
```

Your Express API is now running with TypeScript.
