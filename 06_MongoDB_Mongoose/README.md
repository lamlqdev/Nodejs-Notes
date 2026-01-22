# NoSQL Fundamentals

## Overview of NoSQL and MongoDB

**NoSQL (Not Only SQL)** databases are designed to handle large volumes of unstructured and semi-structured data. Unlike traditional relational databases that rely on fixed schemas and tables, NoSQL offers flexible data models and supports horizontal scaling. Use of NoSQL:

- Big Data Applications: Efficiently stores and processes massive amounts of unstructured and semi-structured data.
- Real-Time Analytics: Supports fast queries and analysis for use cases like recommendation engines or fraud detection.
- Scalable Web Applications: Handles high traffic and large user bases by scaling horizontally across servers.
- Flexible Data Storage: Manages diverse data formats (JSON, key-value, documents, graphs) without rigid schemas.

**MongoDB** is a document-oriented NoSQL database that stores data as BSON documents (binary JSON), grouped into collections inside databases. It focuses on a flexible schema and JSON-like documents, which makes it a natural fit for JavaScript/TypeScript applications.

![MongoDB](./public/mongoDB.png)

## Databases, Collections, and Documents

MongoDB organizes data in three main levels: database → collection → document. This is similar to relational DBs but with different terminology and more flexible structure.

![Collections](./public/collections.png)

- **Database**: A logical container for collections, similar to a database in PostgreSQL/MySQL. You can have multiple databases (for example `app_dev`, `app_test`, `analytics`) on the same MongoDB server.
- **Collection**: A collection is a group of documents, roughly equivalent to a table in SQL. Collections are schemaless by default: documents in the same collection do not need to share the same fields or structure.
- **Document**: A document is the basic unit of data stored in a collection, similar to a row in SQL, but represented as a BSON object. A document is a set of key–value pairs and can contain nested objects and arrays.

![BSON](./public/BSON.png)

## Data modeling and relationships in MongoDB

In MongoDB you design your model around how the application reads and writes data, not only around normalization rules. That often means grouping related data together in a single document to reduce "joins". Instead of foreign keys and JOINs, there are two main strategies to represent relationships between entities:

![Relations](./public/relations.png)

## The Challenge

Because MongoDB doesn’t enforce relationships between collections, there’s nothing built-in to guarantee data consistency across them. For example:

- A `id` in a `customers` collection might not actually exist in the `books` collection.
- There are no automatic checks or warnings if data goes out of sync.
- Joining related data requires manual `$lookup` queries - and those can get complex, especially as your data grows.

This flexibility is part of what makes MongoDB powerful - but without structure, it can also become a hidden risk. You lose some of the clarity and safety that comes from defined relationships in relational databases.

## Comparison with SQL Databases

![SQL vs NoSQL](./public/sql-nosql.png)

![Scaling](./public/scaling.png)

## Indexes and performance in MongoDB

Indexes in MongoDB are special data structures that store a small portion of the collection’s data in a way that makes queries faster, similar to indexes in SQL. They allow the database to avoid scanning every document and instead jump directly to matching entries based on the index keys. Important points:

- `_id` is automatically indexed and unique for every document.
- You can create **single-field indexes**, **compound indexes** (on multiple fields), **unique indexes** (no duplicates), **text indexes** (for search), **geospatial indexes** (for location-based queries).
- Indexes speed up read-heavy operations but add overhead for writes (insert/update/delete must also update the index).

## Mongoose overview (ODM)

**Mongoose** is an Object Data Modeling (ODM) library for Node.js that provides a structured, schema-based way to interact with MongoDB documents. It sits between your application and MongoDB, offering schemas, models, validation, and middleware similar to what Prisma does for SQL databases

### 1. Install Mongoose

```plain
npm install mongoose
npm install -D @types/mongoose
```

### 2. Overview of Mongoose Schema

A Schema in Mongoose defines the **structure of documents** stored in a MongoDB collection. It describes which fields exist in a document, the data type of each field, validation rules and constraints, relationships between documents, and schema-level behavior such as timestamps or indexes.

```typescript
import { model, Schema } from "mongoose";

const placeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  city: {
    type: Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['restaurant', 'hotel', 'attraction', 'museum', 'park', 'other']
  },
  address: String,
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // createdAt, updatedAt
});
```

> Notes: By default, Mongoose adds an `_id` property to the schema, you can override it by your own `_id` field.

#### BaseSchema

BaseSchema is a foundational schema that contains common fields that can be reused by other schemas. This helps avoid code duplication and ensures consistency across schemas in your application.

**Creating BaseSchema**:

