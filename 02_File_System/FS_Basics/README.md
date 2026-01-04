# File System Basics

The `fs` module in Node.js provides an API for interacting with the file system. It allows you to read, write, create, delete, and manipulate files and directories. Understanding file system operations is crucial for building applications that need to persist or process data.

---

## Core Terminology

### What is the fs Module?

The `fs` (file system) module is a built-in Node.js module that provides both **synchronous** and **asynchronous** methods for file system operations. It enables your Node.js application to interact with files and directories on your computer.

### Synchronous vs Asynchronous Operations (Modern Node.js)

| Aspect            | Asynchronous (Non-blocking – Recommended)               | Synchronous (Blocking – Limited use)                       |
| ----------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| Execution         | Returns a Promise; executed with `async/await`          | Blocks execution until the operation completes             |
| Event Loop        | Does not block the event loop                           | Blocks the event loop                                      |
| Production Use    | Preferred for production backend code                   | Avoid in runtime code (acceptable for startup or CLI only) |
| Method Naming     | Methods without `Sync` suffix                           | Methods with `Sync` suffix                                 |
| Examples          | `readFile`, `writeFile`, `readdir` (from `fs/promises`) | `readFileSync`, `writeFileSync`, `readdirSync`             |
| Error Handling    | `try/catch` on Promise rejection                        | `try/catch` for thrown errors                              |
| Concurrency       | Scales well with concurrent requests                    | Prevents concurrency while running                         |
| Typical Use Cases | API handlers, services, background jobs                 | App bootstrap, scripts, tooling                            |
| Recommendation    | Default choice                                          | Exception only                                             |

**Importing the fs module (ES Modules (Node.js 14+)):**

```typescript
import {
  readFile,
  writeFile,
  readdir,
  mkdir,
  rm,
  stat,
  rename,
} from "fs/promises";
```

---

## Examples and Explanation

### Example 1: Read a File

**Syntax:**

`readFile(
  path: string | URL,
  options?: { encoding?: BufferEncoding }
): Promise<string | Buffer>`

**Input:**

- `path`: The file path (absolute or relative) or URL to read from
- `options` (optional): Configuration object
  - `encoding`: Character encoding (e.g., 'utf8', 'utf-16le'). If specified, returns a string; otherwise returns a Buffer

**Output:**

- Returns a `Promise` that resolves to:
  - A `string` containing the file contents if encoding is specified
  - A `Buffer` object containing raw binary data if no encoding is specified

**Code Example:**

```typescript
import { readFile } from "fs/promises";

async function readFileExample() {
  try {
    const content = await readFile("data.txt", "utf8");
    console.log(content);
  } catch (error) {
    console.error("Error reading file:", error);
  }
}

readFileExample();
```

**Explanation:**

- Reads the entire file into memory
- Returns file content as a string when encoding is provided
- Non-blocking and safe for backend runtime code

### Example 2: Write a File

**Syntax:**

`writeFile(
  path: string | URL,
  data: string | Buffer,
  options?: { encoding?: BufferEncoding }
): Promise<void>`

**Input:**

- `path`: The file path (absolute or relative) or URL to write to
- `data`: The content to write - can be a string or Buffer
- `options` (optional): Configuration object
  - `encoding`: Character encoding (default: 'utf8')

**Output:**

- Returns a `Promise` that resolves to `void` (no return value)
- Creates a new file if it doesn't exist
- Overwrites the file if it already exists

**Code Example:**

```typescript
import { writeFile } from "fs/promises";

async function writeFileExample() {
  try {
    await writeFile("output.txt", "Hello Node.js", "utf8");
    console.log("File written successfully");
  } catch (error) {
    console.error("Error writing file:", error);
  }
}

writeFileExample();
```

**Explanation:**

- Creates a new file or overwrites an existing one
- Does not return any value
- Commonly used to persist generated data

### Example 3: Read Directory Contents

**Syntax:**

`readdir(
path: string | URL,
options?: { withFileTypes?: boolean }
): Promise<string[] | Dirent[]>`

**Input:**

- `path`: The directory path (absolute or relative) or URL to read
- `options` (optional): Configuration object
  - `withFileTypes`: If `true`, returns an array of `Dirent` objects with file type information; if `false`, returns file name strings (default: false)

**Output:**

- Returns a `Promise` that resolves to:
  - An array of `string` values (file/directory names) if `withFileTypes` is false
  - An array of `Dirent` objects (with methods like `isFile()`, `isDirectory()`) if `withFileTypes` is true

**Code Example:**

```typescript
import { readdir } from "fs/promises";

async function readdirExample() {
  try {
    const files = await readdir("./");
    console.log(files);
  } catch (error) {
    console.error("Error reading directory:", error);
  }
}

readdirExample();
```

