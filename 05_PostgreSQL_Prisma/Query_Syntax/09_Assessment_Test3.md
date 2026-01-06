# Assessment Test 3

### Task

Complete the following task:

Create a new database called "School" this database should have two tables: teachers and students.

The students table should have columns for student_id, first_name, last_name, homeroom_number, phone, email, and graduation year.

The teachers table should have columns for teacher_id, first_name, last_name, homeroom_number, department, email, and phone.

The constraints are mostly up to you, but your table constraints do have to consider the following:

- We must have a phone number to contact students in case of an emergency.
- We must have ids as the primary key of the tables
- Phone numbers and emails must be unique to the individual.

### Solution

### Create Student Table

```sql
CREATE TABLE student(
    student_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    homeroom_number INTEGER NOT NULL,
    phone VARCHAR(12) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE,
    graduation_year INTEGER
);
```

### Create Teacher Table

```sql
CREATE TABLE teacher(
    teacher_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    homeroom_number INTEGER,
    department VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE,
    phone VARCHAR(12) UNIQUE NOT NULL
);
```

### Insert Student Data

Once you've made the tables, insert a student named Mark Watney (student_id=1) who has a phone number of 888-777 and doesn't have an email. He graduates in 2035 and has 5 as a homeroom number.

```sql
INSERT INTO student(first_name, last_name, homeroom_number, phone, graduation_year)
VALUES
('Mark', 'Watney', 5, '888-777', 2035);
```

### Insert Teacher Data

Then insert a teacher named Jonas Salk (teacher_id = 1) who has a homeroom number of 5 and is from the Biology department. His contact info is: jsalk@school.org and a phone number of 777-555.

```sql
INSERT INTO teacher(first_name, last_name, homeroom_number, department, email, phone)
VALUES
('Jonas', 'Salk', 5, 'Biology', 'jsalk@school.org', '777-555');
```
