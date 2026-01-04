# Module Systems

Node.js supports two module systems: CommonJS (the original system) and ES Modules (the modern standard). Understanding both systems and when to use each is essential for Node.js development.

---

## Core Terminology

### What are Modules?

A **module** is a self-contained piece of code that can be exported and imported in other files. Modules help organize code into reusable, maintainable units and prevent global namespace pollution.

### CommonJS (CJS)

**CommonJS** is the original module system in Node.js. It uses `require()` to import modules and `module.exports` or `exports` to export functionality.

**Key characteristics:**

- Synchronous loading
- Runtime resolution
- Default module system in Node.js
- File extension: `.js` (or `.cjs` for explicit CommonJS)

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

**Key characteristics:**

- Asynchronous loading
- Static analysis (resolved at compile time)
- Tree-shaking support
- File extension: `.mjs` or set `"type": "module"` in `package.json`

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

### Using ES Modules in Node.js

To use ES Modules in Node.js, you have two options:

**Option 1: Use `.mjs` file extension**

```javascript
// file.mjs
export function hello() {
  return "Hello from ES Module";
}
```

**Option 2: Set `"type": "module"` in package.json** (Most common approach)

```json
{
  "name": "my-app",
  "type": "module",
  "version": "1.0.0"
}
```

When `"type": "module"` is set, all `.js` files are treated as ES Modules. Use `.cjs` extension for CommonJS files.