**With file type information:**

```typescript
async function readdirWithTypesExample() {
  try {
    const entries = await readdir("./", { withFileTypes: true });

    entries.forEach((entry) => {
      console.log(entry.isDirectory() ? "Dir:" : "File:", entry.name);
    });
  } catch (error) {
    console.error("Error reading directory:", error);
  }
}

readdirWithTypesExample();
```

**Explanation:**

- Reads directory contents (non-recursive)
- Can return file names or Dirent objects
- Useful for scanning folders

### Example 4: Create a Directory

**Syntax:**

`mkdir(
path: string | URL,
options?: { recursive?: boolean }
): Promise<void>`

**Input:**

- `path`: The directory path (absolute or relative) or URL to create
- `options` (optional): Configuration object
  - `recursive`: If `true`, creates parent directories if they don't exist (like `mkdir -p`); if `false`, throws an error if parent doesn't exist (default: false)

**Output:**

- Returns a `Promise` that resolves to `void` (no return value)
- Successfully creates directory or throws an error if it fails

**Code Example:**

```typescript
import { mkdir } from "fs/promises";

async function mkdirExample() {
  try {
    await mkdir("uploads/images", { recursive: true });
    console.log("Directory created successfully");
  } catch (error) {
    console.error("Error creating directory:", error);
  }
}

mkdirExample();
```

**Explanation:**

- Creates a directory at the given path
- `recursive: true` ensures parent directories are created
- Safe to call even if directory already exists

### Example 5: Remove Files or Directories

**Syntax:**

`rm(
path: string | URL,
options?: { recursive?: boolean; force?: boolean }
): Promise<void>`

**Input:**

- `path`: The file or directory path (absolute or relative) or URL to remove
- `options` (optional): Configuration object
  - `recursive`: If `true`, removes directories and their contents recursively (default: false)
  - `force`: If `true`, ignores errors if path doesn't exist (default: false)

**Output:**

- Returns a `Promise` that resolves to `void` (no return value)
- Removes the specified file or directory
- Throws an error if the path doesn't exist (unless `force: true`)

**Code Example:**

```typescript
import { rm } from "fs/promises";

async function rmExample() {
  try {
    await rm("temp", { recursive: true, force: true });
    console.log("Removed successfully");
  } catch (error) {
    console.error("Error removing:", error);
  }
}

rmExample();
```

**Explanation:**

- Removes files or directories
- Replaces unlink and rmdir in most cases
- `force: true` ignores missing paths

### Example 6: Get File Statistics

**Syntax:**

`stat(path: string | URL): Promise<Stats>`

**Input:**

- `path`: The file or directory path (absolute or relative) or URL to get information about

**Output:**

- Returns a `Promise` that resolves to a `Stats` object containing:
  - `size`: File size in bytes
  - `isFile()`: Method that returns `true` if it's a file
  - `isDirectory()`: Method that returns `true` if it's a directory
  - `mtime`: Last modified time
  - `birthtime`: Creation time
  - And other file metadata properties

**Code Example:**

```typescript
import { stat } from "fs/promises";

async function statExample() {
  try {
    const info = await stat("data.txt");

    console.log(info.size);
    console.log(info.isFile());
    console.log(info.isDirectory());
  } catch (error) {
    console.error("Error getting file stats:", error);
  }
}

statExample();
```

**Explanation:**

- Retrieves metadata about a file or directory
- Useful for checking existence and file type
- Throws an error if the path does not exist

### Example 7: Rename or Move a File

**Syntax:**

`rename(
oldPath: string | URL,
newPath: string | URL
): Promise<void>`

**Input:**

- `oldPath`: The current file or directory path (absolute or relative) or URL
- `newPath`: The new file or directory path (absolute or relative) or URL

**Output:**

- Returns a `Promise` that resolves to `void` (no return value)
- Renames the file/directory if both paths are in the same directory
- Moves the file/directory if paths are in different directories
- Overwrites the destination if it already exists

**Code Example:**

```typescript
import { rename } from "fs/promises";

async function renameExample() {
  try {
    await rename("old-name.txt", "new-name.txt");
    console.log("File renamed successfully");
  } catch (error) {
    console.error("Error renaming file:", error);
  }
}

renameExample();
```

**Explanation:**

- Renames or moves a file or directory
- Can move files across directories
- Overwrites the destination if it already exists

---

## References

- [Node.js fs Module Documentation](https://nodejs.org/api/fs.html)
- [File System Best Practices](https://nodejs.org/en/docs/guides/working-with-different-filesystems/)
- [fs.promises API](https://nodejs.org/api/fs.html#fs_fs_promises_api)
