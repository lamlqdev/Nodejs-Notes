# Error Handling

Error handling is the process of anticipating, detecting, and responding to errors that occur during program execution. In Node.js, proper error handling is especially critical because Node.js runs on a **single thread** — an unhandled error can crash the entire process, affecting all users simultaneously.

---

## Core Terminology

### What is an Error?

An **Error** is an object that represents something unexpected that happened during program execution. In JavaScript and Node.js, errors are instances of the built-in `Error` class (or its subclasses).

Every error object has at minimum:

- **`message`** — A human-readable description of what went wrong
- **`name`** — The type/class of the error (e.g., `"TypeError"`, `"RangeError"`)
- **`stack`** — A string containing the call stack at the point the error was created

```javascript
const err = new Error("Something went wrong");
console.log(err.message); // Something went wrong
console.log(err.name);    // Error
console.log(err.stack);   // Error: Something went wrong\n    at Object.<anonymous> ...
```

## Types of Errors

Node.js categorizes errors into four main types:

### 1. System Errors

Errors that occur when Node.js interacts with the operating system — file system, network, process, etc. They extend `Error` and include a `.code` property (a string constant like `"ENOENT"`) that identifies the specific system-level issue.

**Common system error codes:**

| Code | Meaning |
|---|---|
| `ENOENT` | No such file or directory |
| `EACCES` | Permission denied |
| `ECONNREFUSED` | Connection refused |
| `ETIMEDOUT` | Operation timed out |
| `EADDRINUSE` | Address already in use |

```javascript
import fs from "fs";

fs.readFile("nonexistent.txt", (err, data) => {
  if (err) {
    console.log(err.code);    // ENOENT
    console.log(err.message); // ENOENT: no such file or directory, open 'nonexistent.txt'
  }
});
```

### 2. User-Specified Errors

Errors that you intentionally create and throw in your own application code to signal invalid states, failed validations, or business rule violations.

```javascript
function getUser(id) {
  if (!id) throw new Error("User ID is required");
  if (typeof id !== "number") throw new TypeError("User ID must be a number");
}
```

### 3. Assertion Errors

Errors thrown by Node.js's built-in `assert` module when an assertion fails. Used primarily in **testing** and **debugging** to verify that a condition holds true.

```javascript
import assert from "assert";

assert.strictEqual(1 + 1, 2);     // passes
assert.strictEqual(1 + 1, 3);     // throws AssertionError
assert.ok(user !== null);         // throws if user is null
assert.deepStrictEqual(obj1, obj2); // deep comparison
```

When an assertion fails, Node.js throws an `AssertionError` with a detailed diff of the expected vs actual values.

### 4. JavaScript Errors

Standard built-in errors from the JavaScript language itself. These are thrown automatically by the JS engine when your code violates language rules.

| Error Type | When it occurs |
|---|---|
| `TypeError` | Wrong type used (e.g., calling a non-function) |
| `ReferenceError` | Accessing an undeclared variable |
| `SyntaxError` | Invalid JavaScript syntax |
| `RangeError` | Value out of allowed range (e.g., invalid array length) |
| `URIError` | Malformed URI in `encodeURI()` / `decodeURI()` |
| `EvalError` | Issues with `eval()` (rare) |

```javascript
null.property;          // TypeError: Cannot read properties of null
undeclaredVar;          // ReferenceError: undeclaredVar is not defined
[].length = -1;         // RangeError: Invalid array length
```

---

## Uncaught Exceptions

An **uncaught exception** is a thrown error that was not caught anywhere in the synchronous call stack. In Node.js, this triggers the `uncaughtException` event on the `process` object. If no listener is registered, Node.js prints the stack trace and **exits with code 1**.

```javascript
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  // Log the error, then exit gracefully
  process.exit(1);
});
```

> ⚠️ **Important:** The `uncaughtException` handler should only be used for **logging and graceful shutdown**, not for recovering and continuing execution. After an uncaught exception, the application is in an undefined state.

Similarly, for unhandled Promise rejections:

```javascript
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
```

---

## Handling Async Errors

Async errors do not propagate like synchronous errors — you cannot catch them with a simple `try/catch` unless you use `async/await`. Each async pattern has its own error handling approach.

### Callbacks (Error-First Pattern)

The Node.js convention for callbacks is **error-first**: the first argument of the callback is always the error (or `null` if no error occurred).

```javascript
import fs from "fs";

fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Failed to read file:", err.message);
    return; // always return to stop execution
  }
  console.log(data);
});
```

### Promises

Use `.catch()` to handle errors in Promise chains. Without it, rejections go unhandled.

```javascript
fetchUser(id)
  .then((user) => processUser(user))
  .then((result) => sendResponse(result))
  .catch((err) => {
    // catches errors from any step above
    console.error("Error in chain:", err.message);
  });
```

### Async / Await

Use `try/catch` to handle errors in `async` functions. This makes async error handling look and feel like synchronous code.

