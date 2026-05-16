# Caching in Node.js

A practical guide to caching strategies in Node.js applications — covering
in-memory caching, Redis caching, cache invalidation, and when to use each approach.

---

## 1. Core Concepts

### What is Caching?

Caching is the practice of storing the result of an expensive operation so that
future requests for the same data can be served faster, without repeating the
expensive work.

```
Without cache:
Request → Server → Database → Response   (100ms)
Request → Server → Database → Response   (100ms)
Request → Server → Database → Response   (100ms)

With cache:
Request → Server → Database → Cache → Response   (100ms)  ← cache miss
Request → Server → Cache → Response              (1ms)    ← cache hit
Request → Server → Cache → Response              (1ms)    ← cache hit
```

### Cache Hit vs Cache Miss

| Term | Meaning |
|---|---|
| **Cache Hit** | Data found in cache → serve immediately |
| **Cache Miss** | Data not in cache → fetch from source, store in cache |
| **Hit Rate** | % of requests served from cache (higher = better) |
| **TTL** | Time-To-Live — how long cached data stays valid |
| **Eviction** | Removing old/unused entries when cache is full |

### Why Cache?

- **Performance** — reduce latency from 100ms → 1ms for repeated data
- **Reduce DB load** — fewer queries to database under heavy traffic
- **Cost** — fewer DB operations = lower infrastructure cost
- **Availability** — serve data even if DB is temporarily slow

---

## 2. Types of Caching

### 2.1. In-Memory Caching

Data stored directly in the Node.js process memory (RAM). Fastest possible
access, but lost on process restart and not shared between multiple instances.

**Use when:** Single server, small dataset, data that can be recomputed easily.

```typescript
// Simple in-memory cache using a Map
const cache = new Map<string, { value: unknown; expiresAt: number }>();

function setCache(key: string, value: unknown, ttlSeconds: number): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key); // expired
    return null;
  }
  return entry.value as T;
}

// Usage
const cached = getCache<User[]>('users:all');
if (cached) return cached;

const users = await db.user.findMany();
setCache('users:all', users, 60); // cache for 60s
return users;
```

**Popular libraries:**
- `node-cache` — simple TTL-based in-memory cache
- `lru-cache` — LRU eviction, memory-bounded, widely used

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

cache.set('key', { data: 'value' });
const value = cache.get('key');
cache.del('key');
```

### 2.2. Redis Caching

Data stored in Redis — an external in-memory data store. Survives process
restarts, shared across multiple server instances, supports rich data types.

**Use when:** Multiple server instances, large datasets, cache needs to persist
across restarts, need pub/sub or advanced features.

```typescript
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

// Store with TTL
await redis.setEx('users:all', 60, JSON.stringify(users));

// Retrieve
const cached = await redis.get('users:all');
if (cached) return JSON.parse(cached);

// Delete
await redis.del('users:all');

// Delete by pattern (cache invalidation)
const keys = await redis.keys('users:*');
if (keys.length) await redis.del(keys);
```

### 2.3. Comparison

| | In-Memory | Redis |
|---|---|---|
| Speed | Fastest (same process) | Very fast (network hop) |
| Persistence | Lost on restart | Survives restarts |
| Shared across instances | ❌ No | ✅ Yes |
| Max size | Limited by process RAM | Configurable, large |
| Data types | Any JS value | String, Hash, List, Set, ZSet |
| Setup | Zero — just a Map/lib | Requires Redis server |
| Best for | Single server, small data | Production, multi-instance |

---

## 3. Cache Strategies

### 3.1. Cache-Aside (Lazy Loading)

The most common pattern. Application checks cache first; on miss, loads from DB
and populates cache. Cache is only populated when data is actually needed.

```
Read flow:
App → Cache → Hit? → Return data
               Miss? → DB → Store in Cache → Return data

Write flow:
App → DB (update) → Invalidate/Delete cache key
```

```typescript
async function getUser(id: string): Promise<User> {
  const cacheKey = `user:${id}`;

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Cache miss — fetch from DB
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');

  // 3. Store in cache
  await redis.setEx(cacheKey, 300, JSON.stringify(user)); // 5 min TTL

  return user;
}

async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const user = await db.user.update({ where: { id }, data });

  // Invalidate cache so next read gets fresh data
  await redis.del(`user:${id}`);

  return user;
}
```

**Pros:** Only caches what is actually needed, resilient to cache failures.
**Cons:** First request always hits DB (cold start), potential for stale data.

### 3.2. Write-Through

Every write goes to cache AND DB simultaneously. Cache is always up-to-date.

```
Write flow:
App → Cache (write) + DB (write) → Done

