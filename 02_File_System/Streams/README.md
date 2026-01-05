# Node.js Streams Guide

## Core Terminology

### What are Streams?

Streams are collections of data that might not be available all at once and don't have to fit in memory. Think of them like a conveyor belt where data arrives and is processed piece by piece, rather than as a whole batch.

![Streams and Buffers](./public/streams-buffers.png)

In Node.js, streams are instances of EventEmitter, which means they emit events that can be used to read and write data. There are four fundamental stream types in Node.js:

- Readable - streams from which data can be read (e.g., reading a file, HTTP response, stdin)
- Writable - streams to which data can be written (e.g., writing to a file, HTTP request, stdout)
- Duplex - streams that are both Readable and Writable (e.g., TCP sockets, WebSockets)
- Transform - Duplex streams that can modify or transform data as it's written or read (e.g., compression, encryption, data transformation)

Stream Modes:

- Binary Mode (default): Data is processed as Buffer objects, suitable for any file type.

- Object Mode: Data can be any JavaScript object (set with objectMode: true), useful for processing structured data.

### Key Concepts

- **Chunk**: A small piece of data transferred at a time. Instead of loading an entire file (e.g., 1GB) into memory, streams break it down into smaller chunks (typically 16KB by default) and process them sequentially.

- **Backpressure**: The mechanism that prevents a fast data source from overwhelming a slow consumer. When the writable stream's buffer is full, it signals the readable stream to pause until space is available.

- **Pipe**: A method that connects a readable stream to a writable stream, automatically managing data flow and backpressure.

- **Event Emitter**: Streams inherit from EventEmitter, allowing them to emit events like `data`, `end`, `error`, `drain`, etc.

- **Buffer**: An internal queue where chunks are temporarily stored before being processed or written.

### Benefits of Streams

- **Memory Efficiency**: Process large files without loading them entirely into memory. A 1GB file can be processed with only 16KB of memory at a time.

- **Time Efficiency**: Start processing data as soon as the first chunk is available, rather than waiting for the entire file to load.

- **Composability**: Chain multiple operations together using pipes, creating powerful data processing pipelines.

- **Backpressure Handling**: Automatically manage data flow speed between producer and consumer, preventing memory overflow.

---

## Common Stream Methods

### 1. `createReadStream()`

**Purpose**: Creates a readable stream for reading data from a file in chunks.

![createReadStream syntax](./public/createReadStream.png)

#### Example 1: Reading a large log file

```typescript
import { createReadStream } from "fs";

async function readLargeLog() {
  try {
    const stream = createReadStream("application.log", {
      encoding: "utf8",
      highWaterMark: 16384, // 16KB chunks
    });

    let lineCount = 0;
    let errorCount = 0;

    stream.on("data", (chunk: string) => {
      const lines = chunk.split("\n");
      lineCount += lines.length;
      errorCount += lines.filter((line) => line.includes("ERROR")).length;
    });

    stream.on("end", () => {
      console.log(`Processed ${lineCount} lines`);
      console.log(`Found ${errorCount} errors`);
    });

    stream.on("error", (error) => {
      console.error("Error reading file:", error);
    });
  } catch (error) {
    console.error("Failed to create stream:", error);
  }
}

readLargeLog();
```

**Explanation**: Reads a large log file in small chunks without loading the entire file into memory. This allows processing files that are larger than available RAM. Perfect for log analysis or data processing.

#### Real-world Example: Processing CSV data

