# Streams

Streams are a powerful abstraction in Node.js for handling reading and writing data in a continuous, memory-efficient manner. Instead of loading entire files into memory, streams process data in small chunks, making them ideal for handling large files or real-time data.

---

## Core Terminology

### What are Streams?

Streams are objects that let you read data from a source or write data to a destination continuously. They are an EventEmitter-based interface for working with streaming data in Node.js. Streams handle data piece by piece (chunks), without loading the entire content into memory at once.

### What is a Chunk?

A **chunk** is a small piece of data transferred at a time. Instead of loading an entire file (e.g., 1GB) into memory, streams break it down into smaller chunks (typically 16KB by default) and process them sequentially. This approach is memory-efficient and allows your code to start processing data before the entire file is available. Chunks are typically `Buffer` objects (binary data) or strings (if encoding is specified).

### Benefits of Streams

- **Memory Efficiency**: Process large files without loading them entirely into memory
- **Time Efficiency**: Start processing data as soon as the first chunk is available
- **Composability**: Chain multiple operations together using pipes
- **Backpressure Handling**: Automatically manage data flow speed between producer and consumer

### Types of Streams

| Type          | Description                                          | Common Use Cases                             |
| ------------- | ---------------------------------------------------- | -------------------------------------------- |
| **Readable**  | Streams you can read from (source of data)           | Reading files, HTTP responses, stdin         |
| **Writable**  | Streams you can write to (destination for data)      | Writing files, HTTP requests, stdout         |
| **Duplex**    | Streams that are both Readable and Writable          | TCP sockets, websockets                      |
| **Transform** | Duplex streams that modify data as it passes through | Compression, encryption, data transformation |

### How Streams Work with Buffers

Streams process data in chunks using buffers. This allows you to start working with data before the entire content is available:

![Streams and Buffers](./public/streams-buffers.png)

_The diagram shows how incoming data (like an HTTP request) flows through a stream in chunks, stored temporarily in a buffer, allowing your code to process data incrementally rather than waiting for the complete payload._

### Stream Modes

Streams operate in two modes:

- **Binary Mode**: Data is processed as Buffer objects (default)
- **Object Mode**: Data can be any JavaScript object (set with `objectMode: true`)

**Importing stream modules (ES Modules (Node.js 14+)):**

```typescript
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Transform } from "stream";
```

---

## Examples and Explanation

### Example 1: Readable Stream - Reading a File

**Syntax:**

`createReadStream(
  path: string | URL,
  options?: {
    encoding?: BufferEncoding;
    highWaterMark?: number;
    start?: number;
    end?: number;
  }
): ReadStream`

**Input:**

- `path`: The file path (absolute or relative) to read from
- `options` (optional): Configuration object
  - `encoding`: Character encoding (e.g., 'utf8'). If not set, chunks are Buffer objects
  - `highWaterMark`: Internal buffer size in bytes (default: 64KB)
  - `start`: Starting byte position to read from
  - `end`: Ending byte position to read to

**Output:**

- Returns a `ReadStream` object (Readable stream)
- Emits `data` events with chunks of the file
- Emits `end` event when reading is complete
- Emits `error` event if an error occurs

**Code Example:**

```typescript
import { createReadStream } from "fs";

async function readStreamExample() {
  try {
    const readStream = createReadStream("large-file.txt", {
      encoding: "utf8",
      highWaterMark: 16384, // 16KB chunks
    });

    let totalSize = 0;

    readStream.on("data", (chunk) => {
      totalSize += chunk.length;
      console.log(`Received ${chunk.length} bytes`);
      // Process chunk here
    });

    readStream.on("end", () => {
      console.log(`Finished reading. Total: ${totalSize} bytes`);
    });

    readStream.on("error", (error) => {
      console.error("Error reading stream:", error);
    });
  } catch (error) {
    console.error("Error setting up stream:", error);
  }
}

readStreamExample();
```

**Explanation:**

- Reads file in chunks rather than loading entire file into memory
- `data` event fires for each chunk received
- Memory usage remains constant regardless of file size
- Ideal for processing large files

### Example 2: Writable Stream - Writing to a File

**Syntax:**

`createWriteStream(
  path: string | URL,
  options?: {
    encoding?: BufferEncoding;
    flags?: string;
    mode?: number;
    highWaterMark?: number;
  }
): WriteStream`

**Input:**

- `path`: The file path (absolute or relative) to write to
- `options` (optional): Configuration object
  - `encoding`: Character encoding (default: 'utf8')
  - `flags`: File system flags (default: 'w' for write)
  - `mode`: File permission mode (default: 0o666)
  - `highWaterMark`: Buffer size threshold (default: 16KB)

**Output:**

