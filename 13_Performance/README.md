# PM2 Process Manager

## 1. Core Terminology

### What is PM2?

**PM2** (Process Manager 2) is a powerful, production-ready process manager for Node.js applications. PM2 allows you to maintain applications alive forever, reload them without downtime, and facilitate common system admin tasks.

### Why Use PM2?

PM2 provides essential features for running Node.js applications in production:

#### 1. **Background Process Management**

PM2 runs applications as background processes (daemons), completely detached from terminal sessions. This means you can close your terminal or SSH session without stopping your application. Unlike running applications with `node app.js` or `npm start`, PM2-managed processes continue running even after you disconnect.

**Without PM2:**
```bash
node app.js  # Process stops when terminal closes
```

**With PM2:**
```bash
pm2 start app.js  # Process continues running in background
```

#### 2. **Automatic Restart on Crashes**

PM2 automatically restarts your application if it crashes or encounters an unhandled error. This ensures high availability and reduces downtime. PM2 monitors your application and restarts it immediately when it detects a failure, without requiring manual intervention.

#### 3. **Zero-Downtime Reloads (Cluster Mode)**

PM2's cluster mode allows you to reload your application without any downtime. When you update your code, PM2 gracefully reloads instances one by one, ensuring that at least one instance is always serving requests. This is essential for production deployments where uptime is critical.

**How it works:**
- PM2 starts multiple instances of your application
- When reloading, PM2 stops instances one at a time
- New instances are started with updated code
- At least one instance always remains available to serve requests

#### 4. **CPU-Based Scaling**

PM2 can automatically scale your application based on the number of CPU cores available. In cluster mode, PM2 can spawn multiple instances of your application, with each instance running on a different CPU core. This maximizes resource utilization and improves performance.

#### 5. **Load Balancing**

When running multiple instances in cluster mode, PM2 automatically distributes incoming requests across all instances using Node.js's built-in cluster module. This load balancing improves application performance and ensures that no single instance is overwhelmed with traffic.

#### 6. **Process Lifecycle Management**

PM2 provides comprehensive commands to manage your application's lifecycle:

- **Start**: Launch your application
- **Stop**: Gracefully stop your application
- **Restart**: Restart your application (with downtime)
- **Reload**: Reload your application (zero downtime)
- **Delete**: Remove your application from PM2's process list

These commands give you full control over your application's state, making it easy to deploy updates, troubleshoot issues, and manage multiple applications.

#### 7. **Centralized Logging**

PM2 collects and manages logs from all your application instances in a centralized location. It separates standard output (stdout) and error output (stderr) into different log files, making it easier to debug issues and monitor application behavior.

**Features:**
- Automatic log file rotation
- Separate files for stdout and stderr
- Real-time log streaming
- Log file size management
- Easy log access and searching

#### 8. **Real-Time Monitoring**

PM2 provides real-time monitoring of your application's resource usage, including CPU and memory consumption. The built-in monitoring dashboard shows live metrics for all managed processes, helping you identify performance bottlenecks and resource issues.

**Features:**
- Real-time CPU and memory metrics
- Process status and uptime
- Restart count and error tracking
- Interactive monitoring dashboard

#### 9. **Environment Management via Ecosystem File**

PM2 supports ecosystem files (JavaScript/JSON configuration files) that allow you to define multiple application configurations for different environments (development, staging, production). This makes it easy to manage different deployment configurations and switch between environments.

**Benefits:**
- Centralized configuration management
- Environment-specific settings
- Easy deployment across different environments
- Version control for deployment configurations

---

## 2. Implementation Guide

### 2.1. Installation

Install PM2 globally using npm:

```bash
npm install -g pm2
```

Verify installation:

```bash
pm2 --version
```

### 2.2. Basic Usage

#### Starting an Application

Start a Node.js application with PM2:

```bash
pm2 start app.js
```

Or start with npm script:

```bash
pm2 start npm --name "my-app" -- start
```

#### Process Management Commands

**List all processes:**
```bash
pm2 list
```

**Stop a process:**
```bash
pm2 stop app.js
pm2 stop 0  # Stop by process ID
```

**Restart a process:**
```bash
pm2 restart app.js
pm2 restart 0
```

**Reload a process (zero downtime):**
```bash
pm2 reload app.js
pm2 reload 0
```

**Delete a process:**
```bash
pm2 delete app.js
pm2 delete 0
```

**Stop and delete all processes:**
```bash
pm2 delete all
```

### 2.3. Cluster Mode

Start your application in cluster mode to utilize all CPU cores:

```bash
pm2 start app.js -i max
```

The `-i max` option tells PM2 to start as many instances as there are CPU cores. You can also specify a specific number:

```bash
pm2 start app.js -i 4  # Start 4 instances
```

**Benefits of Cluster Mode:**
- Automatic load balancing
- Better CPU utilization
- Improved performance
- Zero-downtime reloads

### 2.4. Ecosystem File Configuration