```typescript
import { Schema } from "mongoose";

// Define BaseSchema with common fields
const baseSchemaOptions = {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
};

const baseSchema = new Schema({
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, baseSchemaOptions);

// Add instance method for soft delete
baseSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Add static method to query non-deleted documents
baseSchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};
```

**Using BaseSchema with other schemas**:

```typescript
import { Schema } from "mongoose";

// Create new schema by combining with BaseSchema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, baseSchemaOptions);

// Add fields from BaseSchema to userSchema
userSchema.add(baseSchema.obj);

// Use methods from BaseSchema
const user = await User.findById(userId);
await user.softDelete(); // Use instance method from BaseSchema

const activeUsers = await User.findActive(); // Use static method from BaseSchema
```

#### SchemaTypes (Data Types)

- SchemaTypes describe what **kind of data** a field stores. Mongoose provides a set of built-in types that map to MongoDB’s BSON types. Common SchemaTypes include `String`, `Number`, `Boolean`, `Date`, `Array`, `Map`, `Buffer`, `UUID`, `Decimal128`, `Mixed` and `Schema.Types.ObjectId`. The ObjectId type is especially important because it is used to reference documents in other collections.

#### Field Options and Validators

- In addition to the data type, each field can define options and validators that control **how data is stored, validated** and **queried**. These options are not data types themselves; they describe rules and behavior applied to the field.

- Validation options such as `required`, `min`, `max`, `minlength`, `maxlength`, `enum`, `match` and custom validate functions are used to ensure data correctness. Default and transform options like `default`, `trim`, `lowercase`, and `uppercase` help normalize data before it is saved.

- Query-related options such as `select`, `index`, `unique`, and `sparse` affect how fields behave when querying or indexing data. Relationship options like `ref` define how documents are linked and populated across collections.

#### Schema Options

- Schema options **apply to the entire schema** rather than individual fields. A commonly used option is `timestamps`, which automatically adds `createdAt` and `updatedAt` fields to each document.

- Other schema-level options include `versionKey` to control the internal versioning field, `toJSON` and `toObject` transforms to customize how documents are serialized, and `index` definitions to optimize queries.

#### Schema Methods

Mongoose allows defining custom methods directly on the schema, which can be divided into **instance methods** and **static methods**. These methods help encapsulate logic that is closely related to the model itself.

- **Instance Methods**: are defined on `schema.methods` and are available on document instances. Inside an instance method, `this` refers to the current document. Instance methods are typically used for behavior that belongs to a single document and requires access to its fields.

  ```typescript
  // Definition schema method
  placeSchema.methods.isHighlyRated = function () {
    return this.averageRating >= 4;
  };

  // Usage
  const place = await Place.findById(placeId);
  if (place.isHighlyRated()) {
    console.log('This place is highly rated');
  }
  ```

- **Static Methods**: are defined on `schema.statics` and are available on the model itself, not on individual documents. Static methods are commonly used to encapsulate reusable query logic.

  ```typescript
  // Definition static method
  placeSchema.statics.findByCity = function (cityId: string) {
    return this.find({ city: cityId, isDeleted: false });
  };

  // Usage
  const places = await Place.findByCity(cityId);
  ```

> Note: Do not declare static methods as ES6 arrow functions, because `this` will not refer to the model itself, but to the global object.

### 3. Mongoose Models