```typescript
import { createReadStream } from "fs";

interface User {
  id: string;
  name: string;
  email: string;
}

async function processCSV(filePath: string) {
  const stream = createReadStream(filePath, { encoding: "utf8" });

  let buffer = "";
  const users: User[] = [];

  stream.on("data", (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split("\n");

    // Keep last incomplete line in buffer
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;

      const [id, name, email] = line.split(",");
      users.push({ id: id.trim(), name: name.trim(), email: email.trim() });
    }
  });

  stream.on("end", () => {
    // Process remaining buffer
    if (buffer.trim()) {
      const [id, name, email] = buffer.split(",");
      users.push({ id: id.trim(), name: name.trim(), email: email.trim() });
    }

    console.log(`Processed ${users.length} users`);
    console.log("First 5 users:", users.slice(0, 5));
  });

  stream.on("error", (error) => {
    console.error("CSV processing error:", error);
  });
}

processCSV("users.csv");
```

**Explanation**: Processes CSV data line by line, handling incomplete lines that span across chunks. This pattern is essential for parsing large CSV files efficiently without loading everything into memory.

---

### 2. `createWriteStream()`

**Purpose**: Creates a writable stream for writing data to a file in chunks.

![createWriteStream syntax](./public/createWriteStream.png)

#### Example: Writing large dataset

```typescript
import { createWriteStream } from "fs";

async function writeStreamExample() {
  try {
    const stream = createWriteStream("output.txt", { encoding: "utf8" });

    for (let i = 0; i < 1000000; i++) {
      const canContinue = stream.write(`Line ${i + 1}: ${Math.random()}\n`);

      // Handle backpressure
      if (!canContinue) {
        await new Promise((resolve) => stream.once("drain", resolve));
      }
    }

    stream.end(() => {
      console.log("Writing completed");
    });

    stream.on("error", (error) => {
      console.error("Error writing:", error);
    });
  } catch (error) {
    console.error("Failed to create write stream:", error);
  }
}

writeStreamExample();
```

**Explanation**: Writes a large amount of data while respecting backpressure. When `write()` returns `false`, it means the buffer is full, so we wait for the `drain` event before continuing. This prevents memory overflow.

#### Real-world Example: Generating reports

```typescript
import { createWriteStream } from "fs";

interface SalesRecord {
  date: string;
  product: string;
  amount: number;
  quantity: number;
}

async function generateSalesReport(records: SalesRecord[]) {
  const stream = createWriteStream("sales-report.csv", { encoding: "utf8" });

  // Write CSV header
  stream.write("Date,Product,Amount,Quantity\n");

  for (const record of records) {
    const line = `${record.date},${record.product},${record.amount},${record.quantity}\n`;
    const canWrite = stream.write(line);

    if (!canWrite) {
      // Wait for drain event if buffer is full
      await new Promise((resolve) => stream.once("drain", resolve));
    }
  }

  return new Promise<void>((resolve, reject) => {
    stream.end(() => {
      console.log("Report generated successfully");
      resolve();
    });

    stream.on("error", reject);
  });
}

// Usage
const salesData: SalesRecord[] = [
  { date: "2024-01-01", product: "Laptop", amount: 999.99, quantity: 5 },
  { date: "2024-01-02", product: "Mouse", amount: 29.99, quantity: 20 },
];

generateSalesReport(salesData);
```

**Explanation**: Generates a CSV report from structured data while handling backpressure. This is common in admin panels or reporting systems where users need to export large datasets.

---

### 3. `pipe()`

**Purpose**: Connects a readable stream to a writable stream, automatically managing data flow and backpressure.

![pipe syntax](./public/pipe.png)

#### Example: Copy file efficiently

```typescript
import { createReadStream, createWriteStream } from "fs";

async function copyFile(source: string, destination: string) {
  try {
    const readStream = createReadStream(source);
    const writeStream = createWriteStream(destination);

    readStream.pipe(writeStream);

    return new Promise<void>((resolve, reject) => {
      writeStream.on("finish", () => {
        console.log("File copied successfully");
        resolve();
      });

      readStream.on("error", reject);
      writeStream.on("error", reject);
    });
  } catch (error) {
    console.error("Copy failed:", error);
    throw error;
  }
}

copyFile("source.txt", "destination.txt");
```

