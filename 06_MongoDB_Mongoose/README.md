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

- **Database**: A logical container for collections, similar to a database in PostgreSQL/MySQL. You can have multiple databases (for example app_dev, app_test, analytics) on the same MongoDB server.
- **Collection**: A collection is a group of documents, roughly equivalent to a table in SQL. Collections are schemaless by default: documents in the same collection do not need to share the same fields or structure.
- **Document**: A document is the basic unit of data stored in a collection, similar to a row in SQL, but represented as a BSON object. A document is a set of key–value pairs and can contain nested objects and arrays.

![BSON](./public/BSON.png)

## Data modeling and relationships in MongoDB

In MongoDB you design your model around how the application reads and writes data, not only around normalization rules. That often means grouping related data together in a single document to reduce "joins". Instead of foreign keys and JOINs, there are two main strategies to represent relationships between entities:

![Relations](./public/relations.png)

## The Challenge

Because MongoDB doesn’t enforce relationships between collections, there’s nothing built-in to guarantee data consistency across them. For example:

- A `id` in a `customers` collection might not actually exist in the `books` collection.
- There are no automatic checks, constraints, or warnings if data goes out of sync.
- Joining related data requires manual `$lookup` queries - and those can get complex, especially as your data grows.

This flexibility is part of what makes MongoDB powerful - but without structure, it can also become a hidden risk. You lose some of the clarity and safety that comes from defined relationships in relational databases.

## Comparison with SQL Databases

![SQL vs NoSQL](./public/sql-nosql.png)

![Scaling](./public/scaling.png)

## Indexes and performance in MongoDB

Indexes in MongoDB are special data structures that store a small portion of the collection’s data in a way that makes queries faster, similar to indexes in SQL. They allow the database to avoid scanning every document and instead jump directly to matching entries based on the index keys. Important points:

- `_id` is automatically indexed and unique for every document.
- You can create **single-field indexes**, **compound indexes** (on multiple fields), **unique indexes** (no duplicates), **text indexes** (for search), and **geospatial indexes**.
- Indexes speed up read-heavy operations but add overhead for writes (insert/update/delete must also update the index).

## Mongoose overview (ODM)

**Mongoose** is an Object Data Modeling (ODM) library for Node.js that provides a structured, schema-based way to interact with MongoDB documents. It sits between your application and MongoDB, offering schemas, models, validation, and middleware similar to what Prisma does for SQL databases

### Install Mongoose

```plain
npm install mongoose
npm install -D @types/mongoose
```

### Overview of Mongoose Schema

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
  images: [String],
  address: String,
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // createdAt, updatedAt
});
```

> Notes: By default, Mongoose adds an `_id` property to the schema, you can overrid it by your own `_id` field.

**SchemaTypes (Data Types)**

- SchemaTypes describe what **kind of data** a field stores. Mongoose provides a set of built-in types that map to MongoDB’s BSON types. Common SchemaTypes include `String`, `Number`, `Boolean`, `Date`, `Array`, `Map`, `Buffer`, `UUID`, `Decimal128`, `Mixed` and `Schema.Types.ObjectId`. The ObjectId type is especially important because it is used to reference documents in other collections.

- For example, a string field can be defined as `name: String`, a numeric field as `rating: Number`, a reference as `city: Schema.Types.ObjectId`, and an array of strings as `images: [String]`.

**Field Options and Validators**

- In addition to the data type, each field can define options and validators that control **how data is stored, validated and queried**. These options are not data types themselves; they describe rules and behavior applied to the field.

- Validation options such as `required`, `min`, `max`, `minlength`, `maxlength`, `enum`, `match` and custom validate functions are used to ensure data correctness. Default and transform options like `default`, `trim`, `lowercase`, and `uppercase` help normalize data before it is saved.

- Query-related options such as `select`, `index`, `unique`, and `sparse` affect how fields behave when querying or indexing data. Relationship options like `ref` define how documents are linked and populated across collections.

**Schema Options**

- Schema options **apply to the entire schema** rather than individual fields. A commonly used option is `timestamps`, which automatically adds `createdAt` and `updatedAt` fields to each document.

- Other schema-level options include `versionKey` to control the internal versioning field, `toJSON` and `toObject` transforms to customize how documents are serialized, and `index` definitions to optimize queries.

### Mongoose Models 

**[Models](https://mongoosejs.com/docs/models.html)** are fancy constructors compiled from Schema definitions. An instance of a model is called a document. Models are responsible for creating and reading documents from the underlying MongoDB database.

**Compling model**: when we call `model()` function, Mongoose compiles the schema into a model. The first argument is the name of the model, and the second argument is the schema.

```typescript
import { model } from "mongoose";

const User = model("User", userSchema);
const City = model("City", citySchema);
```

**Constructing Documents**:

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

### Queries

Mongoose models provide several static helper functions for CRUD operations. Each of these functions returns a mongoose Query object. **[Mongoose queries](https://mongoosejs.com/docs/queries.html)** can be executed by using `await`, or by using `then()` to handle the promise returned by the query.

#### Find Methods

**`Model.find()`** - Finds all documents matching the filter. Supports pagination. Returns all documents if no filter is provided.

```typescript
import { findUsers } from "./services/find.service";

// Find all users
const allUsers = await findUsers();

// Find users with filter
const users = await findUsers({ email: "john@example.com" });

