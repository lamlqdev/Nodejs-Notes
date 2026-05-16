# Clustering & Process Management in Node.js

A practical guide to scaling Node.js applications using the built-in Cluster
module and PM2 process manager — covering multi-core utilization, load
balancing, zero-downtime reloads, and production process management.

---

## 1. Core Concepts

### The Problem: Node.js is Single-Threaded

Node.js runs on a single thread, which means by default it can only use
**one CPU core** regardless of how many cores the server has.

```
4-core server running a single Node.js process:

Core 1: ████████████████  ← Node.js process (100% utilized)
Core 2: ░░░░░░░░░░░░░░░░  ← idle, wasted
Core 3: ░░░░░░░░░░░░░░░░  ← idle, wasted
Core 4: ░░░░░░░░░░░░░░░░  ← idle, wasted
```

**Clustering** solves this by spawning multiple Node.js processes — one per
CPU core — all sharing the same port and handling requests in parallel.

```
4-core server with clustering:

Core 1: ████████████████  ← Worker process 1
Core 2: ████████████████  ← Worker process 2
Core 3: ████████████████  ← Worker process 3
Core 4: ████████████████  ← Worker process 4
                             ↑ all handling requests simultaneously
```

### Key Terms

| Term | Meaning |
|---|---|
| **Master process** | Spawns and manages worker processes, doesn't handle requests |
| **Worker process** | Handles actual HTTP requests, one per CPU core |
| **IPC** | Inter-Process Communication — how master and workers communicate |
| **Round-robin** | Default load balancing — requests distributed evenly across workers |
| **Fork** | Creating a child process as a copy of the parent |

---

## 2. Node.js Cluster Module

The built-in `cluster` module allows a Node.js app to create child processes
(workers) that all share the same server port.

### 2.1. Basic Cluster Setup

```typescript
import cluster from 'cluster';
import os from 'os';
import express from 'express';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} running`);
  console.log(`Forking ${numCPUs} workers...`);

  // Fork one worker per CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart worker if it dies
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Each worker runs this code independently
  const app = express();

  app.get('/', (req, res) => {
    res.json({ pid: process.pid, message: 'Hello from worker' });
  });

  app.listen(3000, () => {
    console.log(`Worker ${process.pid} listening on port 3000`);
  });
}
```

**How requests are distributed:**
```
Incoming requests → Master (port 3000)
                         ↓ round-robin
              ┌──────────┼──────────┐
           Worker 1  Worker 2  Worker 3
           (pid 101) (pid 102) (pid 103)
```

### 2.2. Communication Between Master and Workers

Workers are isolated processes — they don't share memory. Use IPC messaging
to coordinate between master and workers.

```typescript
// Master sends message to all workers
if (cluster.isPrimary) {
  for (const worker of Object.values(cluster.workers ?? {})) {
    worker?.send({ type: 'config_update', data: { timeout: 5000 } });
  }
}

// Worker listens for messages from master
if (cluster.isWorker) {
  process.on('message', (msg: { type: string; data: unknown }) => {
    if (msg.type === 'config_update') {
      console.log('Config updated:', msg.data);
    }
  });

  // Worker sends message to master
  process.send?.({ type: 'ready', pid: process.pid });
}
```

### 2.3. Graceful Shutdown in Cluster Mode

Workers should stop accepting new requests and finish in-flight requests
before shutting down:

```typescript
// In worker process
process.on('SIGTERM', () => {
  server.close(() => {
    console.log(`Worker ${process.pid} shut down gracefully`);
    process.exit(0);
  });
});
```

### 2.4. Limitations of the Cluster Module

- **No shared memory** — each worker has its own memory space
- **Session affinity** — if sessions are stored in-memory, different workers
  won't share them (use Redis for sessions instead)
- **Manual management** — no built-in monitoring, restart on crash, or
  zero-downtime reload
- **Stateful data** — anything stored in a variable is per-worker only

**Solution for stateful data:**
```
❌ Store sessions in process memory  →  Only one worker knows about the session
✅ Store sessions in Redis           →  All workers share the same session store
```

---

## 3. PM2 Process Manager

While the Cluster module is powerful, managing it manually in production is
tedious. **PM2** abstracts all of this and adds monitoring, logging, and
deployment features.

### 3.1. What is PM2?

PM2 (Process Manager 2) is a production-ready process manager for Node.js.
It wraps the Cluster module and adds:

- Automatic restart on crash
- Zero-downtime reloads
- Centralized logging
- Real-time monitoring
- Startup scripts (auto-start on server reboot)
- Ecosystem file for multi-app/multi-env config

### 3.2. Installation

```bash
npm install -g pm2
pm2 --version
```

### 3.3. Basic Commands

```bash
# Start application
pm2 start app.js
pm2 start npm --name "my-app" -- start   # via npm script

