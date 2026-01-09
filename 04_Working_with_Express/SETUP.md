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
cd to your project directory
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

## 2. Create .gitignore file

Create a `.gitignore` file at the root to exclude unnecessary files:

```text
# Dependencies
node_modules/

# Build output
dist/

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db
```

## 3. Configure TypeScript

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
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
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

### Why don't we need `"type": "module"` in package.json?

You may notice that in the TypeScript code, we use ES module syntax (`import`/`export`), but there's no `"type": "module"` in `package.json`. This works because:

1. **When running development (`npm run dev`):**
   - The script uses `tsx watch` to run TypeScript directly with auto-reload
   - `tsx` handles `import`/`export` syntax in TypeScript without needing to compile first
   - Therefore, `"type": "module"` is not required in `package.json`

2. **When building and running production (`npm run build` + `npm start`):**
   - The TypeScript compiler (`tsc`) compiles TypeScript code to JavaScript
   - With the `"module": "commonjs"` configuration in `tsconfig.json`, TypeScript converts `import`/`export` to `require()`/`module.exports` (CommonJS)
   - The compiled JavaScript files use CommonJS, so `"type": "module"` is not needed

**In summary:** You can write TypeScript code using ES module syntax (`import`/`export`), but when running in production, Node.js will execute the compiled CommonJS code. This is a common approach when working with TypeScript and Node.js.

## 4. Configure ESLint and Prettier (Optional but Recommended)

**Install additional ESLint dependencies:**

```bash
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**File:** `.eslintrc.js`:

```javascript
module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  env: {
    node: true,
    es2022: true,
  },
};
```

**File:** `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 5. Environment configuration (typed environment variables)

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

**Create file:** `.env` at the root of your project:

```bash
touch .env
```

**File:** `.env`

```text
PORT=3000
NODE_ENV=development
```

## 6. Global error handling middleware

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

## 7. App setup

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

## 8. Server entry point

**File:** `src/server.ts`:

```typescript
import app from "./app";
import config from "./config/config";

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
```

## 9. Watchers and development scripts

In your `package.json`, add scripts for TypeScript compilation and automatic server restart:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

- **`build`** — Compiles TypeScript to JavaScript
- **`start`** — Runs the compiled JavaScript in production
- **`dev`** — Runs the server in development mode with auto-reload (using `tsx watch`)
- **`lint`** — Checks code for linting errors
- **`lint:fix`** — Automatically fixes linting errors
- **`format`** — Formats code using Prettier

Start the server:

```bash
npm run dev
```
