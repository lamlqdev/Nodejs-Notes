# Section 2: SQL Statement Fundamentals

### SELECT Statement

The `SELECT` statement is the most fundamental SQL command. It retrieves data from one or more tables in a database.

**Basic Syntax:**

- `SELECT *` - Selects all columns from a table
- `SELECT column_name` - Selects specific column(s) from a table

```sql
-- Select all columns from actor table
SELECT * FROM actor;

-- Select specific column from actor table
SELECT first_name FROM actor;

-- Select multiple columns
SELECT first_name, last_name, email FROM customer;
```

> **Tip:** Avoid using `SELECT *` in production code. Always specify the exact columns you need for better performance and clarity.

### SELECT DISTINCT

`DISTINCT` eliminates duplicate rows from the result set, showing only unique values.

**Key Points:**

- `DISTINCT` applies to the entire row, not individual columns
- When used with multiple columns, it returns unique combinations
- NULL values are considered equal (only one NULL will be returned)

```sql
-- Get unique release years
SELECT DISTINCT release_year FROM film;

-- Get unique combinations of rating and release_year
SELECT DISTINCT rating, release_year FROM film;
```

> **Warning:** Using `DISTINCT` can impact query performance on large tables. Consider using it only when necessary.

### SELECT WHERE

The `WHERE` clause filters rows based on specified conditions. It comes after the `FROM` clause and before `GROUP BY`, `ORDER BY`, etc.

**Comparison Operators:**

- `=` - Equal to
- `<>` or `!=` - Not equal to
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal to
- `<=` - Less than or equal to

**Logical Operators:**

- `AND` - Both conditions must be true
- `OR` - At least one condition must be true
- `NOT` - Negates a condition

```sql
-- Simple condition
SELECT * FROM film
WHERE rental_rate > 1;

-- Multiple conditions with AND
SELECT * FROM film
WHERE rental_rate > 1 AND replacement_cost >= 4.99;

-- Using OR
SELECT * FROM film
WHERE rating = 'PG' OR rating = 'PG-13';

-- Combining AND and OR (use parentheses for clarity)
SELECT * FROM film
WHERE (rating = 'PG' OR rating = 'PG-13') AND rental_rate < 3;
```

> **Tip:** Always use parentheses when combining `AND` and `OR` to avoid ambiguity and ensure correct logic.

### ORDER BY and LIMIT

### ORDER BY

Sorts the result set based on one or more columns.

**Key Points:**

- `ASC` (ascending) is the default - can be omitted
- `DESC` (descending) sorts from highest to lowest
- You can sort by multiple columns
- NULL values sort last in ascending order, first in descending order

```sql
-- Sort by single column (ascending by default)
SELECT * FROM customer
ORDER BY customer_id;

-- Sort descending
SELECT * FROM customer
ORDER BY customer_id DESC;

-- Sort by multiple columns
SELECT * FROM film
ORDER BY rating ASC, title DESC;

-- Limit results
SELECT * FROM customer
ORDER BY customer_id DESC
LIMIT 5;
```

### LIMIT

Restricts the number of rows returned by a query.

**Key Points:**

- `LIMIT` is typically used with `ORDER BY` to get top/bottom N records
- Useful for pagination: `LIMIT 10 OFFSET 20` (skip 20, return next 10)
- Different databases use different syntax (PostgreSQL uses LIMIT, SQL Server uses TOP)

```sql
-- Get top 5 customers
SELECT * FROM customer
ORDER BY customer_id DESC
LIMIT 5;

-- Pagination example
SELECT * FROM customer
ORDER BY customer_id
LIMIT 10 OFFSET 10; -- Skip first 10, return next 10
```

> **Tip:** Always use `ORDER BY` with `LIMIT` to ensure consistent, predictable results. Without `ORDER BY`, the order is undefined.

### BETWEEN

Selects values within a specified range (inclusive).

**Key Points:**

- `BETWEEN` is inclusive - includes both boundary values
- Works with numbers, dates, and strings
- `BETWEEN 1 AND 5` is equivalent to `>= 1 AND <= 5`
- For dates, use proper date format: `'2020-01-01'`

```sql
-- Numeric range
SELECT * FROM payment
WHERE amount BETWEEN 1 AND 5; -- Includes 1 and 5

-- Date range
SELECT * FROM payment
WHERE payment_date BETWEEN '2007-01-01' AND '2007-01-31';

-- NOT BETWEEN (values outside the range)
SELECT * FROM payment
WHERE amount NOT BETWEEN 1 AND 5;
```

> **Warning:** When using `BETWEEN` with dates, be careful about time components. `BETWEEN '2020-01-01' AND '2020-01-31'` might exclude records from Jan 31 if they have a time component. Consider using `>=` and `<` for date ranges.

### IN

The `IN` operator allows you to specify multiple values in a WHERE clause. It's equivalent to multiple `OR` conditions but more readable.

**Key Points:**

- More efficient than multiple `OR` conditions
- Can be used with subqueries
- `NOT IN` excludes the specified values
- NULL values in the list can cause unexpected results with `NOT IN`