**Explanation**: The simplest way to transfer data between streams. `pipe()` automatically manages backpressure and data flow, making it ideal for file copying operations.

#### Real-world Example: File download with progress

```typescript
import { createReadStream, createWriteStream } from "fs";
import { stat } from "fs/promises";

async function downloadWithProgress(source: string, destination: string) {
  try {
    const stats = await stat(source);
    const totalSize = stats.size;
    let downloaded = 0;

    const readStream = createReadStream(source);
    const writeStream = createWriteStream(destination);

    readStream.on("data", (chunk: Buffer) => {
      downloaded += chunk.length;
      const progress = ((downloaded / totalSize) * 100).toFixed(2);
      process.stdout.write(`\rProgress: ${progress}%`);
    });

    readStream.pipe(writeStream);

    return new Promise<void>((resolve, reject) => {
      writeStream.on("finish", () => {
        console.log("\nDownload complete!");
        resolve();
      });

      readStream.on("error", reject);
      writeStream.on("error", reject);
    });
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}

downloadWithProgress("large-file.zip", "downloaded.zip");
```

**Explanation**: Shows download progress by tracking bytes transferred. The `data` event allows monitoring progress while `pipe()` handles the actual data transfer efficiently.

---

### 4. `pipeline()`

**Purpose**: Safely composes multiple streams together with proper error handling and cleanup.

![pipeline syntax](./public/pipeline.png)

#### Example: Compress file

```typescript
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { createGzip } from "zlib";

async function compressFile(input: string, output: string) {
  try {
    await pipeline(
      createReadStream(input),
      createGzip(),
      createWriteStream(output)
    );

    console.log("File compressed successfully");
  } catch (error) {
    console.error("Compression failed:", error);
    throw error;
  }
}

compressFile("large-file.txt", "large-file.txt.gz");
```

**Explanation**: Preferred over `.pipe()` for better error handling. `pipeline()` automatically destroys all streams if any stream in the chain fails, preventing memory leaks.

#### Real-world Example: Image processing pipeline

```typescript
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Transform } from "stream";
import { createGzip } from "zlib";

// Custom transform stream for image metadata
class ImageMetadataExtractor extends Transform {
  constructor() {
    super();
  }

  _transform(chunk: Buffer, encoding: string, callback: Function) {
    // Extract metadata (simplified example)
    const metadata = {
      size: chunk.length,
      timestamp: new Date().toISOString(),
    };

    // Add metadata as header
    if (!this.headerWritten) {
      this.push(`Metadata: ${JSON.stringify(metadata)}\n`);
      this.headerWritten = true;
    }

    this.push(chunk);
    callback();
  }

  private headerWritten = false;
}

async function processImage(input: string, output: string) {
  try {
    await pipeline(
      createReadStream(input),
      new ImageMetadataExtractor(),
      createGzip(),
      createWriteStream(output)
    );

    console.log("Image processed and compressed");
  } catch (error) {
    console.error("Processing failed:", error);
  }
}

processImage("photo.jpg", "photo.processed.gz");
```

**Explanation**: Chains multiple transformations together. The pipeline reads the image, extracts metadata, compresses it, and writes to disk—all while using minimal memory through streaming.

---

### 5. `Transform Stream`

**Purpose**: Creates a custom stream that can modify data as it passes through.

**Syntax:**

```typescript
class CustomTransform extends Transform {
  _transform(chunk: Buffer, encoding: string, callback: Function): void {
    // Process chunk
    this.push(modifiedChunk);
    callback();
  }
}
```

**Input:**

- `chunk`: Data chunk to transform
- `encoding`: Character encoding
- `callback`: Function to call when done

**Output:**

- Use `this.push()` to send transformed data
- Call `callback()` when processing is complete

#### Example: Uppercase transform

