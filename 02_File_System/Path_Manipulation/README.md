# Node.js Path Manipulation Guide

## Core Terminology

### What is Path Manipulation?

Path manipulation refers to the process of working with file and directory paths in a programmatic way. The Node.js `path` module provides utilities for handling and transforming file paths across different operating systems.

### Key Concepts

**Absolute Path**: A complete path from the root directory to a specific file or folder.

- Example (POSIX): `/home/user/project/src/index.ts`
- Example (Windows): `C:\Users\user\project\src\index.ts`

**Relative Path**: A path relative to the current working directory.

- Example: `./src/index.ts` or `../config/settings.json`

**Path Segment**: Individual parts of a path separated by delimiters.

- Example: In `/home/user/docs`, the segments are `home`, `user`, and `docs`

**Path Delimiter**: The character used to separate path segments.

- Example (POSIX): `/`
- Example (Windows): `\`

**Path Separator**: The character used to separate multiple paths in environment variables.

- Example (POSIX): `:` (e.g., `/usr/bin:/bin`)
- Example (Windows): `;` (e.g., `C:\Windows;C:\Program Files`)

---

## Common Path Methods

### 1. `path.join()`

**Purpose**: Joins multiple path segments into a single path, normalizing the result.

![join syntax](./public/join.png)

#### Example 1: Building a file path

```typescript
import { join } from "path";

const projectRoot = "/home/user/myapp";
const configFile = join(projectRoot, "config", "database.json");

console.log(configFile);
// Output: /home/user/myapp/config/database.json
```

**Explanation**: `join()` combines the segments and handles the correct path delimiters. It's perfect for building paths dynamically without worrying about trailing or leading slashes.

#### Example 2: Navigating up directories

```typescript
import { join } from "path";

const currentFile = "/home/user/myapp/src/controllers/user.controller.ts";
const utilsPath = join(currentFile, "..", "..", "utils", "validation.ts");

console.log(utilsPath);
// Output: /home/user/myapp/src/utils/validation.ts
```

**Explanation**: The `..` segments move up the directory tree. `join()` automatically normalizes the path, removing unnecessary segments.

---

### 2. `path.resolve()`

**Purpose**: Resolves a sequence of paths into an absolute path, treating each segment as a navigation instruction.

![resolve syntax](./public/resolve.png)

#### Example 1: Getting absolute path from relative

```typescript
import { resolve } from "path";

// Assume current working directory is: /home/user/myapp
const absolutePath = resolve("src", "models", "user.model.ts");

console.log(absolutePath);
// Output: /home/user/myapp/src/models/user.model.ts
```

**Explanation**: `resolve()` starts from the current working directory and builds an absolute path. This is useful when you need to ensure you're working with absolute paths.

#### Example 2: Using \_\_dirname equivalent in ES modules

```typescript
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = resolve(__dirname, "../config/app.config.ts");

console.log(configPath);
// Output: /home/user/myapp/config/app.config.ts (assuming __dirname is /home/user/myapp/src)
```

**Explanation**: In ES modules, `__dirname` isn't available by default. This pattern converts the module URL to a file path, then uses `resolve()` to navigate to other files relative to the current module.

---

### 3. `path.basename()`

**Purpose**: Returns the last portion of a path (the file or directory name).

![basename syntax](./public/basename.png)

#### Example 1: Getting filename

```typescript
import { basename } from "path";

const filePath = "/home/user/documents/report.pdf";
const fileName = basename(filePath);

console.log(fileName);
// Output: report.pdf
```

**Explanation**: Extracts just the filename from a full path. Useful for logging or displaying file names to users.

#### Example 2: Getting filename without extension

```typescript
import { basename } from "path";

const filePath = "/home/user/documents/report.pdf";
const fileNameNoExt = basename(filePath, ".pdf");

console.log(fileNameNoExt);
// Output: report
```

**Explanation**: By providing the extension as the second argument, you get the filename without its extension. This is helpful for renaming files or creating related files.

---

### 4. `path.dirname()`

**Purpose**: Returns the directory name of a path (everything except the last segment).

![dirname syntax](./public/dirname.png)

#### Example: Getting parent directory

```typescript
import { dirname } from "path";

const filePath = "/home/user/myapp/src/controllers/user.controller.ts";
const directory = dirname(filePath);

