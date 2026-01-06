# Section 6: Advanced SQL Commands

### Timestamp and Extract

Working with dates and times is a common requirement in SQL. PostgreSQL provides several functions for extracting and manipulating temporal data.

### EXTRACT()

Extracts a specific component (year, month, day, hour, etc.) from a date or timestamp value.

**Common Date Parts:**

- `YEAR`, `MONTH`, `DAY`
- `HOUR`, `MINUTE`, `SECOND`
- `DOW` (Day of Week: 0=Sunday, 6=Saturday)
- `DOY` (Day of Year: 1-366)
- `WEEK`, `QUARTER`

```sql
-- Extract year from payment date
SELECT EXTRACT(YEAR FROM payment_date) FROM payment;

-- Extract month
SELECT EXTRACT(MONTH FROM payment_date) FROM payment;

-- Extract day of week (0=Sunday, 6=Saturday)
SELECT EXTRACT(DOW FROM payment_date) FROM payment;

-- Use in WHERE clause
SELECT * FROM payment
WHERE EXTRACT(YEAR FROM payment_date) = 2007;
```

> **Tip:** `EXTRACT()` returns a numeric value, making it easy to use in calculations and comparisons.

### AGE()

Calculates the age (interval) between a timestamp and the current date/time, or between two timestamps.

**Key Points:**

- Returns an INTERVAL type
- Without arguments, calculates from current timestamp
- With one argument, calculates age from that date to now
- With two arguments, calculates age between two dates

```sql
-- Age from payment date to now
SELECT AGE(payment_date) FROM payment;

-- Age between two specific dates
SELECT AGE('2020-01-01', '1990-01-01'); -- Returns: 30 years

-- Age of customers (if you had birthdate)
-- SELECT AGE(birthdate) FROM customer;
```

> **Note:** `AGE()` is PostgreSQL-specific. Other databases use different functions like `DATEDIFF()` or date arithmetic.

### TO_CHAR()

Converts various data types (especially dates and numbers) to text with custom formatting.

**Common Date Format Patterns:**

- `'YYYY'` - 4-digit year
- `'MM'` - Month (01-12)
- `'DD'` - Day of month (01-31)
- `'MONTH'` - Full month name (JANUARY)
- `'MON'` - Abbreviated month (JAN)
- `'DAY'` - Full day name (MONDAY)
- `'DY'` - Abbreviated day (MON)
- `'FM'` prefix - Removes leading/trailing spaces

```sql
-- Format date as DD-MM-YYYY
SELECT TO_CHAR(payment_date, 'DD-MM-YYYY') FROM payment;

-- Format as full month name
SELECT TO_CHAR(payment_date, 'MONTH') FROM payment;

-- Format with day name
SELECT TO_CHAR(payment_date, 'DAY, MONTH DD, YYYY') FROM payment;

-- Remove padding with FM
SELECT TO_CHAR(payment_date, 'FMMONTH') FROM payment;
```

> **Tip:** Use `FM` prefix to remove padding from formatted strings. `'MONTH'` returns `'JANUARY   '` (with spaces), while `'FMMONTH'` returns `'JANUARY'`.

### Mathematical Functions and Operators

SQL supports standard mathematical operations and functions for numeric calculations.

**Common Mathematical Operators:**

- `+`, `-`, `*`, `/` - Basic arithmetic
- `%` or `MOD()` - Modulo (remainder)
- `POWER()` or `^` - Exponentiation
- `SQRT()` - Square root
- `ABS()` - Absolute value

**Common Functions:**

- `ROUND(value, decimals)` - Round to specified decimal places
- `CEIL()` or `CEILING()` - Round up
- `FLOOR()` - Round down
- `TRUNC()` - Truncate (remove decimal part)

```sql
-- Basic arithmetic
SELECT rental_rate / replacement_cost FROM film;

-- Round to 2 decimal places
SELECT ROUND(rental_rate / replacement_cost, 2) FROM film;

-- Calculate percentage
SELECT ROUND(rental_rate / replacement_cost, 2) * 100 AS percent_cost
FROM film;

-- Multiple calculations
SELECT
    amount,
    ROUND(amount * 1.1, 2) AS amount_with_tax,
    CEIL(amount) AS rounded_up,
    FLOOR(amount) AS rounded_down
FROM payment;
```

> **Warning:** Division by zero will cause an error. Use `NULLIF()` or `CASE` to handle division by zero scenarios.
> **Tip:** Always use `ROUND()` when displaying calculated percentages or ratios to avoid showing excessive decimal places.

### String Functions and Operators

String functions allow you to manipulate, combine, and transform text data.

