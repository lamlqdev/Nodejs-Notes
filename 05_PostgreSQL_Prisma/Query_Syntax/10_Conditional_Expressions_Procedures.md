# Section 10: Conditional Expressions and Procedures

### CASE

The `CASE` expression provides if-then-else logic in SQL, allowing conditional execution of SQL code.

**Two Forms of CASE:**

1. **Simple CASE** - Compares a value to a list of values
2. **Searched CASE** - Evaluates boolean conditions

**Key Points:**
- Returns a single value based on conditions
- Can be used in SELECT, WHERE, ORDER BY, and other clauses
- Must have an ELSE clause or return NULL if no condition matches
- Stops at the first matching condition

### Simple CASE Syntax

```sql
CASE expression
    WHEN value1 THEN result1
    WHEN value2 THEN result2
    ...
    ELSE default_result
END
```

### Searched CASE Syntax

```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ...
    ELSE default_result
END
```

```sql
-- Simple CASE example
SELECT 
    SUM(CASE rental_rate
        WHEN 0.99 THEN 1
        WHEN 2.99 THEN 1
        ELSE 0
    END) AS standard_rate,
    SUM(CASE rental_rate
        WHEN 4.99 THEN 1
        ELSE 0
    END) AS premium_rate
FROM film;

-- Searched CASE example
SELECT 
    title,
    CASE
        WHEN rental_rate < 1 THEN 'Budget'
        WHEN rental_rate < 3 THEN 'Standard'
        WHEN rental_rate < 5 THEN 'Premium'
        ELSE 'Ultra Premium'
    END AS price_category
FROM film;

-- CASE in ORDER BY
SELECT * FROM film
ORDER BY 
    CASE rating
        WHEN 'G' THEN 1
        WHEN 'PG' THEN 2
        WHEN 'PG-13' THEN 3
        WHEN 'R' THEN 4
        ELSE 5
    END;
```

> **Tip:** CASE expressions are evaluated in order. Once a condition matches, subsequent conditions are not evaluated. Place more specific conditions first.

> **Performance Note:** CASE expressions can impact query performance, especially in WHERE clauses. Consider if the logic can be moved to the application layer for better performance.

### COALESCE

The `COALESCE` function returns the first non-NULL argument from a list of arguments. It's useful for handling NULL values and providing defaults.

**Key Points:**
- Accepts unlimited number of arguments
- Returns NULL only if ALL arguments are NULL
- Evaluates arguments from left to right
- Stops at the first non-NULL value

**Common Use Cases:**
- Providing default values for NULL columns
- Handling NULLs in calculations
- Combining multiple columns (first non-NULL)

```sql
-- Provide default value for NULL
SELECT item, COALESCE(price, 0) AS price FROM products;

-- Handle NULLs in calculations
SELECT item, (price - COALESCE(discount, 0)) AS final_price 
FROM products;

-- Use first non-NULL value from multiple columns
SELECT 
    COALESCE(middle_name, first_name, 'Unknown') AS display_name
FROM customer;

-- Combine with CASE for complex logic
SELECT 
    COALESCE(
        CASE WHEN status = 'active' THEN name END,
        'Inactive Item'
    ) AS item_name
FROM items;
```

> **Tip:** `COALESCE` is more readable than nested `CASE` statements when you just need to handle NULLs. Use `COALESCE` for simple NULL handling, `CASE` for complex conditional logic.

> **Note:** `COALESCE` is ANSI SQL standard and works across most databases. Some databases have similar functions like `ISNULL()` (SQL Server) or `IFNULL()` (MySQL).

### CAST

The `CAST` operator converts a value from one data type to another.

**Two Syntax Forms:**
```sql
CAST(expression AS data_type)
-- or
expression::data_type  -- PostgreSQL shorthand
```

**Common Conversions:**
- String to Number: `CAST('123' AS INTEGER)`
- Number to String: `CAST(123 AS VARCHAR)`
- Date to String: `CAST(date_column AS VARCHAR)`
- String to Date: `CAST('2020-01-01' AS DATE)`

```sql
-- Convert integer to string
SELECT CAST(inventory_id AS VARCHAR) FROM rental;

-- PostgreSQL shorthand
SELECT inventory_id::VARCHAR FROM rental;

-- Convert string to number
SELECT CAST('123' AS INTEGER);

-- Convert to date
SELECT CAST('2020-01-01' AS DATE);

-- In calculations
SELECT 
    amount,
    CAST(amount AS INTEGER) AS whole_dollars
FROM payment;
```