```sql
-- Simple IN clause
SELECT * FROM payment
WHERE amount IN (0.99, 1.99, 2.99);

-- Equivalent to:
SELECT * FROM payment
WHERE amount = 0.99 OR amount = 1.99 OR amount = 2.99;

-- NOT IN
SELECT * FROM film
WHERE rating NOT IN ('R', 'NC-17');

-- IN with subquery
SELECT * FROM customer
WHERE customer_id IN (
    SELECT customer_id FROM payment
    WHERE amount > 5
);
```

> **Warning:** Be careful with `NOT IN` when the subquery might return NULL values. If any value in the list is NULL, `NOT IN` will return no rows. Use `NOT EXISTS` instead for subqueries that might contain NULLs.

### LIKE and ILIKE

Pattern matching operators for string data. They allow you to search for patterns rather than exact matches.

### Wildcards

- `%` - Matches any sequence of zero or more characters
- `_` - Matches exactly one character

### LIKE vs ILIKE

- **LIKE** - Case-sensitive pattern matching
- **ILIKE** - Case-insensitive pattern matching (PostgreSQL specific)

```sql
-- Starts with 'J' (case-sensitive)
SELECT * FROM customer
WHERE first_name LIKE 'J%';

-- Starts with 'J' (case-insensitive)
SELECT * FROM customer
WHERE first_name ILIKE 'j%';

-- Contains 'Truman' anywhere
SELECT * FROM film
WHERE title LIKE '%Truman%';

-- Exactly 4 characters, starts with 'J'
SELECT * FROM customer
WHERE first_name LIKE 'J___';

-- Escape special characters (if searching for literal %)
SELECT * FROM customer
WHERE first_name LIKE '100\%' ESCAPE '\';
```

**Common Patterns:**

- `'J%'` - Starts with J
- `'%son'` - Ends with son
- `'%John%'` - Contains John
- `'_ohn'` - 4 characters, second character is 'o', third is 'h', fourth is 'n'
- `'J_n'` - 3 characters, starts with J, ends with n

> **Tip:** `LIKE` and `ILIKE` can be slow on large tables, especially with leading wildcards (`%text`). Consider full-text search for better performance on large datasets.
> **Performance Warning:** Pattern matching with leading wildcards (`%text`) cannot use indexes effectively, leading to full table scans. Use trailing wildcards (`text%`) when possible.

---

### Challenges

### Challenge: SELECT

We want to send out a promotional email to our existing customers. Use a SELECT statement to grab the first and last names of every customer and their email addresses.

```sql
SELECT first_name, last_name, email FROM customer;
```

### Challenge: SELECT DISTINCT

An Australian visitor isn't familiar with MPAA movie ratings (e.g. PG, PG-13, R, etc.). We want to know the types of ratings we have in our database. What ratings do we have available?

```sql
SELECT DISTINCT rating FROM film;
```

### Challenge: SELECT WHERE

**Challenge #1:** A customer forgot their wallet at our store! We need to track down their email to inform them. What is the email for the customer with the name Nancy Thomas?

```sql
SELECT email FROM customer
WHERE first_name = 'Nancy' AND last_name = 'Thomas';
```

**Challenge #2:** A customer wants to know what the movie "Outlaw Hanky" is about. Could you give them the description for the movie "Outlaw Hanky"?

```sql
SELECT description FROM film
WHERE title = 'Outlaw Hanky';
```

**Challenge #3:** A customer is late on their movie return, and we've mailed them a letter to their address at '259 Ipoh Drive.' We should also call them on the phone to let them know. Can you get the phone number for the customer who lives at '259 Ipoh Drive'?

```sql
SELECT phone FROM address
WHERE address = '259 Ipoh Drive';
```

### Challenge: ORDER BY

**Challenge #1:** We want to reward our first 10 paying customers. What are the customer IDs of the first 10 customers who created a payment?

```sql
SELECT customer_id
FROM payment
ORDER BY payment_date ASC
LIMIT 10;
```

**Challenge #2:** A customer wants to rent a video to watch over their short lunch break. What are the titles of the 5 shortest (in length of runtime) movies?

```sql
SELECT title, length FROM film
ORDER BY length ASC
LIMIT 5;
```

**Bonus Question:** If the previous customer can watch any movie that is 50 min or less in run time, how many options does she have?

```sql
SELECT COUNT(*) FROM film
WHERE length <= 50;
```

### General Challenge

**Challenge #1:** How many payment transactions were greater than $5.00?

```sql
SELECT COUNT(*) FROM payment
WHERE amount > 5.00;
```

**Challenge #2:** How many actors have a first name that starts with the letter P?

```sql
SELECT COUNT(*) FROM actor
WHERE first_name LIKE 'P%';
```

**Challenge #3:** How many unique districts are our customers from?

```sql
SELECT COUNT(DISTINCT(district)) FROM address;
```

**Challenge #4:** Retrieve the list of names for those distinct districts from the previous question.

```sql
SELECT DISTINCT(district) FROM address;
```

**Challenge #5:** How many films have a rating R and a replacement cost between $5 and $15?

```sql
SELECT COUNT(*) FROM film
WHERE rating = 'R' AND replacement_cost BETWEEN 5 AND 15;
```

**Challenge #6:** How many films have the word Truman somewhere in the title?

```sql
SELECT COUNT(*) FROM film
WHERE title LIKE '%Truman%';
```