Create an ecosystem file to manage multiple applications and environments. Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'my-app',
      script: './src/server.js',
      instances: 'max', // or number
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
```

Start applications using the ecosystem file:

```bash
pm2 start ecosystem.config.js
pm2 start ecosystem.config.js --env production
```

### 2.5. Monitoring

#### Real-Time Monitoring Dashboard

View real-time metrics for all processes:

```bash
pm2 monit
```

This opens an interactive dashboard showing:
- CPU and memory usage
- Process status
- Log output
- Restart counts

#### Process Information

Get detailed information about a process:

```bash
pm2 show 0
```

#### Process List

View all processes with detailed information:

```bash
pm2 list
pm2 ls
```

### 2.6. Logging

#### View Logs

View logs for all processes:

```bash
pm2 logs
```

View logs for a specific process:

```bash
pm2 logs 0
pm2 logs my-app
```

#### Log Management

**Clear all logs:**
```bash
pm2 flush
```

**Reload logs (useful after log rotation):**
```bash
pm2 reloadLogs
```

**Configure log rotation:**
PM2 can be configured to rotate logs automatically. Install pm2-logrotate:

```bash
pm2 install pm2-logrotate
```

### 2.7. Auto-Start on Reboot

Configure PM2 to start applications automatically on server reboot:

```bash
pm2 startup
```

This command generates and configures a startup script for your system's init system. Follow the instructions provided by the command.

Save the current PM2 process list:

```bash
pm2 save
```

This saves the current process list so PM2 can restore it on reboot.

### 2.8. Environment Variables

Set environment variables when starting an application:

```bash
pm2 start app.js --env production
```

Or define them in the ecosystem file:

```javascript
module.exports = {
  apps: [
    {
      name: 'my-app',
      script: './src/server.js',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        DATABASE_URL: 'mongodb://localhost:27017/myapp',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'mongodb://production-server:27017/myapp',
      },
    },
  ],
};
```

### 2.9. Advanced Features

#### Memory Limit Restart

Automatically restart the application if it exceeds a memory limit:

```bash
pm2 start app.js --max-memory-restart 500M
```

Or in ecosystem file:

```javascript
{
  max_memory_restart: '500M',
}
```

#### Watch Mode

Automatically restart the application when files change (useful for development):

```bash
pm2 start app.js --watch
```

Or in ecosystem file:

```javascript
{
  watch: true,
  ignore_watch: ['node_modules', 'logs'],
}
```

#### Graceful Shutdown

PM2 supports graceful shutdown with custom timeout:

```bash
pm2 start app.js --kill-timeout 5000
```

Or in ecosystem file:

```javascript
{
  kill_timeout: 5000,
}
```

---

## 3. Best Practices

### Process Management

- **Use ecosystem files**: Define all your applications and configurations in ecosystem files for better management and version control.

- **Use cluster mode in production**: Enable cluster mode to utilize all CPU cores and improve performance.

- **Set memory limits**: Configure memory limits to prevent applications from consuming excessive resources.

- **Monitor regularly**: Use `pm2 monit` to monitor your applications and identify performance issues.

### Logging

- **Separate log files**: Use separate log files for stdout and stderr to make debugging easier.

- **Enable log rotation**: Configure log rotation to prevent log files from growing too large.

- **Review logs regularly**: Regularly review logs to identify issues and monitor application behavior.

### Deployment

- **Use environment-specific configurations**: Define different configurations for development, staging, and production environments.

- **Test reloads**: Test zero-downtime reloads in staging before deploying to production.

- **Monitor after deployment**: Monitor your applications closely after deployment to ensure everything is working correctly.

### Security

- **Limit process access**: Run PM2 processes with appropriate user permissions.

- **Secure ecosystem files**: Don't commit sensitive information (API keys, passwords) in ecosystem files. Use environment variables instead.

- **Regular updates**: Keep PM2 updated to the latest version for security patches and bug fixes.

---

## 4. Summary of Implementation Steps

1. **[Installation](#21-installation)**: Install PM2 globally using npm.

2. **[Basic Usage](#22-basic-usage)**: Learn basic commands to start, stop, restart, and manage processes.

3. **[Cluster Mode](#23-cluster-mode)**: Configure cluster mode to utilize all CPU cores and enable load balancing.

4. **[Ecosystem File Configuration](#24-ecosystem-file-configuration)**: Create ecosystem files to manage multiple applications and environments.

5. **[Monitoring](#25-monitoring)**: Use PM2's monitoring features to track application performance and resource usage.

6. **[Logging](#26-logging)**: Configure and manage application logs with PM2's logging features.

7. **[Auto-Start on Reboot](#27-auto-start-on-reboot)**: Configure PM2 to automatically start applications on server reboot.

8. **[Environment Variables](#28-environment-variables)**: Manage environment variables for different deployment environments.

9. **[Advanced Features](#29-advanced-features)**: Configure advanced features like memory limits, watch mode, and graceful shutdown.

---

## 5. Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/) - Official PM2 documentation and quick start guide
- [PM2 GitHub Repository](https://github.com/Unitech/pm2) - PM2 source code and issue tracking
- [PM2 Ecosystem File](https://pm2.keymetrics.io/docs/usage/application-declaration/) - Ecosystem file configuration reference
- [Node.js Cluster Module](https://nodejs.org/api/cluster.html) - Node.js built-in cluster module documentation