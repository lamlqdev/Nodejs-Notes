# Node.js Learning Notes

A comprehensive collection of Node.js learning materials and practical examples covering core concepts, APIs, databases, authentication, and advanced patterns.

---

## 1. Fundamentals

- **[Node.js Core Concepts](./01_Fundamentals/Node_Core_Concepts/README.md)** - Event Loop, V8 Engine, Node.js Architecture.
- **[NPM & Package Management](./01_Fundamentals/NPM_NVM/Node_Package_Manager.md)** - package.json, npm scripts, dependencies, semantic versioning.
- **[NVM & Version Management](./01_Fundamentals/NPM_NVM/Node_Version_Manager.md)** - Node.js version manager, nvm, node version management.
- **[Module Systems](./01_Fundamentals/ES6/Module_Systems.md)** - CommonJS vs ES Modules, require vs import.

## 2. File System & Streams

- **[File System Basics](./02_File_System/FS_Basics/README.md)** - readFile, writeFile, sync vs async operations.
- **[Streams](./02_File_System/Streams/README.md)** - Readable, Writable, Transform, Duplex streams.
- **[Path Manipulation](./02_File_System/Path_Manipulation/README.md)** - path module, file operations, directory handling.

## 3. Web Basics

- **[Web Basics](./03_Web_Basic/README.md)** - http module, createServer, request/response, url.

## 4. Express.js Framework

- **[Working with Express.js](./04_Working_with_Express/README.md)** - Routing, middleware, custom middleware, project structure, error handling.
- **[Express.js Setup](./04_Working_with_Express/SETUP.md)** - Setup TypeScript with Node.js and Express.

## 5. Databases

- **[PostgreSQL & Prisma](./05_PostgreSQL_Prisma/README.md)** - SQL Database, Prisma ORM, Prisma schema, Prisma client, queries.
- **[MongoDB & Mongoose](./06_MongoDB_Mongoose/README.md)** - NoSQL Database, MongoDB, Mongoose ODM, schemas, models, queries.

## 6. Authentication & Security

- **[JWT Authentication](./07_JWT_Authentication/README.md)** - Token-based auth, access/refresh tokens.
- **[Session Authentication](./08_Session_Authentication/README.md)** - Session-based auth, session storage.

## 7. API Development

- **[REST API Design](./09_Restful_API_Design/README.md)** - RESTful API design principles, layered architecture, schema-based validation, error handling, role-based authorization, pagination and filtering.
- **[API Documentation and Logging](./10_Restful_API_Logging_Documents/README.md)** - API documentation with Swagger/OpenAPI and structured logging with Winston.

## 8. File Handling & Cloud Storage

- **[File Upload](./11_File_Handling/README.md)** - Multer, single/multiple file upload, file validation.
- **[Cloudinary Upload](./12_Cloudinary_Upload/README.md)** - Cloudinary integration, cloud storage, image/file management.

## 9. Performance & Scaling

- **[Performance & Scaling](./13_Performance/README.md)** - Caching strategies, clustering, load balancing, PM2 process management.

## 10. Sending Emails with Resend

- **[Resend Email API](./14_Resend_Email/README.md)** - Transactional emails, Resend SDK, batch sending, scheduling, rate limiting.

## 11. Background Jobs

- **[Background Jobs API](./15_Background_Jobs/README.md)** - Job queues, BullMQ, Redis, cron scheduling, task processing.

## 12. Real-Time Communication

- **[Real-Time Communication](./16_Real_Time_Communication/README.md)** - WebSockets, Server-Sent Events (SSE), polling, Socket.io.

---

## 13. Testing

- **[Unit Testing](./17_Testing/Unit_Testing/README.md)** - Jest, Mocha, test structure, mocking
- **[Integration Testing](./17_Testing/Integration_Testing/README.md)** - Supertest, API testing, database testing
- **[E2E Testing](./17_Testing/E2E_Testing/README.md)** - End-to-end testing strategies, test databases

## 14. Deployment & DevOps

- **[Environment Configuration](./18_Deployment/Environment_Config/README.md)** - dotenv, config management, environment variables
- **[Docker](./18_Deployment/Docker/README.md)** - Dockerfile, docker-compose, containerization
- **[CI/CD](./18_Deployment/CI_CD/README.md)** - GitHub Actions, automated testing, deployment pipelines
- **[Production Best Practices](./18_Deployment/Production_Best_Practices/README.md)** - Monitoring, logging, scaling, security

## 15. Advanced Topics

- **[Microservices](./19_Advanced_Topics/Microservices/README.md)** - Service architecture, inter-service communication
- **[Message Queues](./19_Advanced_Topics/Message_Queues/README.md)** - RabbitMQ, Kafka basics, event-driven architecture
- **[GraphQL](./19_Advanced_Topics/GraphQL/README.md)** - Subscriptions, federation, schema stitching
- **[TypeScript with Node.js](./19_Advanced_Topics/TypeScript_Node/README.md)** - TypeScript setup, type safety, best practices
