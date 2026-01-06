# Section 3: GROUP BY Statements

### Aggregation Functions

Aggregate functions perform calculations on a set of rows and return a single value. They are essential for summarizing data.

**Common Aggregate Functions:**

- `AVG()` - Calculates the average (mean) of numeric values
- `COUNT()` - Counts the number of rows
- `MAX()` - Returns the maximum value
- `MIN()` - Returns the minimum value
- `SUM()` - Calculates the sum of numeric values

**Key Points:**

- Aggregate functions ignore NULL values (except `COUNT(*)`)
- `COUNT(*)` counts all rows including NULLs
- `COUNT(column_name)` counts non-NULL values only
- Can be combined with `ROUND()` for better formatting

```sql
-- Calculate average replacement cost
SELECT AVG(replacement_cost) FROM film;

-- Round the average to 2 decimal places
SELECT ROUND(AVG(replacement_cost), 2) FROM film;

-- Count all rows
SELECT COUNT(*) FROM film;

-- Count non-NULL values in a column
SELECT COUNT(rating) FROM film;

-- Multiple aggregates
SELECT
    COUNT(*) AS total_films,
    AVG(rental_rate) AS avg_rental_rate,
    MAX(replacement_cost) AS max_cost,
    MIN(replacement_cost) AS min_cost
FROM film;
```

> **Tip:** Use `COUNT(*)` when you want to count all rows, and `COUNT(column_name)` when you want to count only non-NULL values in that column.

> **Warning:** Aggregate functions cannot be used in WHERE clauses. Use `HAVING` instead for filtering aggregated results.

### GROUP BY

The `GROUP BY` clause groups rows that have the same values in specified columns into summary rows. It's typically used with aggregate functions to perform calculations on each group.

**Key Concepts:**

- Groups rows with identical values in the specified column(s)
- Each group becomes a single row in the result set
- All non-aggregated columns in SELECT must appear in GROUP BY
- NULL values are grouped together

**SQL Execution Order:**

1. FROM
2. WHERE
3. GROUP BY
4. HAVING
5. SELECT
6. ORDER BY
7. LIMIT

```sql
-- Group by single column
SELECT customer_id, SUM(amount)
FROM payment
GROUP BY customer_id;

-- Group by multiple columns
SELECT customer_id, staff_id, SUM(amount)
FROM payment
GROUP BY staff_id, customer_id;

-- Group by with multiple aggregates
SELECT rating,
       COUNT(*) AS film_count,
       AVG(rental_rate) AS avg_rental_rate,
       SUM(replacement_cost) AS total_replacement_cost
FROM film
GROUP BY rating;
```

> **Important Rule:** Every column in the SELECT clause that is not an aggregate function must be included in the GROUP BY clause. Otherwise, you'll get an error.

> **Tip:** The order of columns in `GROUP BY` matters when grouping by multiple columns. `GROUP BY A, B` groups differently than `GROUP BY B, A`.

### HAVING

The `HAVING` clause filters groups after they have been created by `GROUP BY`. It's similar to `WHERE`, but operates on aggregated data.

**Key Differences: WHERE vs HAVING**

| WHERE                          | HAVING                        |
| ------------------------------ | ----------------------------- |
| Filters rows before grouping   | Filters groups after grouping |
| Cannot use aggregate functions | Can use aggregate functions   |
| Used before GROUP BY           | Used after GROUP BY           |

**When to use:**

- Use `WHERE` to filter individual rows before aggregation
- Use `HAVING` to filter groups based on aggregate results

```sql
-- Filter groups with HAVING
SELECT customer_id, SUM(amount)
FROM payment
GROUP BY customer_id
HAVING SUM(amount) > 100;

-- Combine WHERE and HAVING
SELECT customer_id, SUM(amount)
FROM payment
WHERE staff_id = 2  -- Filter rows first
GROUP BY customer_id
HAVING SUM(amount) >= 100;  -- Then filter groups

-- Multiple conditions in HAVING
SELECT rating, COUNT(*) AS film_count
FROM film
GROUP BY rating
HAVING COUNT(*) > 100 AND AVG(rental_rate) > 2.5;
```

> **Best Practice:** Use `WHERE` to filter rows before grouping (more efficient), and `HAVING` only when you need to filter based on aggregate results.

> **Warning:** Don't confuse `WHERE` and `HAVING`. Using aggregate functions in `WHERE` will cause an error. Always use `HAVING` for aggregate conditions.

---

### Challenges

### Challenge: GROUP BY

**Challenge #1:** We have two staff members, with Staff IDs 1 and 2. We want to give a bonus to the staff member that handled the most payments. (Most in terms of number of payments processed, not total dollar amount.) How many payments did each staff member handle and who gets the bonus?

```sql
SELECT staff_id, COUNT(*)
FROM payment
GROUP BY staff_id;
```

**Challenge #2:** Corporate HQ is conducting a study on the relationship between replacement cost and a movie MPAA rating (e.g. G, PG, R, etc.). What is the average replacement cost per MPAA rating? Note: You may need to expand the AVG column to view correct results.

```sql
SELECT rating, AVG(replacement_cost)
FROM film
GROUP BY rating;
```

**Challenge #3:** We are running a promotion to reward our top 5 customers with coupons. What are the customer ids of the top 5 customers by total spend?

```sql
SELECT customer_id, SUM(amount)
FROM payment
GROUP BY customer_id
ORDER BY SUM(amount) DESC
LIMIT 5;
```

### Challenge: HAVING

**Challenge #1:** We are launching a platinum service for our most loyal customers. We will assign platinum status to customers that have had 40 or more transaction payments. What customer_ids are eligible for platinum status?

```sql
SELECT customer_id, COUNT(*)
FROM payment
GROUP BY customer_id
HAVING COUNT(*) >= 40;
```

**Challenge #2:** What are the customer ids of customers who have spent more than $100 in payment transactions with our staff-id member 2?

```sql
SELECT customer_id, SUM(amount)
FROM payment
WHERE staff_id = 2
GROUP BY customer_id
HAVING SUM(amount) >= 100;
```