// Find users with pagination
const paginatedUsers = await findUsers(
  { username: "John" },
  { 
    page: 1, 
    limit: 10, 
    sort: { createdAt: -1 } 
  }
);
```

**`Model.findById()`** - Finds a document by ID. Faster than `findOne({ _id })` because MongoDB optimizes queries on `_id`.

```typescript
import { findUserById } from "./services/find.service";

const user = await findUserById("507f1f77bcf86cd799439011");
```

**`Model.findOne()`** - Finds the first document matching the filter. Useful when you know only one document matches (e.g., finding by unique email).

```typescript
import { findOneUser } from "./services/find.service";

const user = await findOneUser({ email: "john@example.com" });
const user = await findOneUser({ username: "John Doe" });
```

#### Update Methods

**`Model.updateMany()`** - Updates multiple documents matching the filter. Returns information about how many documents were updated.

```typescript
import { updateManyUsers } from "./services/update.service";

const result = await updateManyUsers(
  { email: "test@example.com" },
  { avatar: "default-avatar.png" }
);
```

**`Model.updateOne()`** - Updates the first document matching the filter. Only updates the first document found.

```typescript
import { updateOneUser } from "./services/update.service";

const result = await updateOneUser(
  { email: "john@example.com" },
  { username: "Updated Username" }
);
```

**`Model.findByIdAndUpdate()`** - Finds a document by ID and updates it. Returns the old document by default, or the new document if `{ new: true }` option is used.

```typescript
import { findByIdAndUpdateUser } from "./services/update.service";

const updatedUser = await findByIdAndUpdateUser(
  userId,
  { username: "New Username" },
  { new: true, runValidators: true }
);

const oldUser = await findByIdAndUpdateUser(
  userId,
  { email: "newemail@example.com" }
);
```

**`Model.findOneAndUpdate()`** - Finds a document matching the filter and updates it. Similar to `findByIdAndUpdate` but uses typed filter conditions.

```typescript
import { findOneAndUpdateUser } from "./services/update.service";

const updatedUser = await findOneAndUpdateUser(
  { email: "john@example.com" },
  { username: "John Updated" },
  { new: true }
);
```

**`Model.findOneAndReplace()`** - Finds a document and replaces the entire document with a new one. Unlike `updateOne`, this method replaces the entire document instead of updating only specified fields.

```typescript
import { findOneAndReplaceUser } from "./services/update.service";

const replacedUser = await findOneAndReplaceUser(
  { email: "john@example.com" },
  { 
    username: "John Doe",
    email: "john@example.com",
    avatar: "new-avatar.png"
  },
  { new: true }
);
```

**`Model.replaceOne()`** - Replaces the first document matching the filter. Similar to `findOneAndReplace` but doesn't return the document, only the operation result.

```typescript
import { replaceOneUser } from "./services/update.service";

const result = await replaceOneUser(
  { email: "john@example.com" },
  { 
    username: "John Doe",
    email: "john@example.com",
    avatar: "new-avatar.png"
  }
);
```

#### Delete Methods

**`Model.deleteMany()`** - Deletes multiple documents matching the filter. Deletes ALL documents in the collection if no filter is provided (use with caution!).

```typescript
import { deleteManyUsers } from "./services/delete.service";

const result = await deleteManyUsers({ email: "test@example.com" });
const result = await deleteManyUsers();
```

**`Model.deleteOne()`** - Deletes the first document matching the filter. Only deletes the first document found.

```typescript
import { deleteOneUser } from "./services/delete.service";

const result = await deleteOneUser({ email: "john@example.com" });
```

**`Model.findByIdAndDelete()`** - Finds a document by ID and deletes it. Returns the deleted document or null if not found.

```typescript
import { findByIdAndDeleteUser } from "./services/delete.service";

const deletedUser = await findByIdAndDeleteUser(userId);
```

**`Model.findByIdAndRemove()`** - Similar to `findByIdAndDelete`. This method is deprecated, use `findByIdAndDelete` instead.

```typescript
import { findByIdAndRemoveUser } from "./services/delete.service";

const removedUser = await findByIdAndRemoveUser(userId);
```

**`Model.findOneAndDelete()`** - Finds a document matching the filter and deletes it. Returns the deleted document or null.

```typescript
import { findOneAndDeleteUser } from "./services/delete.service";

const deletedUser = await findOneAndDeleteUser({ email: "john@example.com" });
```

### Populate

- MongoDB has the join-like `$lookup` aggregation operator in versions >= 3.2. Mongoose has a more powerful alternative called `populate()`, which lets you reference documents in other collections.

- **[Population](https://mongoosejs.com/docs/populate.html)** is the process of automatically replacing the specified paths in the document with document(s) from other collection(s). We may populate a single document, multiple documents, a plain object, multiple plain objects, or all objects returned from a query.

### Middleware (hooks) and Validation

- **[Middleware](https://mongoosejs.com/docs/middleware.html)** (also called pre and post hooks) are functions which are passed control during execution of asynchronous functions. Middleware is specified on the schema level and is useful for writing plugins.

- Mongoose provides built-in validation based on the schema definition and allows custom validators. **[Validation](https://mongoosejs.com/docs/validation.html)** ensures that only documents that satisfy your constraints are persisted, similar to constraints in SQL but implemented in application logic.
