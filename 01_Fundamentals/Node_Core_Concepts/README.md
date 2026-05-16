# Node.js Core Concepts

## Core Terminology

### What is Node.js?

**Node.js is a JavaScript Runtime** that enables **"JavaScript on the Server"**. While JavaScript was originally designed to run only in browsers, Node.js brings JavaScript to the server-side, allowing developers to use the same language for both frontend and backend development.

![Node.js is a JavaScript Runtime](./public/what-is-nodejs.png)

### Creator of Node.js

Node.js was created by **Ryan Dahl** in 2009. Dahl was frustrated with the limitations of existing server-side technologies and wanted to create a platform that could handle many concurrent connections efficiently. He presented Node.js at the **[JSConf EU conference in 2009](https://www.youtube.com/watch?v=EeYvFl7li9E&list=PL37ZVnwpeshGNXb77ObNUbvax-VQ_DWJe)**, introducing the concept of event-driven, non-blocking I/O for server-side JavaScript.

**Ryan Dahl's Vision:**

- Enable JavaScript to run on the server
- Provide a simple way to build scalable network applications
- Leverage the asynchronous nature of JavaScript for I/O operations

### JavaScript on the Server

![JavaScript on the Server](./public/nodejs-on-the-server.png)

**Client-Server Interaction:**

- The **Client (Browser)** sends a **Request** to the **Server**
- The **Server** processes the request and sends back a **Response** (typically JSON data)

**Server-side Capabilities (handled by Node.js):**

- **Database** - Data storage and retrieval
- **Authentication** - Verifying user identities
- **Input Validation** - Ensuring data integrity and security
- **Business Logic** - Implementing the core functionality of the application

> **Note:** The diagram shows "Response 'HTML Page'" which reflects older web architecture. Modern Node.js backends typically return JSON data rather than HTML pages. The client-side JavaScript then handles rendering the UI based on this data.

### Node.js' Role (in Web Development)

![Node.js Role in Web Development](./public/nodejs-role-in-web-development.png)

- **Run Server**: creates a server and listens to incoming requests. This involves setting up an HTTP server that can accept connections from clients and wait for requests to be sent.

- **Business Logic**: handles requests by processing them according to your application's business logic. This includes validating input data to ensure it meets requirements, and connecting to databases to retrieve or store data as needed.

- **Responses**: returns responses to clients, which can be in various formats such as rendered HTML pages, JSON data, or other data formats depending on the application's needs.

### How Node.js Works

![How Node.js Works](./public/how-nodejs-work.png)

As shown in the diagram:

- **V8 Engine** is written in **C++** and compiles **JavaScript** code into **Machine Code**
- **Node.js** uses the **V8 Engine** to execute JavaScript
- **Node.js** is built with **C++**, which adds new features to JavaScript (like file system access, networking, etc.) that aren't available in browser JavaScript, enabling server-side functionality

### Node.js Program Lifecycle

![Node.js Program Lifecycle](./public/nodejs-program-lifecycle.png)

Every Node.js application follows a specific lifecycle from startup to termination. The program begins by parsing and registering code, then enters an Event Loop that processes asynchronous operations, and finally exits when there are no more active event listeners.

1. **Start Script**: When you run `node app.js`, Node.js starts executing your application.

2. **Parse Code, Register Variables & Functions**: Node.js parses the code and registers all variables and functions before execution begins.

3. **The Node Application / Event Loop**: The application enters the Event Loop, which keeps on running as long as there are event listeners registered. This is the core mechanism that allows Node.js to handle asynchronous operations and keep the application alive.

4. **process.exit**: The program terminates when there are no more active event listeners or when `process.exit()` is explicitly called.

### Single Thread, Event Loop & Blocking Code

![Single Thread, Event Loop & Blocking Code](./public/single-thread-event-loop-blocking-code.png)

Node.js uses a **Single JavaScript Thread** to execute your application code. When **Incoming Requests** arrive, they are processed through this single thread. The **Event Loop** handles event callbacks and manages asynchronous operations.

When your code encounters blocking operations (like file system operations with `fs`), Node.js doesn't wait for these operations to complete before executing other code. Instead, Node.js treats these blocking operations as **asynchronous code** and immediately sends them to a **Worker Pool** that performs the heavy lifting on **Different Thread(s)**.

![Asynchronous Code](./public/asynchronous-code.png)

**Asynchronous Patterns**: Node.js provides several patterns to handle asynchronous operations:

- **Callbacks** - Functions passed as arguments to be executed after an operation completes
- **Promises** - Objects representing the eventual completion or failure of an asynchronous operation
- **async / await** - Syntactic sugar built on Promises that makes asynchronous code look and behave more like synchronous code

The main JavaScript thread continues executing other code without waiting. Once the blocking operation completes in the Worker Pool, it triggers a callback that returns to the Event Loop, which then handles the callback on the Single JavaScript Thread.

This architecture allows Node.js to handle many concurrent requests efficiently without blocking the main thread, even though JavaScript execution happens on a single thread.

### The Event Loop

The Event Loop is the core mechanism that allows Node.js to perform non-blocking asynchronous operations using a single JavaScript thread. It coordinates the execution of synchronous code, asynchronous callbacks, and microtasks by moving them into the Call Stack at the appropriate time.

#### 1. Event Loop Phases in Node.js

![The Event Loop](./public/event-loop.png)

Unlike browsers, Node.js does not use a single “macrotask queue”.
Instead, the Event Loop is divided into multiple phases, each with its own queue. The main phases are executed in the following order:

1. **Timers phase**: Executes callbacks scheduled by `setTimeout()` and `setInterval()`. The specified delay represents the minimum time before the callback becomes eligible to run, not a guaranteed execution time.
2. **Pending Callbacks phase**: Executes I/O callbacks deferred from the previous loop iteration (e.g., certain system error callbacks)
3. **Idle, Prepare phase**: Used internally by Node.js
4. **Poll phase**: Retrieves new I/O events (file system, network, etc.). If the poll queue is empty, the Event Loop first checks for pending `setImmediate()` callbacks and proceeds to the Check phase if any exist.
If no `setImmediate()` callbacks are scheduled, the Event Loop then checks for expired timers. If a timer has expired, the Poll phase ends and the Event Loop returns to the Timers phase in the next iteration. Otherwise, the Event Loop may block and wait for new I/O events.
5. **Check phase**: Executes callbacks scheduled by `setImmediate()`
6. **Close Callbacks phase**: Executes close event handlers (e.g. `socket.on('close')`)

Each phase may execute multiple callbacks, not just one.

#### 2. Microtasks in Node.js

Node.js has two microtask queues, which run outside the normal Event Loop phases. **Priority order:**

- `process.nextTick()` queue (highest priority)
- Promise microtask queue: `Promise.then()`, `Promise.catch()`, `Promise.finally()`
  
After every callback execution and after each Event Loop phase, Node.js performs the following steps:

1. Execute all `process.nextTick()` callbacks
2. Execute all Promise microtasks

Only after both queues are empty does the Event Loop continue to the next phase.

> **Note:** Because `process.nextTick()` has very high priority, excessive usage can starve the Event Loop.

### Examples and Explanation

#### Example 1: Basic Event Loop Order

```javascript
console.log("1. Start");

setTimeout(() => {
  console.log("2. setTimeout");
}, 0);

setImmediate(() => {
  console.log("3. setImmediate");
});

process.nextTick(() => {
  console.log("4. nextTick");
});

Promise.resolve().then(() => {
  console.log("5. Promise");
});

console.log("6. End");
```

**Output:**

```plaintext
1. Start
6. End
4. nextTick
5. Promise
2. setTimeout
3. setImmediate
```

**Explanation:**

- Synchronous code runs first (`1. Start`, `6. End`)
- `process.nextTick()` has the highest priority in the microtask queue
- Promise callbacks run after `nextTick` but before timers
- **Important:** In top-level code (outside I/O callbacks), the order between `setTimeout(fn, 0)` and `setImmediate()` is **not guaranteed** and can vary depending on system performance. In this example, `setTimeout` happens to run first, but this is not always the case.

#### Example 2: Microtask vs Macrotask Priority

```javascript
console.log("1. Start");

setTimeout(() => console.log("2. setTimeout"), 0);

Promise.resolve().then(() => {
  console.log("3. Promise 1");
  Promise.resolve().then(() => {
    console.log("4. Promise 2 (nested)");
  });
});

setTimeout(() => console.log("5. setTimeout 2"), 0);

process.nextTick(() => {
  console.log("6. nextTick 1");
  process.nextTick(() => {
    console.log("7. nextTick 2 (nested)");
  });
});

console.log("8. End");
```

**Output:**

```plaintext
1. Start
8. End
6. nextTick 1
7. nextTick 2 (nested)
3. Promise 1
4. Promise 2 (nested)
2. setTimeout
5. setTimeout 2
```

**Explanation:**

- Synchronous code runs first (`1. Start`, `8. End`)
- All microtasks (`nextTick` and Promises) are processed completely before any macrotask
- `nextTick` has higher priority than Promises within microtasks
- Nested microtasks are processed immediately, not deferred
- Macrotasks (`setTimeout`) are processed only after all microtasks are done

#### Example 3: Event Loop Phases in I/O Callbacks

```javascript
const fs = require("fs");

console.log("1. Start");

setTimeout(() => console.log("2. Timer"), 0);
setImmediate(() => console.log("3. Immediate"));

fs.readFile(__filename, () => {
  console.log("4. I/O callback");

  setTimeout(() => console.log("5. Timer in I/O"), 0);
  setImmediate(() => console.log("6. Immediate in I/O"));

  process.nextTick(() => console.log("7. nextTick in I/O"));
});

process.nextTick(() => console.log("8. nextTick"));

Promise.resolve().then(() => console.log("9. Promise"));

console.log("10. End");
```

**Output:**

```plaintext
1. Start
10. End
8. nextTick
9. Promise
4. I/O callback
7. nextTick in I/O
3. Immediate
6. Immediate in I/O
2. Timer
5. Timer in I/O
```

**Explanation:**

- Shows the order of execution across different event loop phases
- Demonstrates how `nextTick` and Promises are prioritized
- **Key insight:** When inside an I/O callback (Poll phase), `setImmediate()` callbacks run in the Check phase, which comes immediately after the Poll phase. Meanwhile, `setTimeout()` callbacks run in the Timers phase, which occurs at the beginning of the next event loop iteration. This is why `setImmediate` runs before `setTimeout` in I/O callbacks.

### Example 4: Blocking vs Non-blocking I/O

**Blocking (Synchronous):**

```javascript
const fs = require("fs");

console.log("Start reading file");
const data = fs.readFileSync("large-file.txt", "utf8");
console.log("File read complete");
console.log("Do other work");
```

**Non-blocking (Asynchronous):**

```javascript
const fs = require("fs");

console.log("Start reading file");
fs.readFile("large-file.txt", "utf8", (err, data) => {
  if (err) throw err;
  console.log("File read complete");
});
console.log("Do other work");
```

**Explanation:**

- Synchronous operations block the event loop until completion
- Asynchronous operations allow other code to execute while waiting for I/O
- Non-blocking approach is essential for handling multiple concurrent operations

---

## Event Emitter

The Event Emitter is a core Node.js pattern that enables objects to emit named events and allows other code to listen and respond to those events. It's the foundation of Node.js's event-driven architecture and is used extensively throughout the Node.js ecosystem.

### Common Event Emitter Methods

#### 1. emitter.on(eventName, listener)

Registers a listener function that will be called every time the event is emitted.

```javascript
emitter.on('data', (data) => {
  console.log('Received:', data);
});

emitter.emit('data', 'message 1'); // Received: message 1
emitter.emit('data', 'message 2'); // Received: message 2
```

#### 2. emitter.once(eventName, listener)

Registers a listener that will be called only once, then automatically removed.

```javascript
emitter.once('connect', () => {
  console.log('Connected!');
});

emitter.emit('connect'); // Connected!
emitter.emit('connect'); // (nothing happens)
```

#### 3. emitter.emit(eventName, ...args)

Synchronously calls all listeners registered for the event, passing the provided arguments.

```javascript
emitter.on('sum', (a, b) => {
  console.log(a + b);
});

emitter.emit('sum', 5, 3); // 8
```

#### 4. emitter.off(eventName, listener) or emitter.removeListener()

Removes a specific listener from the event.

```javascript
const listener = (data) => console.log(data);

emitter.on('data', listener);
emitter.off('data', listener); // Remove the listener
emitter.emit('data', 'test'); // (nothing happens)
```

#### 5. emitter.removeAllListeners(eventName)

Removes all listeners for a specific event, or all events if no event name is provided.

```javascript
emitter.on('event1', () => {});
emitter.on('event1', () => {});
emitter.on('event2', () => {});

emitter.removeAllListeners('event1'); // Removes both event1 listeners
emitter.removeAllListeners(); // Removes all listeners
```

## References

- [The Node.js Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Blocking vs Non-blocking](https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/)
- [V8 Engine Documentation](https://v8.dev/docs)
- [Event Emitter](https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter)