- Returns a `WriteStream` object (Writable stream)
- `write()` method returns `true` if buffer is not full, `false` if backpressure should be applied
- Emits `drain` event when buffer is emptied and ready for more data
- Emits `finish` event when all data has been written
- Emits `error` event if an error occurs

**Code Example:**

```typescript
import { createWriteStream } from "fs";

async function writeStreamExample() {
  try {
    const writeStream = createWriteStream("output.txt", {
      encoding: "utf8",
    });

    // Write multiple chunks
    for (let i = 0; i < 1000; i++) {
      const canContinue = writeStream.write(`Line ${i + 1}\n`);

      // Handle backpressure
      if (!canContinue) {
        await new Promise((resolve) => writeStream.once("drain", resolve));
      }
    }

    // Signal that writing is complete
    writeStream.end(() => {
      console.log("Writing completed");
    });

    writeStream.on("error", (error) => {
      console.error("Error writing stream:", error);
    });
  } catch (error) {
    console.error("Error setting up stream:", error);
  }
}

writeStreamExample();
```

**Explanation:**

- Writes data in chunks without overwhelming memory
- Handles backpressure automatically when buffer is full
- `drain` event indicates buffer is ready for more data
- Efficient for writing large amounts of data

### Example 3: Piping Streams - Copy a File

**Syntax:**

`readableStream.pipe(
  destination: WritableStream,
  options?: { end?: boolean }
): WritableStream`

**Input:**

- `destination`: The writable stream to pipe data into
- `options` (optional): Configuration object
  - `end`: Whether to end the destination stream when source ends (default: true)

**Output:**

- Returns the destination stream for chaining
- Automatically handles data flow and backpressure
- Pipes all data from readable to writable stream

**Code Example:**

```typescript
import { createReadStream, createWriteStream } from "fs";

async function pipeExample() {
  try {
    const readStream = createReadStream("source.txt");
    const writeStream = createWriteStream("destination.txt");

    readStream.pipe(writeStream);

    writeStream.on("finish", () => {
      console.log("File copied successfully");
    });

    readStream.on("error", (error) => {
      console.error("Error reading:", error);
    });

    writeStream.on("error", (error) => {
      console.error("Error writing:", error);
    });
  } catch (error) {
    console.error("Error setting up pipe:", error);
  }
}

pipeExample();
```

**Explanation:**

- Simplest way to transfer data between streams
- Automatically manages backpressure
- Memory-efficient file copying
- Handles flow control automatically

### Example 4: Pipeline - Safe Stream Composition

**Syntax:**

`pipeline(
  ...streams: Array<Readable | Writable | Transform>,
  callback?: (error?: Error) => void
): Promise<void>`

**Input:**

- `streams`: One or more streams to connect (readable → transform(s) → writable)
- `callback` (optional): Error-first callback when pipeline completes or fails

**Output:**

- Returns a `Promise` that resolves when pipeline completes
- Automatically cleans up streams on error
- Properly destroys all streams if one fails

**Code Example:**

```typescript
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { createGzip } from "zlib";

async function pipelineExample() {
  try {
    await pipeline(
      createReadStream("input.txt"),
      createGzip(), // Transform stream for compression
      createWriteStream("input.txt.gz")
    );

    console.log("File compressed successfully");
  } catch (error) {
    console.error("Pipeline failed:", error);
  }
}

pipelineExample();
```

**Explanation:**

- Preferred over `.pipe()` for better error handling
- Automatically destroys all streams on error
- Can chain multiple transform streams
- Returns a Promise for easier async/await usage

---

## Common Use Cases

### Reading Large Files

```typescript
import { createReadStream } from "fs";

createReadStream("huge-log.txt", { encoding: "utf8" })
  .on("data", (chunk) => processChunk(chunk))
  .on("end", () => console.log("Done"))
  .on("error", (error) => console.error(error));
```

### HTTP File Upload

```typescript
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

app.post("/upload", async (req, res) => {
  try {
    await pipeline(req, createWriteStream("uploaded-file.dat"));
    res.send("Upload successful");
  } catch (error) {
    res.status(500).send("Upload failed");
  }
});
```

### Data Processing Pipeline

```typescript
import { createReadStream, createWriteStream } from "fs";
import { createGzip } from "zlib";
import { pipeline } from "stream/promises";

await pipeline(
  createReadStream("data.json"),
  parseJSON, // Transform
  filterData, // Transform
  formatOutput, // Transform
  createGzip(),
  createWriteStream("output.json.gz")
);
```

---

## References

- [Node.js Stream Documentation](https://nodejs.org/api/stream.html)
- [Stream Handbook](https://github.com/substack/stream-handbook)
- [Streams Best Practices](https://nodejs.org/en/docs/guides/backpressuring-in-streams/)
- [Node.js Pipeline API](https://nodejs.org/api/stream.html#stream_stream_pipeline_streams_callback)