**[Models](https://mongoosejs.com/docs/models.html)** are fancy constructors compiled from Schema definitions. Models are responsible for creating and reading documents from the underlying MongoDB database.

**Compiling model**: when we call `model()` function, Mongoose compiles the schema into a model. The first argument is the name of the model, and the second argument is the schema.

```typescript
import { model } from "mongoose";

const User = model("User", userSchema);
const City = model("City", citySchema);
```

**Constructing Documents**: An instance of a model is called a *document*. Creating them and saving to the database is easy.

```typescript
const user = new User({
  username: "John Doe",
  email: "john.doe@example.com",
});

await user.save();

// or

const user = await User.create({
  username: "John Doe",
  email: "john.doe@example.com",
});

// or, for multiple documents

const users = await User.insertMany([
  { username: "John Doe", email: "john.doe@example.com" },
  { username: "Jane Doe", email: "jane.doe@example.com" },
]);
```

### 4. Queries

Mongoose models provide several static helper functions for CRUD operations. Each of these functions returns a mongoose Query object. **[Mongoose queries](https://mongoosejs.com/docs/queries.html)** can be executed by using `await`, or by using `then()` to handle the promise returned by the query.

#### 4.1 Find Methods

Documents can be retrieved using a model's `find`, `findOne`, `findById` or `where` static functions.

- **`Model.find()`** - Finds all documents that match the filter (plain object). If no filter is provided, it returns all documents. Pagination can be implemented in two ways: **passing options** directly to `find(filter, projection, options)`, or using **chain methods (recommended)** such as `sort()`, `skip()`, and `limit()`.

- **`Model.findById()`** - Finds a document **by ID**, shortcut for `findOne({ _id: id })`.

- **`Model.findOne()`** - Finds one document **matching the filter**, useful when you know only one document matches (e.g., finding by unique email).

#### 4.2 Update Methods

Mongoose provides multiple update methods, in practice, you should generally prefer update methods that return the updated document.

- **`Model.updateMany()`** - Updates **multiple** documents matching the filter and returns update metadata (matched and modified counts).

- **`Model.updateOne()`** - Updates **one** document matching the filter and returns update metadata (matched and modified counts).

- **`Model.findByIdAndUpdate()`** - Finds a document **by ID** and updates it, returns the old document by default, or the new document if `{ new: true }` option is used. **(Recommended)**

- **`Model.findOneAndUpdate()`** - Finds a document **matching the filter** and updates it, similar to `findByIdAndUpdate` but uses typed filter conditions. **(Recommended)**

- **`Model.findOneAndReplace()`** - Finds a document and replaces **the entire document with a new one**, unspecified fields will be removed. It returns the old document by default, or the new document if `{ new: true }` option is used. **(Rarely used)**

- **`Model.replaceOne()`** - Replaces **one** document matching the filter, returns the update metadata (matched and modified counts). **(Rarely used)**

#### 4.3 Delete Methods

In real-world applications, hard delete is rarely used. Instead, most systems implement soft delete (for example, using a deletedAt field) to preserve data for recovery, auditing, and historical tracking. As a result, delete operations in APIs are typically implemented as update operations, while true delete methods are reserved for background jobs or maintenance tasks.

- **`Model.deleteMany()`** - Deletes **multiple** documents matching the filter. Deletes **ALL** documents in the collection if no filter is provided (use with caution!).

- **`Model.deleteOne()`** - Deletes **one** document matching the filter.

- **`Model.findByIdAndDelete()`** - Finds a document **by ID** and deletes it, returns the deleted document or null if not found. **(Recommended)**

- **`Model.findOneAndDelete()`** - Finds a document **matching the filter** and deletes it, returns the deleted document or null. **(Recommended)**

> Note: `Model.updateMany()`, `Model.updateOne()`, `Model.deleteMany()`, `Model.deleteOne()` are suitable for bulk updates, background jobs, or maintenance scripts.

### 5. Validation

Mongoose provides built-in validation based on the schema definition and allows custom validators. **[Validation](https://mongoosejs.com/docs/validation.html)** ensures that only documents that satisfy your constraints are persisted, similar to constraints in SQL but implemented in application logic.

#### 5.1 Built-in Validation

Mongoose has several built-in validators:

- All SchemaTypes have the built-in `required` validator.
- Number have `min` and `max` validators.
- String have `enum`, `minlength`, `maxlength` and `match` validators.

You can configure the error message for individual validators in the schema definition. There are two equivalent ways to set the validator error message:

- **Array syntax**: min: [min, "Error message"], max: [max, "Error message"]
- **Object syntax**: enum: { values: ["value1", "value2", ...], message: "Error message" }

> Note: The `unique` option is not a validator. It's a convenient helper for building MongoDB unique indexes.

#### 5.2 Custom Validation

Custom validators are used when validation logic goes beyond what built-in options provide. They allow defining custom functions to validate field values and are typically used for business-specific rules.

Custom validation is declared by passing a validation function to the `validate` option in the schema definition. This function receives the value and path of the field (`props.value` and `props.path`) and can access the document (by `this` keyword). The validation function should return a boolean indicating whether the value is valid.

```typescript
const userSchema = new Schema({
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, "Phone number is required"]
  },
  password: {
    type: String,
    required: true
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return value === this.password; // this refers to the document
      },
      message: 'Passwords do not match'
    }
  }
});
```

> Note: Custom validators can also be asynchronous by returning a Promise.

Mongoose distinguishes between document validation and update validation, and the key difference lies in the availability of document context.

- Document validation runs when creating or saving a document (`save()`, `create()`). In this case, the validator function has access to the full document via `this`, allowing validation logic to depend on other fields within the same document.

- Update validation runs during update operations (`updateOne()`, `updateMany()`, `findOneAndUpdate()`) when `{ runValidators: true }` is enabled. In this context, validators operate on the update values only and do not have access to the full document, meaning `this` is not available.

```typescript
const toySchema = new Schema({
  color: String,
  name: String
});

toySchema.path('color').validate(function(value) {
  // When running in `validate()` or `validateSync()`, the
  // validator can access the document using `this`.
  // When running with update validators, `this` is the Query,
  // **not** the document being updated!
  // Queries have a `get()` method that lets you get the updated value.
  if (this.get('name') && this.get('name').toLowerCase().indexOf('red') !== -1) {
    return value === 'red';
  }
  return true;
});

const Toy = db.model('ActionFigure', toySchema);

const toy = new Toy({ color: 'green', name: 'Red Power Ranger' });
// Validation failed: color: Validator failed for path `color` with value `green`
let error = toy.validateSync();
assert.ok(error.errors['color']);

const update = { color: 'green', name: 'Red Power Ranger' };
const opts = { runValidators: true };

error = null;
try {
  await Toy.updateOne({}, update, opts);
} catch (err) {
  error = err;
}
// Validation failed: color: Validator failed for path `color` with value `green`
assert.ok(error);
```

### 6. Middleware (hooks)

**[Middleware](https://mongoosejs.com/docs/middleware.html)**, also called hooks, are functions that run at specific stages of document or query lifecycle. They allow you to inject custom logic before or after certain operations.

**Types of Middleware**:

1. **Document Middleware**: Runs on document instances. Applied to operations like `save()`, `validate()`, `remove()`, `init()`.
2. **Query Middleware**: Runs on query operations like `find()`, `findOne()`, `updateOne()`, `deleteOne()`, etc.
3. **Aggregate Middleware**: Runs before or after aggregation pipelines execute.
4. **Model Middleware**: Runs on model-level operations like `insertMany()`.

> Note: In document middleware, `this` refers to the document. In query middleware, `this` refers to the query object, not the document. Always use regular functions instead of arrow functions to preserve `this` context.

**Pre and Post Hooks**:

- Pre-hooks run before the operation executes: Validate or transform data before saving, add computed fields, implement business logic checks, hash passwords, sanitize inputs, etc.
- Post-hooks run after the operation executes: Log changes, send notifications, update related documents, clean up temporary data, etc.

### 7. Populate

**[Population](https://mongoosejs.com/docs/populate.html)** is the process of automatically replacing specified paths in a document with documents from other collections. This is similar to JOIN operations in SQL databases, but implemented at the application level rather than the database level. Populate allows you to:

- **Replace ObjectId references with actual document data**: Instead of seeing just an ID like `"507f1f77bcf86cd799439011"`, you get the full referenced document with all its fields.
- **Work with related data more easily**: You can access nested properties without making multiple separate queries.
- **Maintain normalized data structure**: Store references (like foreign keys in SQL) while still being able to retrieve related data when needed.
- **Optimize queries for specific use cases**: Selectively populate only the fields you need, improving performance.

#### Saving References

To use populate, you first need to define references in your schemas using `Schema.Types.ObjectId` with the `ref` option. The `ref` option tells Mongoose which model to use when populating. When saving documents with references, you only store the `ObjectId` of the referenced document:

```typescript
// Create a city first
const city = await City.create({
  name: "Paris",
  country: "France",
  description: "The City of Light"
});

// Create a place that references the city - only store the ObjectId
const place = await Place.create({
  name: "Eiffel Tower",
  city: city._id,  // Store only the ObjectId reference
  description: "Famous iron lattice tower",
  address: "Champ de Mars, Paris"
});

// Without populate, place.city is just an ObjectId
console.log(place.city); // Output: 507f1f77bcf86cd799439011
```

#### Using Populate

Once you have references defined in your schema, you can use the `populate()` method on queries to replace the `ObjectId` references with the actual document data.

**Basic Population** - Replace a single reference field:

```typescript
import { Place } from "./models/place.model";

// Without populate - city is just an ObjectId
const place = await Place.findById(placeId);
console.log(place.city); // Output: 507f1f77bcf86cd799439011

// With populate - city is replaced with the full City document
const placeWithCity = await Place.findById(placeId).populate('city');
console.log(placeWithCity.city);
// Output: { _id: '507f...', name: 'Paris', country: 'France', description: '...' }
```

**Selecting Specific Fields** - Only populate certain fields to optimize performance:

```typescript
// Populate only name and country from City, exclude _id
const place = await Place.findById(placeId)
  .populate('city', 'name country -_id');

console.log(place.city); 
// Output: { name: 'Paris', country: 'France' }
```

**Multiple Populations** - Populate multiple reference fields:

```typescript
import { Review } from "./models/review.model";

// Populate both user and place references
const review = await Review.findById(reviewId)
  .populate('user')
  .populate('place');

console.log(review.user.username);  // Access user data
console.log(review.place.name);     // Access place data
```

#### What If There's no referenced document?

If a document's reference points to an `ObjectId` that no longer exists (or never existed), the populated field will be `null` instead of throwing an error.
