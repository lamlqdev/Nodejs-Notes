# Section 8: Creating Databases and Tables

### Data Types

Data types define what kind of data can be stored in a column. Choosing the right data type is crucial for data integrity, storage efficiency, and query performance.

### Common Data Type Categories

**Boolean:**
- `BOOLEAN` or `BOOL` - Stores True, False, or NULL

**Character Types:**
- `CHAR(n)` - Fixed-length string (padded with spaces)
- `VARCHAR(n)` - Variable-length string with maximum length
- `TEXT` - Variable-length string with no limit (PostgreSQL)

**Numeric Types:**
- `INTEGER` or `INT` - Whole numbers
- `SMALLINT` - Smaller range integers
- `BIGINT` - Larger range integers
- `SERIAL` - Auto-incrementing integer (PostgreSQL)
- `DECIMAL(p,s)` or `NUMERIC(p,s)` - Exact numeric with precision
- `REAL` - Single precision floating-point
- `DOUBLE PRECISION` - Double precision floating-point

**Temporal Types:**
- `DATE` - Date only (YYYY-MM-DD)
- `TIME` - Time only (HH:MM:SS)
- `TIMESTAMP` - Date and time
- `TIMESTAMPTZ` - Timestamp with timezone
- `INTERVAL` - Time interval

```sql
-- Example table with various data types
CREATE TABLE example (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    age INTEGER,
    salary DECIMAL(10, 2),
    is_active BOOLEAN,
    created_at TIMESTAMP
);
```

> **Tip:** Use `VARCHAR(n)` when you know the maximum length, and `TEXT` when length is unpredictable. `CHAR` is rarely used in modern databases.

> **Best Practice:** Use `DECIMAL` or `NUMERIC` for monetary values instead of `FLOAT` or `REAL` to avoid rounding errors.

### Primary Keys and Foreign Keys

### Primary Key

A **Primary Key** uniquely identifies each row in a table.

**Characteristics:**
- Must be unique across all rows
- Cannot be NULL
- A table can have only one primary key
- Can consist of a single column or multiple columns (composite key)
- Automatically creates an index

```sql
-- Single column primary key
CREATE TABLE customer (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50)
);

-- Composite primary key
CREATE TABLE order_items (
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    PRIMARY KEY (order_id, product_id)
);
```

### Foreign Key

A **Foreign Key** is a column or group of columns that references the primary key of another table, establishing a relationship between tables.

**Characteristics:**
- References a primary key or unique column in another table
- Ensures referential integrity
- Can be NULL (unless constrained)
- Prevents orphaned records

```sql
-- Foreign key example
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    order_date DATE,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

-- Foreign key with ON DELETE CASCADE
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);
```

**Foreign Key Actions:**
- `ON DELETE CASCADE` - Delete related rows when parent is deleted
- `ON DELETE SET NULL` - Set foreign key to NULL when parent is deleted
- `ON DELETE RESTRICT` - Prevent deletion if related rows exist (default)
- `ON UPDATE CASCADE` - Update foreign key when parent key is updated

> **Warning:** `ON DELETE CASCADE` can delete large amounts of data unintentionally. Use with caution and always test thoroughly.

> **Tip:** Foreign keys improve data integrity but can impact INSERT/UPDATE performance. Consider your application's needs when deciding whether to use them.

### Constraints

Constraints are rules enforced on data columns to ensure data integrity and prevent invalid data entry.

### Column Constraints

Applied to individual columns:

- **NOT NULL** - Column cannot contain NULL values
- **UNIQUE** - All values in the column must be unique
- **PRIMARY KEY** - Combination of NOT NULL and UNIQUE
- **FOREIGN KEY** - References a column in another table
- **CHECK** - Ensures values satisfy a condition
- **DEFAULT** - Provides a default value if none is specified

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INTEGER CHECK (age >= 18),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Table Constraints

Applied to the entire table:

- **CHECK** - Validates data across multiple columns
- **UNIQUE** - Ensures unique combination of columns
- **PRIMARY KEY** - Composite primary key
- **FOREIGN KEY** - Composite foreign key

```sql
CREATE TABLE reservations (
    reservation_id SERIAL,
    room_id INTEGER,
    start_date DATE,
    end_date DATE,
    PRIMARY KEY (reservation_id),
    CHECK (end_date > start_date),  -- Table-level CHECK
    UNIQUE (room_id, start_date)     -- Composite UNIQUE
);
```

> **Tip:** Use table-level constraints when the constraint involves multiple columns or when you want to name the constraint explicitly.

> **Best Practice:** Always define constraints at the table level for better error messages and easier constraint management.

### CREATE Table

The `CREATE TABLE` statement creates a new table in the database.

**Basic Syntax:**
```sql
CREATE TABLE table_name (
    column1 datatype constraints,
    column2 datatype constraints,
    ...
);
```

