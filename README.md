# Node.js Learning Notes

A comprehensive collection of Node.js learning materials and practical examples covering core concepts, APIs, databases, authentication, and advanced patterns.

---

## Table of Contents

### 1. Fundamentals

- **[Node.js Core Concepts](./01_Fundamentals/Node_Core_Concepts/README.md)** - Event Loop, V8 Engine, Node.js Architecture
- **[NPM & Package Management](./01_Fundamentals/NPM_Package_Management/README.md)** - package.json, npm scripts, dependencies, semantic versioning
- **[Module Systems](./01_Fundamentals/Module_Systems/README.md)** - CommonJS vs ES Modules, require vs import

### 2. File System & Streams

- **[File System Basics](./02_File_System/FS_Basics/README.md)** - readFile, writeFile, sync vs async operations
- **[Streams](./02_File_System/Streams/README.md)** - Readable, Writable, Transform, Duplex streams
- **[Path Manipulation](./02_File_System/Path_Manipulation/README.md)** - path module, file operations, directory handling

### 3. Web Basics

- **[Web basics](./03_Web_Basic/README.md)** - http module, createServer, request/response, url.

### 4. Express.js Framework

- **[Working with Express.js](./04_Working_with_Express/README.md)** - Setup, routing, middleware, custom middleware, project structure, error handling

### 5. Databases

- **[MongoDB & Mongoose](./06_Databases/MongoDB_Mongoose/README.md)** - Mongoose ODM, schemas, models, queries
- **[PostgreSQL & Sequelize](./06_Databases/PostgreSQL_Sequelize/README.md)** - Sequelize ORM, migrations, associations
- **[Database Design](./06_Databases/Database_Design/README.md)** - Relationships, indexing, normalization
- **[Query Optimization](./06_Databases/Query_Optimization/README.md)** - Performance, indexing strategies, query analysis

### 6. Authentication & Security

- **[JWT Authentication](./07_Authentication_Security/JWT_Authentication/README.md)** - Token-based auth, access/refresh tokens
- **[Session Management](./07_Authentication_Security/Session_Management/README.md)** - Express-session, cookies, session storage
- **[Password Security](./07_Authentication_Security/Password_Security/README.md)** - bcrypt, hashing, password policies
- **[OAuth & Social Login](./07_Authentication_Security/OAuth_Social_Login/README.md)** - Google, GitHub, Facebook OAuth
- **[Security Best Practices](./07_Authentication_Security/Security_Best_Practices/README.md)** - Helmet, CORS, rate limiting, XSS/CSRF protection

### 8. API Development

- **[REST API Design](./08_API_Development/REST_API_Design/README.md)** - RESTful principles, endpoints, HTTP methods
- **[CRUD Operations](./08_API_Development/CRUD_Operations/README.md)** - Create, Read, Update, Delete patterns
- **[API Documentation](./08_API_Development/API_Documentation/README.md)** - Swagger/OpenAPI, Postman collections
- **[GraphQL](./08_API_Development/GraphQL/README.md)** - Apollo Server, resolvers, queries, mutations, subscriptions

### 9. Data Querying & Features

- **[Pagination](./09_Data_Querying/Pagination/README.md)** - Offset-based, cursor-based, page-based pagination
- **[Filtering](./09_Data_Querying/Filtering/README.md)** - Query params filtering, advanced operators, dynamic filters
- **[Sorting](./09_Data_Querying/Sorting/README.md)** - Single/multi-field sorting, dynamic sorting
- **[Search](./09_Data_Querying/Search/README.md)** - Text search, full-text search, fuzzy search, Elasticsearch
- **[Aggregation](./09_Data_Querying/Aggregation/README.md)** - Data aggregation, statistics, grouping
- **[Bulk Operations](./09_Data_Querying/Bulk_Operations/README.md)** - Bulk create/update/delete

### 10. Validation & Error Handling

- **[Input Validation](./10_Validation_Error_Handling/Input_Validation/README.md)** - Joi, Zod, express-validator
- **[Error Handling](./10_Validation_Error_Handling/Error_Handling/README.md)** - Error middleware, custom errors, error types
- **[Logging](./10_Validation_Error_Handling/Logging/README.md)** - Winston, Morgan, structured logging, error tracking

### 11. File Handling