```javascript
async function loadUser(id) {
  try {
    const user = await fetchUser(id);
    const profile = await fetchProfile(user.profileId);
    return profile;
  } catch (err) {
    console.error("Failed to load user:", err.message);
    throw err; // re-throw if the caller should handle it
  }
}
```

> ⚠️ **Common mistake:** forgetting `await` causes the error to be an unhandled rejection, not caught by `try/catch`.

---

## Callstack / Stack Trace

### What is the Call Stack?

The **call stack** is a data structure that tracks the execution context of a program — which function called which, in what order. When a function is called, a **stack frame** is pushed. When it returns, the frame is popped. When an error occurs, JavaScript captures the current state of the call stack as the **stack trace**.

```javascript
function c() { throw new Error("oops"); }
function b() { c(); }
function a() { b(); }
a();

// Error: oops
//     at c (app.js:1:16)  ← where error was thrown
//     at b (app.js:2:14)
//     at a (app.js:3:14)
//     at Object.<anonymous> (app.js:4:1)  ← entry point
```

### Reading a Stack Trace

A stack trace is read **top to bottom**, where:

- **Top frame** = where the error was thrown
- **Subsequent frames** = the chain of function calls that led to it
- **Bottom frame** = the entry point (usually `main`, `module`, or event loop internals)

**Tips for reading stack traces:**

1. Start from the **top** to find the exact line that threw
2. Look for **your own files** (e.g., `app.js`, `routes/user.js`) and ignore Node.js internals (`node:internal/...`)
3. Follow the chain upward to understand **how** execution arrived at that point
4. The format is `at FunctionName (file:line:column)`

---

## Using Debugger

### Node.js Built-in Inspector (`--inspect`)

Node.js has a built-in debugger based on the Chrome DevTools Protocol. Start your app with the `--inspect` flag, then open Chrome DevTools to debug visually.

```bash
node --inspect app.js
# or break immediately on first line:
node --inspect-brk app.js
```

Then open `chrome://inspect` in Chrome and click **"inspect"** under your Node.js target.

### VS Code Debugger

VS Code has first-class Node.js debugging support. Create a `.vscode/launch.json` file:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Node App",
      "program": "${workspaceFolder}/app.js"
    }
  ]
}
```

Press `F5` to start debugging.

### Key Debugger Features

| Feature | Description |
|---|---|
| **Breakpoint** | Pause execution at a specific line |
| **Step Over (F10)** | Execute current line, stay in current function |
| **Step Into (F11)** | Jump into the function being called |
| **Step Out (Shift+F11)** | Finish current function, return to caller |
| **Watch** | Monitor the value of an expression as you step |
| **Call Stack panel** | Visual view of the current call stack |
| **Variables panel** | Inspect all variables in the current scope |

> 💡 **Tip:** The debugger is significantly more efficient than inserting `console.log` statements for tracing logic or inspecting state. Investing time in learning it pays off quickly.

---

## Mindset When Handling Errors

### Backend — the caller receives the error

- **Classify before handling:** client errors (4xx) return a clear message, server errors (5xx) get logged in full but never leak the stack trace to the outside
- **Log enough context** to debug later: message, stack, userId, endpoint, timestamp
- **Centralize error handling** — avoid scattering logic everywhere, funnel everything into one middleware/handler
- **Re-throw if you cannot handle it** — never swallow an error silently, let the caller decide

```javascript
// ✅ Classify and handle with intent
try {
  const user = await findUser(id);
} catch (err) {
  if (err.code === "ENOENT") return res.status(404).json({ message: "Not found" });
  logger.error({ message: err.message, stack: err.stack, userId: id });
  res.status(500).json({ message: "Internal server error" }); // never expose err.stack
}
```

### Frontend — the user receives the error

- **Users don't need to know what went wrong, they need to know what to do next** — avoid showing technical messages
- **Map HTTP status to the right UI:** 401 → redirect to login, 422 → show field errors on form, 5xx → toast "try again"
- **Error Boundary** for unexpected render errors — prevents the entire app from crashing

```javascript
// ✅ Map status to the appropriate UI response
catch (err) {
  if (err.status === 401) redirect("/login");
  else if (err.status === 422) setFieldErrors(err.data);
  else showToast("Something went wrong, please try again.");
}
```

### General principles

| ❌ Avoid | ✅ Do instead |
|---|---|
| Catching an error and doing nothing | Catch with intent — handle it or re-throw |
| Exposing stack traces to the user | Log on the server, show a friendly message |
| Scattering error logic everywhere | Centralize into one handler |
| Trying to recover after an uncaught exception | Log the error and shut down gracefully |

---

## References

- [Node.js Error Documentation](https://nodejs.org/api/errors.html)
- [Node.js Assert Module](https://nodejs.org/api/assert.html)
- [Node.js Debugger](https://nodejs.org/en/learn/getting-started/debugging)
- [VS Code Node.js Debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [Error Handling Best Practices – Joyent](https://www.joyent.com/node-js/production/design/errors)