console.log(directory);
// Output: /home/user/myapp/src/controllers
```

**Explanation**: Returns the containing directory of a file or folder. Essential when you need to work with files in the same directory or navigate to parent directories.

#### Real-world Example: Creating a log file in the same directory

```typescript
import { dirname, basename, join } from "path";
import { writeFile } from "fs/promises";

async function createLogFile(sourceFile: string, logMessage: string) {
  const directory = dirname(sourceFile);
  const logFileName = basename(sourceFile, ".ts") + ".log";
  const logPath = join(directory, logFileName);

  await writeFile(logPath, logMessage);
  console.log(`Log created at: ${logPath}`);
}

// Usage
await createLogFile("/home/user/myapp/src/app.ts", "Application started");
// Creates: /home/user/myapp/src/app.log
```

**Explanation**: This example combines multiple path methods to create a log file in the same directory as the source file, with a related name.

---

### 5. `path.extname()`

**Purpose**: Returns the file extension of a path.

![extname syntax](./public/extname.png)

#### Example 1: Getting file extension

```typescript
import { extname } from "path";

const filePath = "/home/user/documents/report.pdf";
const extension = extname(filePath);

console.log(extension);
// Output: .pdf
```

**Explanation**: Extracts the file extension including the dot. Returns an empty string if there's no extension.

#### Real-world Example: File type validation

```typescript
import { extname } from "path";

function isImageFile(filePath: string): boolean {
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = extname(filePath).toLowerCase();
  return validExtensions.includes(ext);
}

console.log(isImageFile("/uploads/avatar.png")); // Output: true
console.log(isImageFile("/uploads/document.pdf")); // Output: false
```

**Explanation**: Useful for validating file types before processing uploads or determining how to handle different file types.

---

### 6. `path.parse()`

**Purpose**: Returns an object with all the components of a path.

![parse syntax](./public/parse.png)

#### Example: Parsing a complete path

```typescript
import { parse } from "path";

const filePath = "/home/user/myapp/src/models/user.model.ts";
const parsed = parse(filePath);

console.log(parsed);
/* Output:
{
  root: '/',
  dir: '/home/user/myapp/src/models',
  base: 'user.model.ts',
  ext: '.ts',
  name: 'user.model'
}
*/
```

**Explanation**: Breaks down a path into all its components. This is invaluable when you need to manipulate multiple parts of a path or understand its structure.

#### Real-world Example: Creating backup files

```typescript
import { parse, join } from "path";
import { copyFile } from "fs/promises";

