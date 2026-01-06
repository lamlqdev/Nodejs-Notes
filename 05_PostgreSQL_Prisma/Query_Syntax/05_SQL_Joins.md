# Section 5: JOINS

Joins are used to combine rows from two or more tables based on a related column between them. Understanding different join types is crucial for working with relational databases.

### AS Statement (Aliases)

The `AS` keyword is used to create aliases for columns or tables, making queries more readable.

**Key Points:**
- `AS` is optional - you can use spaces: `SELECT amount rental_price`
- Table aliases are especially useful with JOINs
- Column aliases appear in the result set
- Table aliases are used within the query only

```sql
-- Column alias
SELECT amount AS rental_price FROM payment;

-- Table alias (very useful with JOINs)
SELECT c.first_name, c.last_name 
FROM customer AS c;

-- AS is optional
SELECT amount rental_price FROM payment;
```

> **Tip:** Always use table aliases with JOINs to avoid ambiguity and make queries more readable, especially when multiple tables have columns with the same name.

### Inner Joins

`INNER JOIN` returns only the rows that have matching values in both tables. It's the most common type of join.

**Key Characteristics:**
- Returns only matching rows from both tables
- If there's no match, the row is excluded
- Most restrictive join type
- Default behavior when using `JOIN` (without specifying INNER/LEFT/etc.)

**Visual Representation:**
```
Table A  ∩  Table B  (intersection)
```

```sql
-- Basic INNER JOIN
SELECT * FROM payment
INNER JOIN customer
ON payment.customer_id = customer.customer_id;

-- Using table aliases (recommended)
SELECT p.amount, c.first_name, c.last_name
FROM payment p
INNER JOIN customer c
ON p.customer_id = c.customer_id;

-- Multiple INNER JOINs
SELECT f.title, a.first_name, a.last_name
FROM film f
INNER JOIN film_actor fa ON f.film_id = fa.film_id
INNER JOIN actor a ON fa.actor_id = a.actor_id;
```

> **Tip:** `INNER JOIN` and `JOIN` are equivalent. Most databases treat `JOIN` as `INNER JOIN` by default.

> **Performance Tip:** Always ensure the columns used in JOIN conditions are indexed for better query performance.

### Full Outer Joins

`FULL OUTER JOIN` returns all rows from both tables, with NULL values in columns where there's no match.

**Key Characteristics:**
- Returns all rows from both tables
- Fills in NULLs for non-matching rows
- Useful when you need to see all data from both tables
- Less commonly used than INNER or LEFT JOINs

**Visual Representation:**
```
Table A  ∪  Table B  (union - all rows from both)
```

```sql
SELECT * FROM customer c
FULL OUTER JOIN payment p
ON c.customer_id = p.customer_id;

-- This will show:
-- - All customers with their payments
-- - Customers without payments (payment columns will be NULL)
-- - Payments without customers (customer columns will be NULL)
```

> **Warning:** `FULL OUTER JOIN` can produce very large result sets. Use with caution on large tables.

> **Note:** Not all databases support `FULL OUTER JOIN`. MySQL doesn't support it natively.

### Left Outer Join

`LEFT JOIN` (or `LEFT OUTER JOIN`) returns all rows from the left table and the matching rows from the right table. If there's no match, NULL values are returned for right table columns.

**Key Characteristics:**
- Returns all rows from the left table
- Returns matching rows from the right table
- NULLs for non-matching right table columns
- Very commonly used for finding records without matches

**Visual Representation:**
```
All of Table A + matching rows from Table B
```

```sql
-- Find all films and their inventory (if any)
SELECT f.film_id, f.title, i.inventory_id, i.store_id
FROM film f
LEFT JOIN inventory i 
ON i.film_id = f.film_id;

-- Find films that have NO inventory
SELECT f.film_id, f.title
FROM film f
LEFT JOIN inventory i ON i.film_id = f.film_id
WHERE i.inventory_id IS NULL;
```

**Right Join:** `RIGHT JOIN` (or `RIGHT OUTER JOIN`) is the opposite of `LEFT JOIN` - it returns all rows from the right table and matching rows from the left table.

```sql
-- RIGHT JOIN example
SELECT f.film_id, f.title, i.inventory_id
FROM film f
RIGHT JOIN inventory i 
ON f.film_id = i.film_id;
-- This is equivalent to:
SELECT f.film_id, f.title, i.inventory_id
FROM inventory i
LEFT JOIN film f 
ON i.film_id = f.film_id;
```

> **Tip:** `RIGHT JOIN` is rarely used because you can achieve the same result by swapping tables and using `LEFT JOIN`. Most developers prefer `LEFT JOIN` for consistency.

> **Common Use Case:** Use `LEFT JOIN` with `WHERE right_table.column IS NULL` to find records in the left table that don't have a match in the right table (anti-join pattern).

### UNION

The `UNION` operator combines the result sets of two or more SELECT statements into a single result set.

**Key Points:**
- Removes duplicate rows (use `UNION ALL` to keep duplicates)
- All SELECT statements must have the same number of columns
- Corresponding columns must have compatible data types
- Column names come from the first SELECT statement

**UNION vs UNION ALL:**
- `UNION` - Removes duplicates (slower, requires sorting)
- `UNION ALL` - Keeps all rows including duplicates (faster)

```sql
-- Basic UNION
SELECT first_name, last_name FROM customer
UNION
SELECT first_name, last_name FROM actor;

-- UNION ALL (keeps duplicates, faster)
SELECT first_name, last_name FROM customer
UNION ALL
SELECT first_name, last_name FROM actor;

-- Multiple UNIONs
SELECT customer_id FROM customer
UNION
SELECT customer_id FROM payment
UNION
SELECT customer_id FROM rental;
```

> **Performance Tip:** Use `UNION ALL` instead of `UNION` if you don't need to remove duplicates. It's faster because it doesn't need to sort and deduplicate results.

> **Warning:** Make sure the columns in each SELECT statement are in the same order and have compatible types, otherwise you'll get unexpected results or errors.

---

### Challenges

### Challenge #1

California sales tax laws have changed and we need to alert our customers through email. What are the emails of the customers who live in California?

```sql
SELECT address.district, customer.email
FROM customer
INNER JOIN address ON customer.address_id = address.address_id
WHERE district = 'California';
```

### Challenge #2

A customer walks in and is a huge fan of the actor "Nick Wahlberg" and wants to know which movies he is in. Get a list of all the movies "Nick Wahlberg" has been in.

```sql
SELECT film.title, actor.first_name, actor.last_name
FROM film
INNER JOIN film_actor ON film.film_id = film_actor.film_id
INNER JOIN actor ON film_actor.actor_id = actor.actor_id
WHERE first_name = 'Nick' AND last_name = 'Wahlberg';
```
