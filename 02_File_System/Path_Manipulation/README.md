# Path Manipulation

The `path` module in Node.js provides utilities for working with file and directory paths. It handles the differences between path formats across different operating systems (Windows vs Unix-like systems) and provides methods to parse, join, and manipulate file paths safely and consistently.

---

## Core Terminology

### What is the path Module?

The `path` module is a built-in Node.js module that provides utilities for handling file and directory path operations. It helps normalize paths, resolve relative paths to absolute paths, extract components of a path, and safely join path segments in a cross-platform manner.

### Why Use the path Module?

- **Cross-Platform Compatibility**: Handles differences between Windows (`\`) and Unix-like systems (`/`) path separators
- **Safe Path Joining**: Prevents path traversal bugs by properly joining path segments
- **Path Parsing**: Extract components like directory, filename, and extension
- **Path Resolution**: Convert relative paths to absolute paths based on the current working directory
- **No File I/O**: All operations are synchronous string manipulations (no filesystem access)

### Path Components

A file path consists of several components:

```
/home/user/documents/file.txt
│     │    │         │    │
│     │    │         │    └─ basename (file.txt)
│     │    │         └─────── filename (file)
│     │    │                 extension (.txt)
│     │    └───────────────── dirname (/home/user/documents)
│     └──────────────────────── root (/)
└──────────────────────────────── dir (/home/user/documents)
```

**Importing the path module (ES Modules (Node.js 14+)):**

```typescript
import * as path from "path";
// Or import specific methods:
import {
  join,
  resolve,
  basename,
  dirname,
  extname,
  parse,
  isAbsolute,
} from "path";
```

---

## Examples and Explanation

### Example 1: Join Path Segments

**Syntax:**

`path.join(
  ...paths: string[]
): string`

**Input:**

- `paths`: One or more path segments to join
  - Can be relative or absolute paths
  - Can include `..` and `.` for parent and current directory references

**Output:**

- Returns a `string` containing the normalized joined path
- Automatically normalizes the result (removes redundant separators and references)
- Uses the correct separator for the operating system

**Code Example:**

```typescript
import { join } from "path";

async function joinPathExample() {
  try {
    // Join multiple path segments
    const filePath = join("/home/user", "documents", "file.txt");
    console.log("Joined path:", filePath);
    // Output: /home/user/documents/file.txt

    // Join with relative references
    const resolvedPath = join("/app/src", "..", "config", "app.json");
    console.log("With parent ref:", resolvedPath);
    // Output: /app/config/app.json

    // Cross-platform path joining
    const uploadPath = join("uploads", "images", "profile.jpg");
    console.log("Relative path:", uploadPath);
    // Output: uploads/images/profile.jpg (or uploads\images\profile.jpg on Windows)
  } catch (error) {
    console.error("Error joining paths:", error);
  }
}

joinPathExample();
```

**Explanation:**

- Simplest way to combine path segments
- Handles `..` and `.` references automatically
- Cross-platform safe - uses correct separator for OS
- Removes duplicate slashes

### Example 2: Resolve to Absolute Path

**Syntax:**

`path.resolve(
  ...paths: string[]
): string`

**Input:**

- `paths`: One or more path segments to resolve
  - If the last segment is relative, resolution starts from the left
  - Empty string or no arguments uses the current working directory

**Output:**

- Returns a `string` containing the absolute path
- Resolves all relative references (`..` and `.`)
- Uses the current working directory as the starting point if needed

**Code Example:**

```typescript
import { resolve } from "path";

async function resolvePathExample() {
  try {
    // Resolve relative to current working directory
    const absolutePath = resolve("uploads/images/photo.jpg");
    console.log("Absolute path:", absolutePath);
    // Output: /Users/username/project/uploads/images/photo.jpg

    // Resolve with multiple segments
    const configPath = resolve(__dirname, "..", "config", "app.json");
    console.log("Config path:", configPath);

    // Resolve with parent directory references
    const parentPath = resolve("/app/src/utils", "..", "..", "config");
    console.log("Parent path:", parentPath);
    // Output: /app/config

    // Get current working directory
    const cwd = resolve();
    console.log("Current working directory:", cwd);
  } catch (error) {
    console.error("Error resolving path:", error);
  }
}

resolvePathExample();
```

**Explanation:**

- Converts relative paths to absolute paths
- Resolves all `..` and `.` references
- Essential for file operations that need absolute paths
- Useful for getting the correct path regardless of where the script runs

### Example 3: Extract Filename

**Syntax:**

`path.basename(
  path: string,
  suffix?: string
): string`

**Input:**

- `path`: The file path to extract the filename from
- `suffix` (optional): File extension to remove from the result
  - If provided, removes the suffix from the returned basename

**Output:**

- Returns a `string` containing just the filename (with or without extension)
- Removes the directory path
- Optionally removes the specified suffix

**Code Example:**

```typescript
import { basename } from "path";

async function basenameExample() {
  try {
    // Get filename with extension
    const fullName = basename("/home/user/documents/file.txt");
    console.log("Full basename:", fullName);
    // Output: file.txt

    // Get filename without extension
    const nameOnly = basename("/path/to/image.png", ".png");
    console.log("Name without ext:", nameOnly);
    // Output: image

    // Works with different path formats
    const windowsPath = basename("C:\\Users\\Documents\\report.pdf");
    console.log("From Windows path:", windowsPath);
    // Output: report.pdf

    // Works with relative paths
    const relativePath = basename("src/components/Button.jsx", ".jsx");
    console.log("Component name:", relativePath);
    // Output: Button
  } catch (error) {
    console.error("Error getting basename:", error);
  }
}

basenameExample();
```

**Explanation:**

- Extracts just the filename from a full path
- Useful for getting file names from paths
- Can remove extension with the suffix parameter
- Works with both absolute and relative paths

### Example 4: Extract Directory Path

**Syntax:**

`path.dirname(
  path: string
): string`

**Input:**

- `path`: The file path to extract the directory from

**Output:**

- Returns a `string` containing the directory path
- Removes the filename from the path
- Returns `.` if path has no directory component

**Code Example:**

```typescript
import { dirname } from "path";

async function dirnameExample() {
  try {
    // Get directory from absolute path
    const dir = dirname("/home/user/documents/file.txt");
    console.log("Directory:", dir);
    // Output: /home/user/documents

    // Get directory from relative path
    const relativeDir = dirname("src/components/Button.jsx");
    console.log("Relative directory:", relativeDir);
    // Output: src/components

    // Works with different path separators
    const windowsDir = dirname("C:\\Users\\Documents\\report.pdf");
    console.log("Windows directory:", windowsDir);
    // Output: C:\Users\Documents

    // Filename only returns current directory
    const currentDir = dirname("file.txt");
    console.log("Current directory:", currentDir);
    // Output: .
  } catch (error) {
    console.error("Error getting dirname:", error);
  }
}

dirnameExample();
```

**Explanation:**

- Extracts directory path from a full file path
- Opposite of `basename()`
- Useful for operations on parent directories
- Cross-platform compatible

### Example 5: Extract File Extension

**Syntax:**

`path.extname(
  path: string
): string`

**Input:**

- `path`: The file path to extract the extension from

**Output:**

- Returns a `string` containing the file extension (including the dot)
- Returns empty string if there is no extension
- Returns the last dot and everything after it

**Code Example:**

```typescript
import { extname } from "path";

async function extnameExample() {
  try {
    // Get file extension
    const ext = extname("document.pdf");
    console.log("Extension:", ext);
    // Output: .pdf

    // Works with full paths
    const pathExt = extname("/home/user/downloads/image.jpg");
    console.log("Path extension:", pathExt);
    // Output: .jpg

    // No extension returns empty string
    const noExt = extname("README");
    console.log("No extension:", noExt);
    // Output: (empty string)

    // Handles multiple dots
    const compressedExt = extname("archive.tar.gz");
    console.log("Compressed extension:", compressedExt);
    // Output: .gz

    // Useful for file type checking
    const file = "image.png";
    if (extname(file) === ".png") {
      console.log("File is a PNG image");
    }
  } catch (error) {
    console.error("Error getting extension:", error);
  }
}

extnameExample();
```

**Explanation:**

- Extracts file extension including the dot
- Useful for file type validation
- Returns only the last extension if multiple dots exist
- Provides an empty string if no extension

### Example 6: Parse Path into Components

**Syntax:**

`path.parse(
  path: string
): PathObject`

**Input:**

- `path`: The file path to parse into components

**Output:**

- Returns a `PathObject` containing:
  - `root`: The root of the path (e.g., `/` or `C:\`)
  - `dir`: The directory path
  - `base`: The filename with extension
  - `name`: The filename without extension
  - `ext`: The file extension with dot

**Code Example:**

```typescript
import { parse } from "path";

async function parsePathExample() {
  try {
    // Parse absolute path
    const parsed = parse("/home/user/documents/file.txt");
    console.log("Parsed path:", parsed);
    // Output: {
    //   root: '/',
    //   dir: '/home/user/documents',
    //   base: 'file.txt',
    //   name: 'file',
    //   ext: '.txt'
    // }

    // Parse relative path
    const relativeParsed = parse("src/components/Button.jsx");
    console.log("Relative parsed:", relativeParsed);
    // Output: {
    //   root: '',
    //   dir: 'src/components',
    //   base: 'Button.jsx',
    //   name: 'Button',
    //   ext: '.jsx'
    // }

    // Access specific components
    const filePath = "downloads/image.png";
    const pathObj = parse(filePath);
    console.log("Filename:", pathObj.name); // Output: image
    console.log("Directory:", pathObj.dir); // Output: downloads
    console.log("Extension:", pathObj.ext); // Output: .png
  } catch (error) {
    console.error("Error parsing path:", error);
  }
}

parsePathExample();
```

**Explanation:**

- Breaks down a path into all its components
- Useful for comprehensive path manipulation
- Returns an object with all path parts
- More complete than individual methods

### Example 7: Check if Path is Absolute

**Syntax:**

`path.isAbsolute(
  path: string
): boolean`

**Input:**

- `path`: The path string to check

**Output:**

- Returns a `boolean`:
  - `true` if the path is absolute
  - `false` if the path is relative

**Code Example:**

```typescript
import { isAbsolute } from "path";

async function isAbsoluteExample() {
  try {
    // Check absolute paths
    const absPath = "/home/user/documents";
    if (isAbsolute(absPath)) {
      console.log("Absolute path detected");
    }
    // Output: Absolute path detected

    // Check relative paths
    const relPath = "src/components";
    if (!isAbsolute(relPath)) {
      console.log("Relative path detected");
    }
    // Output: Relative path detected

    // Windows absolute paths
    const windowsPath = "C:\\Users\\Documents";
    const isWindowsAbsolute = isAbsolute(windowsPath);
    console.log("Is Windows absolute:", isWindowsAbsolute);
    // Output: true (on Windows), false (on Unix)

    // Useful for validation
    function processPath(filePath: string): void {
      const absolutePath = isAbsolute(filePath) ? filePath : resolve(filePath);
      console.log("Processing absolute path:", absolutePath);
    }

    processPath("./config.json");
    processPath("/etc/config.json");
  } catch (error) {
    console.error("Error checking path:", error);
  }
}

isAbsoluteExample();
```

**Explanation:**

- Determines if a path is absolute or relative
- Useful for path validation
- Platform-aware (considers Windows and Unix conventions)
- Essential for conditional path processing

---

## Common Use Cases

### Validate File Type by Extension

```typescript
import { extname } from "path";

function isImageFile(filePath: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
  return imageExtensions.includes(extname(filePath).toLowerCase());
}

console.log(isImageFile("photo.jpg")); // true
console.log(isImageFile("document.pdf")); // false
```

### Construct File Paths Safely

```typescript
import { join, resolve } from "path";

function getUploadPath(filename: string): string {
  return join(__dirname, "..", "uploads", filename);
}

// Safe across all operating systems
const uploadPath = getUploadPath("profile.jpg");
```

### Get File Information

```typescript
import { parse, basename, extname } from "path";

function getFileInfo(filePath: string): object {
  const parsed = parse(filePath);
  return {
    filename: basename(filePath),
    directory: parsed.dir,
    name: parsed.name,
    extension: extname(filePath),
    isAbsolute: path.isAbsolute(filePath),
  };
}

console.log(getFileInfo("/home/user/downloads/image.png"));
// Output: {
//   filename: 'image.png',
//   directory: '/home/user/downloads',
//   name: 'image',
//   extension: '.png',
//   isAbsolute: true
// }
```

### Process Files in a Directory

```typescript
import { join, extname } from "path";
import { readdir } from "fs/promises";

async function processImages(dirPath: string): Promise<void> {
  try {
    const files = await readdir(dirPath);

    for (const file of files) {
      if (extname(file) === ".jpg") {
        const fullPath = join(dirPath, file);
        console.log("Processing image:", fullPath);
        // Process image
      }
    }
  } catch (error) {
    console.error("Error processing images:", error);
  }
}
```

---

## References

- [Node.js path Module Documentation](https://nodejs.org/api/path.html)
- [Node.js File System Best Practices](https://nodejs.org/en/docs/guides/working-with-different-filesystems/)
- [Path Manipulation Examples](https://nodejs.org/en/knowledge/file-system/security/introduction/)