> **Warning:** Invalid conversions will cause errors. For example, `CAST('abc' AS INTEGER)` will fail. Use `TRY_CAST()` (SQL Server) or handle errors appropriately.

> **Tip:** The `::` shorthand is PostgreSQL-specific. Use `CAST()` for better cross-database compatibility.

### NULLIF

The `NULLIF` function takes two arguments and returns NULL if they are equal, otherwise returns the first argument.

**Syntax:**
```sql
NULLIF(value1, value2)
```

**Key Points:**
- Returns NULL if `value1 = value2`
- Returns `value1` if `value1 ≠ value2`
- Useful for preventing division by zero
- Commonly used with `COALESCE` or `CASE`

**Common Use Case:** Preventing division by zero errors.

```sql
-- Prevent division by zero
SELECT (
    SUM(CASE WHEN department = 'A' THEN 1 ELSE 0 END) /
    NULLIF(SUM(CASE WHEN department = 'B' THEN 1 ELSE 0 END), 0)
) AS department_ratio
FROM depts;

-- If department B count is 0, NULLIF returns NULL
-- Division by NULL returns NULL (not an error)

-- Another example: Handle empty strings as NULL
SELECT NULLIF(column_name, '') FROM table_name;
-- Returns NULL if column_name is empty string, otherwise returns column_name
```

> **Tip:** `NULLIF` is particularly useful in mathematical operations to avoid division by zero errors. Combine with `COALESCE` to provide a default value.

> **Note:** `NULLIF(a, b)` is equivalent to `CASE WHEN a = b THEN NULL ELSE a END`, but `NULLIF` is more concise and readable.

### Views

A **View** is a virtual table based on the result of a SQL query. It doesn't store data physically; it stores the query definition.

**Key Characteristics:**
- Doesn't store data (stores the query)
- Always shows up-to-date data from underlying tables
- Can be queried like a regular table
- Can simplify complex queries
- Can provide security by hiding sensitive columns

**Benefits:**
- **Simplification:** Hide complex joins and calculations
- **Security:** Restrict access to specific columns/rows
- **Consistency:** Standardize how data is accessed
- **Performance:** Can be materialized (stored) for better performance

### Create View

```sql
CREATE VIEW customer_info AS
SELECT first_name, last_name, address 
FROM customer
INNER JOIN address
ON customer.address_id = address.address_id;
```

### Query View

Views are queried exactly like tables:

```sql
-- Query the view
SELECT * FROM customer_info;

-- Use in WHERE clause
SELECT * FROM customer_info
WHERE last_name LIKE 'S%';

-- Join views with tables
SELECT ci.*, p.amount
FROM customer_info ci
INNER JOIN payment p ON ci.customer_id = p.customer_id;
```

### Modify and Drop Views

```sql
-- Modify view (replace existing)
CREATE OR REPLACE VIEW customer_info AS
SELECT first_name, last_name, address, email
FROM customer
INNER JOIN address ON customer.address_id = address.address_id;

-- Drop view
DROP VIEW customer_info;

-- Drop if exists (safe)
DROP VIEW IF EXISTS customer_info;
```

**Materialized Views:** Some databases support materialized views that store the actual data and can be refreshed periodically for better performance.

```sql
-- PostgreSQL materialized view example
CREATE MATERIALIZED VIEW customer_summary AS
SELECT customer_id, COUNT(*) AS order_count, SUM(amount) AS total_spent
FROM payment
GROUP BY customer_id;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW customer_summary;
```

> **Tip:** Use views to simplify frequently used complex queries. They make your code more maintainable - if the logic changes, you only update the view definition.

> **Performance Warning:** Views don't improve performance by themselves - they're just saved queries. However, materialized views can improve performance by storing pre-computed results.

> **Best Practice:** Use views to create an abstraction layer between your application and the database schema. This makes schema changes easier to manage.

---

### Challenges

### Challenge

We want to know and compare the various amounts of films we have per movie rating. Use CASE and the dvdrental database to re-create this table.

```sql
SELECT
    SUM(CASE rating 
        WHEN 'R' THEN 1
        ELSE 0
    END) AS r,
    SUM(CASE rating 
        WHEN 'PG' THEN 1
        ELSE 0
    END) AS pg,
    SUM(CASE rating 
        WHEN 'PG-13' THEN 1
        ELSE 0
    END) AS pg13
FROM film;
```