- **[File Upload](./11_File_Handling/File_Upload/README.md)** - Multer, single/multiple file upload, file validation
- **[Image Processing](./11_File_Handling/Image_Processing/README.md)** - Sharp, resize, compress, format conversion
- **[Cloud Storage](./11_File_Handling/Cloud_Storage/README.md)** - AWS S3, Cloudinary, file storage integration
- **[Export/Import](./11_File_Handling/Export_Import/README.md)** - CSV/Excel export, PDF generation, data import

### 12. Email & Notifications

- **[Email Basics](./12_Email_Notifications/Email_Basics/README.md)** - Nodemailer, SMTP configuration, basic emails
- **[Email Templates](./12_Email_Notifications/Email_Templates/README.md)** - HTML templates, Handlebars, template engines
- **[Email Queue](./12_Email_Notifications/Email_Queue/README.md)** - Queue emails with Bull, background processing
- **[Notifications](./12_Email_Notifications/Notifications/README.md)** - In-app notifications, push notifications, email alerts

### 13. Background Jobs & Scheduling

- **[Job Queues](./13_Background_Jobs/Job_Queues/README.md)** - Bull, Redis queues, job processing
- **[Cron Jobs](./13_Background_Jobs/Cron_Jobs/README.md)** - node-cron, scheduled tasks, recurring jobs
- **[Task Scheduling](./13_Background_Jobs/Task_Scheduling/README.md)** - Advanced scheduling, job priorities

### 14. Real-Time Communication

- **[WebSockets](./14_Real_Time/WebSockets/README.md)** - Socket.io, native WebSockets, real-time events
- **[Server-Sent Events](./14_Real_Time/Server_Sent_Events/README.md)** - SSE implementation, one-way communication
- **[Real-Time Chat](./14_Real_Time/Real_Time_Chat/README.md)** - Complete chat application example

### 15. Testing

- **[Unit Testing](./15_Testing/Unit_Testing/README.md)** - Jest, Mocha, test structure, mocking
- **[Integration Testing](./15_Testing/Integration_Testing/README.md)** - Supertest, API testing, database testing
- **[E2E Testing](./15_Testing/E2E_Testing/README.md)** - End-to-end testing strategies, test databases

### 16. Performance & Optimization

- **[Caching](./16_Performance/Caching/README.md)** - Redis caching, in-memory caching, cache strategies
- **[Clustering](./16_Performance/Clustering/README.md)** - Cluster module, PM2, process management
- **[Load Balancing](./16_Performance/Load_Balancing/README.md)** - Load balancing strategies, horizontal scaling
- **[Performance Monitoring](./16_Performance/Performance_Monitoring/README.md)** - Profiling, memory leaks, performance metrics

### 17. Deployment & DevOps

- **[Environment Configuration](./17_Deployment/Environment_Config/README.md)** - dotenv, config management, environment variables
- **[Docker](./17_Deployment/Docker/README.md)** - Dockerfile, docker-compose, containerization
- **[CI/CD](./17_Deployment/CI_CD/README.md)** - GitHub Actions, automated testing, deployment pipelines
- **[Production Best Practices](./17_Deployment/Production_Best_Practices/README.md)** - Monitoring, logging, scaling, security

### 18. Advanced Topics

- **[Microservices](./18_Advanced_Topics/Microservices/README.md)** - Service architecture, inter-service communication
- **[Message Queues](./18_Advanced_Topics/Message_Queues/README.md)** - RabbitMQ, Kafka basics, event-driven architecture
- **[GraphQL Advanced](./18_Advanced_Topics/GraphQL_Advanced/README.md)** - Subscriptions, federation, schema stitching
- **[TypeScript with Node.js](./18_Advanced_Topics/TypeScript_Node/README.md)** - TypeScript setup, type safety, best practices

### 19. Practical Projects

- **[E-Commerce API](./19_Practical_Projects/E_Commerce_API/README.md)** - Complete e-commerce API with products, orders, payments
- **[Blog API](./19_Practical_Projects/Blog_API/README.md)** - Blog API with posts, comments, tags, search
- **[Social Media API](./19_Practical_Projects/Social_Media_API/README.md)** - Social media API with posts, likes, feeds, real-time
- **[Task Management API](./19_Practical_Projects/Task_Management_API/README.md)** - Task API with teams, assignments, notifications
