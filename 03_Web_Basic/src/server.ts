import { IncomingMessage, ServerResponse, createServer } from "http";

const server = createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello, World!\n");
  }
);

server.listen(3000, "localhost", () => {
  console.log(`🚀 Server running at http://localhost:3000`);
});
