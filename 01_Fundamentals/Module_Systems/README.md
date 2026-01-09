# Module Systems

Node.js supports two module systems: CommonJS (the original system) and ES Modules (the modern standard). Understanding both systems and when to use each is essential for Node.js development.

---

## Core Terminology

### What are Modules?

In Node.js Application, a **Module** can be considered as a block of code that provide a simple or complex functionality that can communicate with external application. Modules can be organized in a single file or a collection of multiple files/folders. Almost all programmers prefer modules because of their reusability throughout the application and ability to reduce the complexity of code into smaller pieces.

Types of Modules: In Nodejs, there is 3 type of modules namely

- **Core Modules**: These are built-in modules such as http, fs, path, etc.
- **Local Modules**: These are modules that are created by the developer for the specific application.
- **Third-Party Modules**: Third-party modules can be installed from the NPM (Node Package Manager) available online.

### CommonJS (CJS)

**CommonJS** is the original module system in Node.js. It uses `require()` to import modules and `module.exports` or `exports` to export functionality.

**Export syntax:**

```javascript
// Single export
module.exports = function () {
  /* ... */
};

// Multiple exports
module.exports = {
  function1: function () {
    /* ... */
  },
  function2: function () {
    /* ... */
  },
};

// Using exports shortcut
exports.function1 = function () {
  /* ... */
};
exports.function2 = function () {
  /* ... */
};
```

**Import syntax:**

```javascript
// Import entire module
const module = require("./module");

// Import specific exports (destructuring)
const { function1, function2 } = require("./module");
```

### ES Modules (ESM)

**ES Modules** is the modern JavaScript standard for modules, originally designed for browsers but now supported in Node.js.

**Export syntax:**

```javascript
// Named exports
export function function1() { /* ... */ }
export const constant = 'value';

// Default export
export default function() { /* ... */ }

// Mixed exports
export function function1() { /* ... */ }
export default class MyClass { /* ... */ }
```

**Import syntax:**

```javascript
// Named imports
import { function1, constant } from "./module.js";

// Default import
import MyClass from "./module.js";

// Mixed imports
import MyClass, { function1, constant } from "./module.js";

// Import all
import * as module from "./module.js";
```

### Differences Between CommonJS and ES Modules

| Aspect             | CommonJS                       | ES Modules                   |
| ------------------ | ------------------------------ | ---------------------------- |
| Syntax             | `require()` / `module.exports` | `import` / `export`          |
| Loading            | Synchronous                    | Asynchronous                 |
| Resolution         | Runtime                        | Compile-time (static)        |
| File extension     | `.js` or `.cjs`                | `.mjs` or `"type": "module"` |
| Top-level await    | Not supported                  | Supported                    |
| Tree-shaking       | Limited                        | Full support                 |
| Default in Node.js | Yes                            | No (requires configuration)  |