```typescript
import { Transform } from "stream";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";

class UppercaseTransform extends Transform {
  _transform(chunk: Buffer, encoding: string, callback: Function) {
    const uppercased = chunk.toString().toUpperCase();
    this.push(uppercased);
    callback();
  }
}

async function convertToUppercase(input: string, output: string) {
  try {
    await pipeline(
      createReadStream(input, { encoding: "utf8" }),
      new UppercaseTransform(),
      createWriteStream(output)
    );

    console.log("File converted to uppercase");
  } catch (error) {
    console.error("Conversion failed:", error);
  }
}

convertToUppercase("input.txt", "output.txt");
```

**Explanation**: Creates a custom transformation that converts all text to uppercase. Transform streams are perfect for data manipulation, filtering, or formatting.

#### Real-world Example: Data sanitization stream

```typescript
import { Transform } from "stream";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";

class SanitizeTransform extends Transform {
  _transform(chunk: Buffer, encoding: string, callback: Function) {
    let text = chunk.toString();

    // Remove sensitive data patterns
    text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "XXX-XX-XXXX"); // SSN
    text = text.replace(/\b\d{16}\b/g, "XXXX-XXXX-XXXX-XXXX"); // Credit card
    text = text.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      "[EMAIL]"
    ); // Email

    this.push(text);
    callback();
  }
}

async function sanitizeLogFile(input: string, output: string) {
  try {
    await pipeline(
      createReadStream(input, { encoding: "utf8" }),
      new SanitizeTransform(),
      createWriteStream(output)
    );

    console.log("Log file sanitized");
  } catch (error) {
    console.error("Sanitization failed:", error);
  }
}

sanitizeLogFile("application.log", "sanitized.log");
```

**Explanation**: Removes sensitive information from log files before sharing or archiving. Transform streams are ideal for this because they process data in chunks without loading the entire file.

---

## Best Practices

1. **Always use pipeline() instead of pipe() for production code**: Better error handling and automatic cleanup.

```typescript
// ❌ Bad - No automatic cleanup on error
readStream.pipe(transformStream).pipe(writeStream);

// ✅ Good - Automatic cleanup and error handling
import { pipeline } from "stream/promises";
await pipeline(readStream, transformStream, writeStream);
```

2. **Handle backpressure properly**: Check the return value of `write()` and wait for `drain`.

```typescript
// ✅ Good
for (const item of largeDataset) {
  const canContinue = stream.write(item);
  if (!canContinue) {
    await new Promise((resolve) => stream.once("drain", resolve));
  }
}
```

3. **Always handle errors**: Streams can fail at any point.

```typescript
// ✅ Good
stream.on("error", (error) => {
  console.error("Stream error:", error);
  // Handle error appropriately
});
```

4. **Destroy streams when done or on error**: Prevent memory leaks.

```typescript
try {
  await pipeline(readStream, writeStream);
} catch (error) {
  // Streams are automatically destroyed by pipeline
  console.error("Pipeline failed:", error);
}
```

5. **Use appropriate highWaterMark**: Adjust buffer size based on your use case.

```typescript
// For large files, use larger chunks
const stream = createReadStream("large.file", {
  highWaterMark: 64 * 1024, // 64KB
});

// For real-time data, use smaller chunks
const realtimeStream = createReadStream("live.log", {
  highWaterMark: 1024, // 1KB for faster response
});
```

6. **Pause and resume streams when needed**: Control data flow.

```typescript
const stream = createReadStream("data.txt");

stream.on("data", (chunk) => {
  if (needToSlowDown) {
    stream.pause();

    // Resume after processing
    setTimeout(() => stream.resume(), 1000);
  }
});
```

---

## References

- [Node.js Stream Documentation](https://nodejs.org/api/stream.html)
- [Node.js Pipeline API](https://nodejs.org/api/stream.html#stream_stream_pipeline_streams_callback)
- [Stream Handbook](https://github.com/substack/stream-handbook)
- [Streams Best Practices](https://nodejs.org/en/docs/guides/backpressuring-in-streams/)
