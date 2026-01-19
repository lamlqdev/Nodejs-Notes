# ES6 (ECMAScript 2015) - Essential Features Guide

## Overview

ES6 (ECMAScript 2015) is a major update to JavaScript that introduced significant syntax improvements and new features. This guide covers the core ES6 features that modernized JavaScript development.

---

## Arrow Functions

Arrow functions provide a shorter syntax for writing function expressions and lexically bind the `this` value to the surrounding context.

### Basic Syntax

```javascript
// Traditional function
const add = function(a, b) {
  return a + b;
};

// Arrow function
const add = (a, b) => {
  return a + b;
};

// Concise arrow function (implicit return)
const add = (a, b) => a + b;

// Single parameter (parentheses optional)
const square = x => x * x;

// No parameters
const greet = () => "Hello!";

// Returning object literal (wrap in parentheses)
const makePerson = (name, age) => ({ name, age });
```

### Understanding `this` in Arrow Functions

#### What is `this`?

`this` is a special keyword in JavaScript that refers to an object. Think of `this` as "the object that is currently executing this code."

```javascript
// Example 1: 'this' in an object method
const person = {
  name: 'Alice',
  age: 25,
  sayHello: function() {
    // 'this' refers to the person object
    console.log('Hi, I am ' + this.name);
    console.log('I am ' + this.age + ' years old');
  }
};

person.sayHello();
// Output: "Hi, I am Alice"
//         "I am 25 years old"
```

```javascript
// Example 2: 'this' refers to whoever calls the function
const car = {
  brand: 'Toyota',
  showBrand: function() {
    console.log(this.brand); // 'this' refers to the car object
  }
};

car.showBrand(); // Output: "Toyota"
```

The problem is that `this` can change depending on HOW a function is called. This confuses many developers!

#### The Problem with `this` in Regular Functions

Arrow functions handle `this` differently than regular functions. Arrow functions do not have their own this binding; they use the this value from the surrounding lexical scope.

#### Regular Function `this` Problem

```javascript
const person = {
  name: 'Alice',
  hobbies: ['reading', 'coding'],
  
  showHobbies: function() {
    this.hobbies.forEach(function(hobby) {
      // 'this' is undefined here! Not the person object 
      console.log(this.name + ' likes ' + hobby); // Error!
    });
  }
};
```

#### Arrow Function Solution

```javascript
const person = {
  name: 'Alice',
  hobbies: ['reading', 'coding'],
  
  showHobbies: function() {
    this.hobbies.forEach((hobby) => {
      // Arrow function inherits 'this' from showHobbies
      // So 'this' refers to the person object
      console.log(this.name + ' likes ' + hobby); // Works!
    });
  }
};
```

#### Practical Example: Timer

```javascript
function Timer() {
  this.seconds = 0;
  
  // Regular function - 'this' would be window/undefined
  setInterval(function() {
    this.seconds++; // Error! 'this' is not the Timer
  }, 1000);
}

function Timer() {
  this.seconds = 0;
  
  // Arrow function - 'this' is inherited from Timer
  setInterval(() => {
    this.seconds++; // Works! 'this' is the Timer object
  }, 1000);
}
```

#### When NOT to Use Arrow Functions

```javascript
// DON'T use arrow functions as object methods
const person = {
  name: 'Bob',
  greet: () => {
    // 'this' is NOT the person object!
    console.log(this.name); // undefined
  }
};

// DO use regular functions for object methods
const person = {
  name: 'Bob',
  greet: function() {
    // 'this' IS the person object
    console.log(this.name); // 'Bob'
  }
};
```

**Simple Rule**: Arrow functions "borrow" `this` from their parent. Regular functions create their own `this` based on how they're called.

---

## Template Strings (Template Literals)

Template strings allow embedded expressions and multi-line strings using backticks.

### Basic Syntax

```javascript
// String interpolation
const name = "Alice";
const greeting = `Hello, ${name}!`;

// Expression evaluation
const a = 10;
const b = 20;
const result = `Sum: ${a + b}`;

// Multi-line strings
const multiLine = `
  This is line 1
  This is line 2
  This is line 3
`;

// Nested templates
const price = 19.99;
const message = `Price: ${`$${price}`}`;

// Tagged templates
function tag(strings, ...values) {
  console.log(strings); // Array of string parts
  console.log(values);  // Array of interpolated values
}

tag`Hello ${name}, you are ${25} years old`;
```

---

## Spread Operator

The spread operator (`...`) expands iterables into individual elements.

### Array Spread

```javascript
// Copying arrays
const arr1 = [1, 2, 3];
const arr2 = [...arr1];

// Concatenating arrays
const combined = [...arr1, 4, 5, ...arr2];

// Passing array elements as function arguments
const numbers = [1, 2, 3];
Math.max(...numbers); // Same as Math.max(1, 2, 3)

// Spreading strings
const chars = [..."hello"]; // ['h', 'e', 'l', 'l', 'o']
```

### Object Spread

```javascript
// Copying objects
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1 };

// Merging objects
const merged = { ...obj1, c: 3, ...obj2 };

// Overriding properties
const updated = { ...obj1, b: 99 };
```

---

## Destructuring

Destructuring allows unpacking values from arrays or properties from objects into distinct variables.

### Array Destructuring

```javascript
// Basic array destructuring
const [a, b] = [1, 2];

// Skipping elements
const [first, , third] = [1, 2, 3];

// Rest pattern
const [head, ...tail] = [1, 2, 3, 4];
// head: 1, tail: [2, 3, 4]

// Default values
const [x = 10, y = 20] = [5];
// x: 5, y: 20

// Swapping variables
let p = 1, q = 2;
[p, q] = [q, p];
```