```sql
CREATE TABLE account(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

> **Tip:** Use meaningful table and column names. Follow a consistent naming convention (e.g., snake_case or camelCase).

> **Warning:** Be careful when creating tables in production. Always test schema changes in a development environment first.

### INSERT

The `INSERT` statement adds new rows to a table.

**Basic Syntax:**
```sql
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);
```

```sql
-- Insert single row
INSERT INTO account(username, password, email, created_on)
VALUES
('Jose', 'password', 'jose@mail.com', CURRENT_TIMESTAMP);

-- Insert multiple rows
INSERT INTO account(username, password, email)
VALUES
('Alice', 'pass123', 'alice@mail.com'),
('Bob', 'pass456', 'bob@mail.com');

-- Insert with default values (omit columns)
INSERT INTO account(username, password)
VALUES ('Charlie', 'pass789');
```

> **Tip:** Always specify column names explicitly rather than relying on column order. This makes your code more maintainable.

> **Best Practice:** Use parameterized queries or prepared statements in application code to prevent SQL injection attacks.

### UPDATE

The `UPDATE` statement modifies existing data in a table.

**Basic Syntax:**
```sql
UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;
```

```sql
-- Update all rows (be careful!)
UPDATE account
SET last_login = CURRENT_TIMESTAMP;

-- Update specific rows
UPDATE account
SET last_login = CURRENT_TIMESTAMP
WHERE username = 'Jose';

-- Update multiple columns
UPDATE account
SET password = 'newpassword', email = 'newemail@mail.com'
WHERE user_id = 1;
```

> **Warning:** Always use a WHERE clause with UPDATE unless you intentionally want to update all rows. Forgetting WHERE is a common mistake that can cause data loss.

> **Best Practice:** Test UPDATE statements with a SELECT first to ensure you're updating the correct rows:
```sql
-- First, check what will be updated
SELECT * FROM account WHERE username = 'Jose';
-- Then update
UPDATE account SET last_login = CURRENT_TIMESTAMP WHERE username = 'Jose';
```

### DELETE

The `DELETE` statement removes rows from a table.

**Basic Syntax:**
```sql
DELETE FROM table_name
WHERE condition;
```

```sql
-- Delete specific rows
DELETE FROM account
WHERE username = 'Jose';

-- Delete all rows (be very careful!)
DELETE FROM account;
-- Equivalent to: TRUNCATE TABLE account; (faster, but cannot be rolled back)
```

> **Warning:** `DELETE` without a WHERE clause will delete ALL rows in the table. Always double-check your WHERE clause before executing DELETE statements.

> **Tip:** For deleting all rows, `TRUNCATE TABLE` is faster than `DELETE`, but it cannot be rolled back and doesn't fire triggers.

### ALTER Table

The `ALTER TABLE` statement modifies an existing table structure.

**Common Operations:**
- Add, drop, or rename columns
- Change column data types
- Add or drop constraints
- Rename table

```sql
-- Rename column
ALTER TABLE account
RENAME COLUMN username TO uname;

-- Add column
ALTER TABLE account
ADD COLUMN phone VARCHAR(20);

-- Drop column
ALTER TABLE account
DROP COLUMN last_login;

-- Change column data type
ALTER TABLE account
ALTER COLUMN phone TYPE VARCHAR(50);

-- Add constraint
ALTER TABLE account
ADD CONSTRAINT check_email CHECK (email LIKE '%@%');
```

> **Warning:** Changing column data types can fail if existing data is incompatible. Always backup data before major schema changes.

> **Tip:** Some ALTER operations (like changing data types) can lock the table. Consider the impact on production systems.

### DROP Table

The `DROP TABLE` statement removes a table and all its data permanently.

**Basic Syntax:**
```sql
DROP TABLE table_name;
-- or
DROP TABLE IF EXISTS table_name;  -- Safe version
```

```sql
-- Drop table (will error if table doesn't exist)
DROP TABLE account;

-- Safe drop (no error if table doesn't exist)
DROP TABLE IF EXISTS account;

-- Drop with CASCADE (drops dependent objects)
DROP TABLE account CASCADE;
```

> **Warning:** `DROP TABLE` permanently deletes the table and all its data. This operation cannot be undone. Always backup important data before dropping tables.

> **Best Practice:** Use `DROP TABLE IF EXISTS` to avoid errors in scripts that might run multiple times.

### CHECK Constraints

CHECK constraints allow you to create custom validation rules for data.

**Key Points:**
- Can be defined at column level or table level
- Can reference multiple columns (table-level)
- Can use various operators and functions
- Evaluated on INSERT and UPDATE

```sql
-- Column-level CHECK
CREATE TABLE employees(
    emp_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birthdate DATE CHECK (birthdate > '1900-01-01'),
    salary DECIMAL(10,2) CHECK (salary > 0)
);

-- Table-level CHECK (can reference multiple columns)
CREATE TABLE reservations(
    reservation_id SERIAL PRIMARY KEY,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    CHECK (check_out > check_in)  -- Validates relationship between columns
);
```

> **Tip:** Use CHECK constraints to enforce business rules at the database level, ensuring data integrity even if application code has bugs.

> **Note:** CHECK constraints cannot reference other tables or use subqueries. Use triggers or application logic for complex cross-table validations.