**Common String Operators:**

- `||` - Concatenation operator (PostgreSQL)
- `+` - Concatenation (SQL Server)
- `CONCAT()` - Concatenation function

**Common String Functions:**

- `LENGTH()` - Returns string length
- `UPPER()` / `LOWER()` - Convert case
- `TRIM()` - Remove leading/trailing spaces
- `SUBSTRING()` or `SUBSTR()` - Extract substring
- `REPLACE()` - Replace occurrences
- `POSITION()` - Find position of substring

```sql
-- Concatenate strings
SELECT first_name || ' ' || last_name AS full_name
FROM customer;

-- Using CONCAT function
SELECT CONCAT(first_name, ' ', last_name) AS full_name
FROM customer;

-- String manipulation
SELECT
    UPPER(first_name) AS upper_name,
    LOWER(last_name) AS lower_name,
    LENGTH(first_name) AS name_length,
    SUBSTRING(first_name, 1, 3) AS first_three_chars
FROM customer;

-- Replace text
SELECT REPLACE(title, ' ', '-') AS title_with_dashes
FROM film;
```

> **Tip:** The `||` operator is PostgreSQL-specific. Use `CONCAT()` for better cross-database compatibility, or `+` for SQL Server.
> **Performance Note:** String concatenation and manipulation can be expensive on large datasets. Consider doing these operations in application code if performance is critical.

### SubQuery

A subquery (also called inner query or nested query) is a query nested inside another query. Subqueries allow you to construct complex queries by breaking them into smaller, manageable parts.

**Types of Subqueries:**

1. **Scalar Subquery** - Returns a single value
2. **Row Subquery** - Returns a single row
3. **Column Subquery** - Returns a single column
4. **Table Subquery** - Returns a table (used with IN, EXISTS, etc.)

**Common Uses:**

- In WHERE clause with `IN`, `EXISTS`, comparison operators
- In SELECT clause (scalar subquery)
- In FROM clause (derived table)

```sql
-- Subquery in WHERE clause with IN
SELECT film_id, title
FROM film
WHERE film_id IN (
    SELECT inventory.film_id
    FROM rental
    INNER JOIN inventory ON inventory.inventory_id = rental.inventory_id
    WHERE return_date BETWEEN '2005-05-29' AND '2005-05-30'
);

-- Scalar subquery in SELECT
SELECT
    customer_id,
    amount,
    (SELECT AVG(amount) FROM payment) AS avg_amount
FROM payment;

-- Subquery with EXISTS
SELECT * FROM customer c
WHERE EXISTS (
    SELECT 1 FROM payment p
    WHERE p.customer_id = c.customer_id
    AND p.amount > 5
);
```

> **Performance Tip:** Subqueries can sometimes be rewritten as JOINs, which are often more efficient. However, subqueries can be more readable for complex logic.
> **Warning:** Correlated subqueries (those that reference the outer query) can be slow because they execute once for each row in the outer query. Consider rewriting as JOINs when possible.

### Self-Join

A self-join is a regular join where a table is joined with itself. This is useful for comparing rows within the same table or finding relationships between rows in the same table.

**Common Use Cases:**

- Finding duplicate records
- Finding related records (e.g., employees and their managers)
- Comparing rows within the same table

**Key Points:**

- Must use table aliases to distinguish between the two instances
- Can use any join type (INNER, LEFT, etc.)

```sql
-- Find films with the same length
SELECT f1.title, f2.title, f1.length
FROM film AS f1
INNER JOIN film AS f2
ON f1.film_id = f2.film_id
AND f1.length = f2.length;

-- Better example: Find films with same length but different IDs
SELECT f1.title AS film1, f2.title AS film2, f1.length
FROM film AS f1
INNER JOIN film AS f2
ON f1.length = f2.length
WHERE f1.film_id < f2.film_id  -- Avoid duplicates and self-matches
ORDER BY f1.length;
```

> **Tip:** Always include a condition to prevent matching a row with itself (like `f1.film_id < f2.film_id`) unless you specifically want self-matches.
> **Warning:** Self-joins can produce very large result sets if not properly constrained. Always test with LIMIT first on large tables.

---

### Challenges

### Challenge #1

During which months did payments occur? Format your answer to return back the full month name.

```sql
SELECT DISTINCT(TO_CHAR(payment_date, 'MONTH')) AS month
FROM payment;
```

### Challenge #2

How many payments occurred on a Monday?

```sql
SELECT COUNT(payment_id)
FROM payment
WHERE (TO_CHAR(payment_date, 'FMDAY')) = 'MONDAY';
```
