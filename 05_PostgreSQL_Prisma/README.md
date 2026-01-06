# SQL Fundamentals

## Table, columns and constraints

A table is a named structure with columns (name, type, constraints) and rows (data). Each column has a data type that controls what values are valid and how they are stored. There are common data types:

- **Integer-like**: INT, BIGINT, SERIAL/BIGSERIAL for ids, counts.
- **Text**: VARCHAR(n) for bounded strings, TEXT for long free text.
- **Date/time**: DATE, TIMESTAMP for created_at, updated_at.
- **Boolean**: BOOLEAN / BOOL for true/false flags.

Contraints are rules attached to columns or tables that enforce data integrity. They can be column-level (written directly after the column) or table-level (written after the table definition and can involve multiple columns).

- **NOT NULL**: Value must exist, cannot be `NULL`.
- **UNIQUE**: Values in that column (or combination) must be unique.
- **CHECK**: Custom condition, e.g. `CHECK (age >= 0 AND age <= 120)`.
- **DEFAULT**: Auto-fill a value if none is provided, e.g. `created_at TIMESTAMP DEFAULT NOW()`.

```sql
CREATE TABLE users (
  id          SERIAL       PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(255) NOT NULL UNIQUE,
  age         INT          CHECK (age >= 13),
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

This design ensures every user has an id, a unique username/email, a reasonable age, and an automatic create time.

## Primary Key, Foreign Key and Relationships

**A primary key** is a column (or set of columns) that uniquely identifies each row. Most tables use a single auto-increment integer or UUID primary key, and SQL engines automatically index primary keys. Primary key properties:

- **Unique**: No two rows have the same primary key value.
- **Non-NULL**: Every row must have a primary key value.
- **Stable**: Should not change frequently (or at all).

**A foreign key** is a column that references the primary key (or unique key) of another table. It enforces that the referenced row actually exists, preventing "orphan" records.

```sql
CREATE TABLE matches (
  id         SERIAL PRIMARY KEY,
  user_id    INT    NOT NULL REFERENCES users(id),
  hero_name  VARCHAR(50) NOT NULL,
  result     VARCHAR(10) NOT NULL CHECK (result IN ('win', 'loss')),
  played_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);
```

Here `matches.user_id` is a foreign key pointing to `users.id`, creating a one-to-many relationship: **one user → many matches**.

![SQL Table](../public/what-is-sql.png)

Main relationship types:

- **One-to-one**: Rare; one row in A corresponds to at most one row in B, often via a unique foreign key or shared primary key.
- **One-to-many**: The most common; parent table (users) has many child rows (matches, orders, comments), implemented via foreign key in the **many** table.
- **Many-to-many**: Implemented with a join table that holds two foreign keys and often a composite primary key, e.g. users ↔ tournaments.

Example of a many-to-many relationship:

```sql
CREATE TABLE tournaments (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE user_tournaments (
  user_id       INT NOT NULL REFERENCES users(id),
  tournament_id INT NOT NULL REFERENCES tournaments(id),
  PRIMARY KEY (user_id, tournament_id)
);
```

The `user_tournaments` table connects users and tournaments and the composite primary key prevents duplicate pairs.

## Core querying

- [Basic SQL SELECT](./Query_Syntax/02_Basic_SQL_Statements.md)
- [Aggregation and grouping](./Query_Syntax/03_GROUP_BY_Aggregations.md)
- [Joins and subqueries](./Query_Syntax/05_SQL_Joins.md)
- [Advanced SQL commands](./Query_Syntax/06_Advanced_SQL_Commands.md)
- [Modifying and designing data](./Query_Syntax/08_Creating_Databases_Tables.md)
- [Conditional expressions and procedures](./Query_Syntax/10_Conditional_Expressions_Procedures.md)

## Indexes and performance

An index is a separate data structure stored by the database that lets it find rows much faster without scanning the entire table. You can think of it like a book index: instead of reading every page to find a topic, you jump directly to pages listed in the index.

- **Speed up reads**: Especially for queries using WHERE, JOIN, ORDER BY, GROUP BY on large tables.
- **Cost writes**: Every INSERT/UPDATE/DELETE must also update indexes, so too many indexes slow down write-heavy workloads.
- **Use space**: Indexes consume additional disk and memory.

There are some types of indexes:

- **Single-column index**: Index on one column, e.g. `CREATE INDEX idx_users_username ON users(username);`.
- **Composite index**: Index on multiple columns (order matters), e.g. `CREATE INDEX idx_matches_user_hero ON matches(user_id, hero_name);`.
- **Unique index**: Enforces uniqueness and also accelerates lookups, usually created via `UNIQUE` constraint or `PRIMARY KEY`.

| When to Create Indexes                                                                        | When to Avoid or Be Careful with Indexes                                       |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Columns frequently used in WHERE or JOIN conditions (e.g. user_id on matches, email on users) | Very small tables (full scan is already cheap)                                 |
| Columns often used in ORDER BY or GROUP BY on large tables                                    | Columns that change constantly (lots of updates will be expensive)             |
| Foreign key columns (for fast joins from child to parent)                                     | Low-selectivity columns like boolean flags where most rows have the same value |

## Prisma ORM

### Setup Project

**[Quickstart with Prisma ORM and Prisma Postgres](https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/postgresql)**

**[Add Prisma ORM to an existing PostgreSQL project](https://www.prisma.io/docs/getting-started/prisma-orm/add-to-existing-project/postgresql)**
