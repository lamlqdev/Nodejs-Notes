# Assessment Test 2

### Question 1

How can you retrieve all the information from the cd.facilities table?

```sql
SELECT * FROM cd.facilities;
```

### Question 2

You want to print out a list of all of the facilities and their cost to members. How would you retrieve a list of only facility names and costs?

```sql
SELECT name, membercost FROM cd.facilities;
```

### Question 3

How can you produce a list of facilities that charge a fee to members?

```sql
SELECT * FROM cd.facilities
WHERE membercost > 0;
```

### Question 4

How can you produce a list of facilities that charge a fee to members, and that fee is less than 1/50th of the monthly maintenance cost? Return the facid, facility name, member cost, and monthly maintenance of the facilities in question.

```sql
SELECT facid, name, membercost, monthlymaintenance 
FROM cd.facilities
WHERE membercost > 0 AND membercost < monthlymaintenance / 50;
```

### Question 5

How can you produce a list of all facilities with the word 'Tennis' in their name?

```sql
SELECT * FROM cd.facilities
WHERE name LIKE '%Tennis%';
```

### Question 6

How can you retrieve the details of facilities with ID 1 and 5? Try to do it without using the OR operator.

```sql
SELECT * FROM cd.facilities
WHERE facid IN (1, 5);
```

### Question 7

How can you produce a list of members who joined after the start of September 2012? Return the memid, surname, firstname, and joindate of the members in question.

```sql
SELECT memid, surname, firstname, joindate 
FROM cd.members
WHERE joindate >= '2012-09-01';
```

### Question 8

How can you produce an ordered list of the first 10 surnames in the members table? The list must not contain duplicates.

```sql
SELECT DISTINCT(surname) 
FROM cd.members
ORDER BY surname ASC 
LIMIT 10;
```

### Question 9

You'd like to get the signup date of your last member. How can you retrieve this information?

```sql
SELECT MAX(joindate) AS latest_signup 
FROM cd.members;
```

### Question 10

Produce a count of the number of facilities that have a cost to guests of 10 or more.

```sql
SELECT COUNT(*) 
FROM cd.facilities
WHERE guestcost >= 10;
```

### Question 11

Produce a list of the total number of slots booked per facility in the month of September 2012. Produce an output table consisting of facility id and slots, sorted by the number of slots.

```sql
SELECT facid, SUM(slots) AS total_slots 
FROM cd.bookings
WHERE (TO_CHAR(starttime, 'mm-yyyy')) = '09-2012'
GROUP BY facid
ORDER BY SUM(slots);
```

### Question 12

Produce a list of facilities with more than 1000 slots booked. Produce an output table consisting of facility id and total slots, sorted by facility id.

```sql
SELECT facid, SUM(slots) AS total_slots 
FROM cd.bookings
GROUP BY facid
HAVING SUM(slots) >= 1000
ORDER BY facid;
```

### Question 13

How can you produce a list of the start times for bookings for tennis courts, for the date '2012-09-21'? Return a list of start time and facility name pairings, ordered by the time.

```sql
SELECT starttime AS start, cd.facilities.name 
FROM cd.bookings
INNER JOIN cd.facilities ON cd.facilities.facid = cd.bookings.facid
WHERE name LIKE 'Tennis Court%' 
AND (TO_CHAR(starttime, 'yyyy-mm-dd')) = '2012-09-21'
ORDER BY starttime;
```

### Question 14

How can you produce a list of the start times for bookings by members named 'David Farrell'?

```sql
SELECT starttime,
       cd.members.firstname || ' ' || cd.members.surname AS Full_Name 
FROM cd.bookings
INNER JOIN cd.members ON cd.bookings.memid = cd.members.memid
WHERE cd.members.firstname || ' ' || cd.members.surname = 'David Farrell';
```