# List all processes
pm2 list
pm2 ls

# Stop / restart / delete
pm2 stop my-app
pm2 restart my-app
pm2 delete my-app
pm2 delete all

# Reload (zero downtime)
pm2 reload my-app

# View logs
pm2 logs
pm2 logs my-app

# Real-time monitoring dashboard
pm2 monit

# Process details
pm2 show my-app
```

### 3.4. Cluster Mode with PM2

```bash
# Start with all CPU cores
pm2 start app.js -i max

# Start with specific number of instances
pm2 start app.js -i 4

# Zero-downtime reload after code update
pm2 reload my-app
```

**How PM2 reload works (zero downtime):**
```
Before reload:  Worker 1 ✅  Worker 2 ✅  Worker 3 ✅  Worker 4 ✅

Step 1:         Worker 1 🔄  Worker 2 ✅  Worker 3 ✅  Worker 4 ✅
                (restarting)  (serving)    (serving)    (serving)

Step 2:         Worker 1 ✅  Worker 2 🔄  Worker 3 ✅  Worker 4 ✅
                (new code)   (restarting) (serving)    (serving)

Step 3:         Worker 1 ✅  Worker 2 ✅  Worker 3 🔄  Worker 4 ✅

Step 4:         Worker 1 ✅  Worker 2 ✅  Worker 3 ✅  Worker 4 🔄

Done:           All workers running new code, no downtime ✅
```

### 3.5. Ecosystem File

The ecosystem file is the recommended way to configure PM2 in production.
Check it into version control (without secrets):

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'my-app',
      script: './dist/server.js',

      // Clustering
      instances: 'max',       // or a number like 4
      exec_mode: 'cluster',

      // Restart behavior
      autorestart: true,
      max_memory_restart: '1G',  // restart if exceeds 1GB RAM
      watch: false,              // don't watch files in production

      // Logging
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,          // merge logs from all instances

      // Graceful shutdown
      kill_timeout: 5000,        // wait 5s before force kill

      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
```

```bash
# Start using ecosystem file
pm2 start ecosystem.config.js
pm2 start ecosystem.config.js --env production

# Reload using ecosystem file
pm2 reload ecosystem.config.js --env production
```

### 3.6. Logging

```bash
# View logs (all processes)
pm2 logs

# View logs for specific app
pm2 logs my-app

# Clear logs
pm2 flush

# Install log rotation (prevents logs from growing forever)
pm2 install pm2-logrotate
```

### 3.7. Monitoring

```bash
# Interactive real-time dashboard
pm2 monit
```

Dashboard shows:
- CPU and memory usage per process
- Request count and response times
- Restart count and uptime
- Log output stream

### 3.8. Auto-Start on Server Reboot

```bash
# Generate startup script for your OS (systemd, launchd, etc.)
pm2 startup

# Save current process list — PM2 restores these on reboot
pm2 save
```

---

## 4. Cluster Module vs PM2

| Feature | Cluster Module | PM2 |
|---|---|---|
| Multi-core utilization | ✅ Manual | ✅ Automatic |
| Auto-restart on crash | ✅ Manual | ✅ Built-in |
| Zero-downtime reload | ✅ Manual | ✅ Built-in |
| Monitoring dashboard | ❌ | ✅ `pm2 monit` |
| Centralized logging | ❌ | ✅ Built-in |
| Startup on reboot | ❌ | ✅ `pm2 startup` |
| Ecosystem config file | ❌ | ✅ |
| External dependency | ❌ (built-in) | ✅ npm install |
| Learning overhead | Low | Low |

**Rule of thumb:**
- **Development / learning** → Cluster module directly, understand the fundamentals
- **Production** → PM2, don't reinvent process management

---

## 5. Best Practices

**Use Redis for shared state** — never store sessions, cache, or shared data
in process memory when running multiple workers.

**Set memory limits** — configure `max_memory_restart` so a memory leak in
one worker doesn't take down the whole server.

**Use ecosystem files** — commit `ecosystem.config.js` to version control,
keep secrets in environment variables or a secrets manager.

**Test reloads before production** — verify `pm2 reload` works correctly in
staging, especially with WebSocket connections or long-running requests.

**Monitor after deployment** — watch `pm2 monit` for a few minutes after
deploying to catch immediate issues.

---

## 6. Resources

- [Node.js Cluster Module](https://nodejs.org/api/cluster.html) — official docs
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/) — official PM2 docs
- [PM2 Ecosystem File](https://pm2.keymetrics.io/docs/usage/application-declaration/) — config reference
- [PM2 GitHub](https://github.com/Unitech/pm2) — source and issues