### Object Destructuring

```javascript
// Basic object destructuring
const { name, age } = { name: "Bob", age: 30 };

// Renaming variables
const { name: userName, age: userAge } = { name: "Bob", age: 30 };

// Default values
const { x = 10, y = 20 } = { x: 5 };

// Nested destructuring
const { address: { city } } = { address: { city: "NYC" } };

// Rest pattern
const { a, b, ...rest } = { a: 1, b: 2, c: 3, d: 4 };
// rest: { c: 3, d: 4 }

// Function parameter destructuring
function greet({ name, age }) {
  return `${name} is ${age}`;
}
greet({ name: "Alice", age: 25 });
```

---

## Map

Map is a collection of keyed data items, similar to objects, but allows keys of any type.

### Basic Syntax

```javascript
// Creating a Map
const map = new Map();

// Setting values
map.set('name', 'Alice');
map.set(1, 'number key');
map.set(true, 'boolean key');

// Chaining set calls
map.set('a', 1).set('b', 2).set('c', 3);

// Getting values
map.get('name'); // 'Alice'

// Checking existence
map.has('name'); // true

// Deleting entries
map.delete('name');

// Getting size
map.size; // number of entries

// Clearing all entries
map.clear();

// Initializing with iterable
const map2 = new Map([
  ['key1', 'value1'],
  ['key2', 'value2']
]);

// Iterating over Map
for (const [key, value] of map2) {
  console.log(key, value);
}

// Keys, values, entries
map2.keys();    // Iterator of keys
map2.values();  // Iterator of values
map2.entries(); // Iterator of [key, value] pairs

// forEach
map2.forEach((value, key) => {
  console.log(key, value);
});
```

---

## Set

Set is a collection of unique values.

### Basic Syntax

```javascript
// Creating a Set
const set = new Set();

// Adding values
set.add(1);
set.add(2);
set.add(2); // Duplicate, won't be added

// Chaining add calls
set.add(3).add(4).add(5);

// Checking existence
set.has(1); // true

// Deleting values
set.delete(1);

// Getting size
set.size; // number of unique values

// Clearing all values
set.clear();

// Initializing with iterable
const set2 = new Set([1, 2, 3, 3, 4]);
// set2 contains: 1, 2, 3, 4

// Array deduplication
const numbers = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(numbers)]; // [1, 2, 3, 4]

// Iterating over Set
for (const value of set2) {
  console.log(value);
}

// forEach
set2.forEach(value => {
  console.log(value);
});

// Converting to array
const arr = Array.from(set2);
const arr2 = [...set2];
```

---

## Classes

ES6 classes provide a cleaner syntax for creating objects and implementing inheritance.

### Basic Class Syntax

```javascript
// Class declaration
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    return `Hello, I'm ${this.name}`;
  }
  
  // Getter
  get info() {
    return `${this.name}, ${this.age}`;
  }
  
  // Setter
  set birthday(year) {
    this.age = new Date().getFullYear() - year;
  }
}

// Creating instance
const person = new Person('Alice', 25);
person.greet();

// Using getter
person.info;

// Using setter
person.birthday = 1995;
```

### Class Expression

```javascript
// Anonymous class expression
const Rectangle = class {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  
  area() {
    return this.width * this.height;
  }
};

// Named class expression
const Square = class SquareClass {
  constructor(side) {
    this.side = side;
  }
};
```

---

## OOP in ES6

### Inheritance

```javascript
// Parent class
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    return `${this.name} makes a sound`;
  }
}

// Child class
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Call parent constructor
    this.breed = breed;
  }
  
  // Override parent method
  speak() {
    return `${this.name} barks`;
  }
  
  // Call parent method
  parentSpeak() {
    return super.speak();
  }
}

const dog = new Dog('Max', 'Labrador');
dog.speak(); // 'Max barks'
dog.parentSpeak(); // 'Max makes a sound'
```

### Encapsulation with Private Fields

```javascript
class BankAccount {
  #balance = 0; // Private field (ES2022, but commonly supported)
  
  constructor(initialBalance) {
    this.#balance = initialBalance;
  }
  
  deposit(amount) {
    this.#balance += amount;
  }
  
  getBalance() {
    return this.#balance;
  }
  
  #privateMethod() {
    // Private method
    return 'This is private';
  }
}

const account = new BankAccount(100);
account.deposit(50);
account.getBalance(); // 150
// account.#balance; // SyntaxError: Private field
```

### Polymorphism

```javascript
class Shape {
  area() {
    return 0;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
  
  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  
  area() {
    return this.width * this.height;
  }
}

// Polymorphic usage
const shapes = [
  new Circle(5),
  new Rectangle(4, 6)
];

shapes.forEach(shape => {
  console.log(shape.area());
});
```

### Static Properties and Methods

```javascript
class MathUtil {
  static PI = 3.14159;
  
  static add(a, b) {
    return a + b;
  }
  
  static multiply(a, b) {
    return a * b;
  }
}

// Access without instantiation
MathUtil.add(5, 3); // 8
MathUtil.PI; // 3.14159
```

---

## Summary

ES6 introduced modern JavaScript features that improve code readability, maintainability, and expressiveness:

- **Arrow Functions**: Concise syntax with lexical `this` binding
- **Template Strings**: String interpolation and multi-line strings
- **Spread Operator**: Expand arrays and objects
- **Destructuring**: Unpack values from arrays and objects
- **Map**: Key-value pairs with any key type
- **Set**: Collections of unique values
- **Classes**: Cleaner OOP syntax with inheritance support