async function createBackup(originalPath: string) {
  const parsed = parse(originalPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupName = `${parsed.name}_backup_${timestamp}${parsed.ext}`;
  const backupPath = join(parsed.dir, backupName);

  await copyFile(originalPath, backupPath);
  console.log(`Backup created: ${backupPath}`);
  return backupPath;
}

// Usage
await createBackup("/home/user/data/config.json");
// Creates: /home/user/data/config_backup_2024-01-04T10-30-00-000Z.json
```

**Explanation**: Uses `parse()` to deconstruct the original path, then rebuilds a new path with a timestamp for the backup file.

---

### 7. `path.format()`

**Purpose**: Returns a path string from an object (opposite of `path.parse()`).

![format syntax](./public/format.png)

#### Example: Building a path from components

```typescript
import { format } from "path";

const pathObject = {
  dir: "/home/user/myapp/src",
  name: "database",
  ext: ".config.ts",
};

const fullPath = format(pathObject);

console.log(fullPath);
// Output: /home/user/myapp/src/database.config.ts
```

**Explanation**: Constructs a path from an object. Note that `base` takes precedence over `name` + `ext` if both are provided.

#### Real-world Example: Generating file variations

```typescript
import { parse, format } from "path";

function generateFileVariations(originalPath: string) {
  const parsed = parse(originalPath);

  const variations = {
    minified: format({
      dir: parsed.dir,
      name: parsed.name + ".min",
      ext: parsed.ext,
    }),
    sourcemap: format({
      dir: parsed.dir,
      name: parsed.name,
      ext: parsed.ext + ".map",
    }),
    compiled: format({
      dir: parsed.dir,
      name: parsed.name,
      ext: ".js",
    }),
  };

  return variations;
}

const variations = generateFileVariations("/src/app.ts");
console.log(variations);
/* Output:
{
  minified: '/src/app.min.ts',
  sourcemap: '/src/app.ts.map',
  compiled: '/src/app.js'
}
*/
```

**Explanation**: Demonstrates how to create related file paths by parsing, modifying, and formatting paths. Useful in build tools or bundlers.

---

### 8. `path.isAbsolute()`

**Purpose**: Determines whether a path is an absolute path.

![isAbsolute syntax](./public/isAbsolute.png)

#### Example: Checking path types

```typescript
import { isAbsolute } from "path";

console.log(isAbsolute("/home/user/file.txt")); // Output: true
console.log(isAbsolute("./src/index.ts")); // Output: false
console.log(isAbsolute("../config/app.json")); // Output: false
console.log(isAbsolute("C:\\Users\\file.txt")); // Output: true (on Windows)
```

**Explanation**: Helps validate paths before operations that require absolute paths, preventing errors from relative path usage.

#### Real-world Example: Path validation in configuration

```typescript
import { isAbsolute } from "path";

interface AppConfig {
  logDirectory: string;
  dataDirectory: string;
}

function validateConfig(config: AppConfig): void {
  const errors: string[] = [];

  if (!isAbsolute(config.logDirectory)) {
    errors.push("logDirectory must be an absolute path");
  }

  if (!isAbsolute(config.dataDirectory)) {
    errors.push("dataDirectory must be an absolute path");
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`);
  }
}

// Usage
const config = {
  logDirectory: "./logs", // This will cause an error
  dataDirectory: "/var/data",
};

try {
  validateConfig(config);
} catch (error) {
  console.error(error.message);
  // Output: Configuration errors:
  // logDirectory must be an absolute path
}
```

**Explanation**: Ensures critical configuration paths are absolute to prevent issues when the working directory changes.

---

### 9. `path.relative()`

**Purpose**: Returns the relative path from one location to another.

![relative syntax](./public/relative.png)

#### Example: Finding relative path

```typescript
import { relative } from "path";

const from = "/home/user/myapp/src/controllers";
const to = "/home/user/myapp/src/models/user.model.ts";

const relativePath = relative(from, to);

console.log(relativePath);
// Output: ../models/user.model.ts
```

**Explanation**: Calculates how to navigate from one path to another using relative references. Essential for creating portable path references.

#### Real-world Example: Generating import statements

```typescript
import { relative, dirname } from "path";

function generateImportPath(fromFile: string, toFile: string): string {
  const fromDir = dirname(fromFile);
  const relativePath = relative(fromDir, toFile);

  // Remove .ts extension and ensure it starts with ./
  const importPath = relativePath.replace(/\.ts$/, "");
  const normalizedPath = importPath.startsWith(".")
    ? importPath
    : `./${importPath}`;

  return normalizedPath;
}

const currentFile = "/home/user/myapp/src/controllers/user.controller.ts";
const targetFile = "/home/user/myapp/src/services/user.service.ts";

const importStatement = generateImportPath(currentFile, targetFile);
console.log(`import { UserService } from '${importStatement}';`);
// Output: import { UserService } from '../services/user.service';
```

**Explanation**: Generates correct relative import paths for TypeScript modules. This is particularly useful in code generation tools or refactoring scripts.

---

## Best Practices

**Always use path methods instead of string concatenation**: Different operating systems use different path delimiters.

```typescript
// ❌ Bad
const filePath = baseDir + "/" + filename;

// ✅ Good
import { join } from "path";
const filePath = join(baseDir, filename);
```

**Use `resolve()` for absolute paths**: When you need to ensure a path is absolute.

```typescript
// ✅ Good
import { resolve } from "path";
const configPath = resolve(process.cwd(), "config", "app.json");
```

**Normalize user input paths**: Always normalize paths from user input to prevent directory traversal attacks.

```typescript
import { normalize, resolve } from "path";

function sanitizePath(userPath: string, baseDir: string): string {
  const normalized = normalize(userPath);
  const resolved = resolve(baseDir, normalized);

  // Ensure the resolved path is within baseDir
  if (!resolved.startsWith(baseDir)) {
    throw new Error("Invalid path: outside allowed directory");
  }

  return resolved;
}
```

**Use `parse()` for complex path manipulation**: When you need to work with multiple path components.

**Check if paths are absolute before operations**: Use `isAbsolute()` to validate paths in configuration or user input.

---

## References

- [Node.js Official Documentation - Path Module](https://nodejs.org/api/path.html)
- [MDN Web Docs - File and Directory Paths](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework)
- [Node.js Best Practices - File System](https://github.com/goldbergyoni/nodebestpractices#2-error-handling-practices)
- [TypeScript Node.js Starter](https://github.com/microsoft/TypeScript-Node-Starter)