Read flow:
App → Cache → Always hit (if data exists)
```

```typescript
async function updateUser(id: string, data: Partial<User>): Promise<User> {
  // Write to DB
  const user = await db.user.update({ where: { id }, data });

  // Immediately update cache (write-through)
  await redis.setEx(`user:${id}`, 300, JSON.stringify(user));

  return user;
}
```

**Pros:** Cache always consistent with DB, no stale reads.
**Cons:** Every write pays the cost of updating cache, cache may hold data
never read again (wasted memory).

### 3.3. Write-Behind (Write-Back)

App writes to cache first, DB is updated asynchronously later. Fastest writes,
but risk of data loss if cache crashes before DB is updated.

**Rarely used in web apps** — mostly in high-throughput systems where write
speed is critical and some data loss is acceptable.

### 3.4. Strategy Comparison

| Strategy | Read | Write | Consistency | Complexity |
|---|---|---|---|---|
| Cache-Aside | Cache then DB | DB then invalidate | Eventually consistent | Low |
| Write-Through | Cache (always hit) | Cache + DB together | Strong | Medium |
| Write-Behind | Cache (always hit) | Cache only (async DB) | Weak | High |

**Rule of thumb:** Start with **Cache-Aside** — it handles most use cases well
and is the simplest to reason about.

---

## 4. Cache Invalidation

Cache invalidation is one of the hardest problems in software engineering.
Stale cache = users see outdated data.

### 4.1. TTL-Based Expiry

Let cache entries expire automatically after a set time. Simplest approach.

```typescript
// Data is "stale" for at most 60 seconds
await redis.setEx('products:featured', 60, JSON.stringify(products));
```

**Choose TTL based on how often data changes:**

| Data type | Suggested TTL |
|---|---|
| User profile | 5–15 minutes |
| Product list | 1–5 minutes |
| Stock price | 5–30 seconds |
| Static config | 1 hour+ |
| Session data | Match session lifetime |

### 4.2. Event-Based Invalidation

Explicitly delete cache when underlying data changes.

```typescript
// After updating a product
await db.product.update({ where: { id }, data });
await redis.del(`product:${id}`);        // invalidate single item
await redis.del('products:all');          // invalidate list cache
```

### 4.3. Cache Key Naming Convention

Use consistent, hierarchical key names to make invalidation predictable:

```
entity:id               → user:123
entity:id:relation      → user:123:orders
entity:filter           → products:featured
entity:page:N           → products:page:1
```

Avoid generic keys like `data` or `cache` — impossible to selectively invalidate.

---

## 5. Cache Eviction Policies

When Redis runs out of memory, it needs to decide which keys to remove.
Configure via `maxmemory-policy` in Redis config:

| Policy | Behavior | Use when |
|---|---|---|
| `noeviction` | Return error when full | You handle memory yourself |
| `allkeys-lru` | Remove least recently used | General purpose cache |
| `volatile-lru` | LRU among keys with TTL | Mix of persistent + cached data |
| `allkeys-lfu` | Remove least frequently used | Frequently accessed data matters |
| `volatile-ttl` | Remove keys closest to expiry | TTL-based eviction preferred |

**Most common for caching:** `allkeys-lru` — automatically removes least
recently used data when memory is full, which is usually what you want.

---

## 6. Practical Patterns

### 6.1. Cache Wrapper / Helper

Avoid repeating cache-aside logic everywhere:

```typescript
async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached) as T;

  const data = await fetcher();
  await redis.setEx(key, ttl, JSON.stringify(data));
  return data;
}

// Usage — clean and consistent
const user = await withCache(
  `user:${id}`,
  300,
  () => db.user.findUnique({ where: { id } })
);

const products = await withCache(
  'products:featured',
  60,
  () => db.product.findMany({ where: { featured: true } })
);
```

### 6.2. Cache Stampede Prevention

When a popular cache key expires, many requests simultaneously hit the DB
(thundering herd). Use a lock to prevent this:

```typescript
async function getWithLock<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const lockKey = `lock:${key}`;
  const acquired = await redis.set(lockKey, '1', { NX: true, EX: 5 });

  if (!acquired) {
    // Another process is fetching — wait and retry
    await new Promise((r) => setTimeout(r, 100));
    return getWithLock(key, ttl, fetcher);
  }

  try {
    const data = await fetcher();
    await redis.setEx(key, ttl, JSON.stringify(data));
    return data;
  } finally {
    await redis.del(lockKey);
  }
}
```

### 6.3. What NOT to Cache

- **User-specific sensitive data** — risk of serving one user's data to another
- **Highly volatile data** — cache invalidation overhead exceeds benefit
- **Large binary blobs** — use a CDN instead
- **Data that must always be real-time** — financial transactions, inventory counts

---

## 7. Summary

| Concept | Key Takeaway |
|---|---|
| In-memory cache | Fastest, single-instance only, lost on restart |
| Redis cache | Shared, persistent, production-ready |
| Cache-Aside | Default strategy — lazy, simple, resilient |
| Write-Through | Use when consistency matters more than write speed |
| TTL | Always set a TTL — never cache forever |
| Key naming | Use `entity:id:relation` convention |
| Eviction | Use `allkeys-lru` for general caching |
| Cache stampede | Use locks for high-traffic keys |

---

## 8. Resources

- [Redis Documentation](https://redis.io/docs) — official Redis docs
- [node-redis](https://github.com/redis/node-redis) — official Node.js Redis client
- [node-cache](https://github.com/node-cache/node-cache) — simple in-memory cache
- [lru-cache](https://github.com/isaacs/node-lru-cache) — LRU in-memory cache
