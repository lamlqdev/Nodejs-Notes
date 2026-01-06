# Assessment Test 1

### Question 1

Return the customer IDs of customers who have spent at least $110 with the staff member who has an ID of 2. The answer should be customers 187 and 148.

```sql
SELECT customer_id, SUM(amount)
FROM payment
WHERE staff_id = 2
GROUP BY customer_id
HAVING SUM(amount) >= 110;
```

### Question 2

How many films begin with the letter J? The answer should be 20.

```sql
SELECT COUNT(*)
FROM film
WHERE title LIKE 'J%';
```

### Question 3

What customer has the highest customer ID number whose name starts with an 'E' and has an address ID lower than 500? The answer is Eddie Tomlin.

```sql
SELECT first_name, last_name, MAX(customer_id)
FROM customer
WHERE first_name LIKE 'E%'
GROUP BY first_name, last_name
HAVING MAX(customer_id) < 500
ORDER BY MAX(customer_id) DESC
LIMIT 1;
```
