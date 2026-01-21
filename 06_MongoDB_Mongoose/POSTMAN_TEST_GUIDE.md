# Postman API Testing Guide

## Setup

1. Base URL: `http://localhost:3000` (hoặc port bạn đã config)
2. Content-Type: `application/json`

---

## 0. User APIs

### 0.1 POST /users - Create User

**Request:**
```http
POST http://localhost:3000/users
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com"
}
```

**Response (201):**
```json
{
  "data": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**More Users:**
```json
{
  "username": "jane_smith",
  "email": "jane@example.com"
}
```

```json
{
  "username": "bob_wilson",
  "email": "bob@example.com"
}
```

---

### 0.2 GET /users - Get All Users (with pagination & filter)

**Request:**
```http
GET http://localhost:3000/users?page=1&limit=10&sort={"createdAt":-1}
```

**Request với filter by username:**
```http
GET http://localhost:3000/users?username=john_doe&page=1&limit=10
```

**Request với filter by email:**
```http
GET http://localhost:3000/users?email=john@example.com&page=1&limit=10
```

**Response (200):**
```json
{
  "data": [
    {
      "_id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 3,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 0.3 GET /users/:id - Get User By ID

**Request:**
```http
GET http://localhost:3000/users/{userId}
```

**Response (200):**
```json
{
  "data": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 0.4 PATCH /users/:id - Update User

**Request:**
```http
PATCH http://localhost:3000/users/{userId}
Content-Type: application/json

{
  "username": "john_doe_updated"
}
```

**Hoặc:**
```json
{
  "email": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "data": {
    "_id": "...",
    "username": "john_doe_updated",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 0.5 DELETE /users/:id - Soft Delete User

**Request:**
```http
DELETE http://localhost:3000/users/{userId}
```

**Response (200):**
```json
{
  "message": "User deleted successfully",
  "data": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "isActive": false,
    ...
  }
}
```

**LƯU Ý:** Khi xóa user, tất cả reviews của user đó sẽ tự động bị xóa (hard delete) bởi middleware.

---

## Test Data

### Users (cần tạo trước để test Review APIs)

```json
{
  "username": "john_doe",
  "email": "john@example.com"
}
```

```json
{
  "username": "jane_smith",
  "email": "jane@example.com"
}
```

---

## 1. City APIs

### 1.1 POST /cities - Create City

**Request:**
```http
POST http://localhost:3000/cities
Content-Type: application/json

{
  "name": "Paris",
  "country": "France",
  "description": "The City of Light, known for its art, fashion, and culture"
}
```

**Response (201):**
```json
{
  "data": {
    "_id": "...",
    "name": "Paris",
    "country": "France",
    "description": "The City of Light, known for its art, fashion, and culture",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**More Cities:**
```json
{
  "name": "Tokyo",
  "country": "Japan",
  "description": "Capital of Japan, a mix of traditional and modern culture"
}
```

```json
{
  "name": "New York",
  "country": "USA",
  "description": "The Big Apple, a global center of commerce and culture"
}
```

```json
{
  "name": "London",
  "country": "UK",
  "description": "Capital of England, rich in history and culture"
}
```

---

### 1.2 GET /cities - Get All Cities (with pagination & filter)

**Request:**
```http
GET http://localhost:3000/cities?page=1&limit=10&sort={"createdAt":-1}
```

**Request với filter by country:**
```http
GET http://localhost:3000/cities?country=France&page=1&limit=10
```

**Response (200):**
```json
{
  "data": [
    {
      "_id": "...",
      "name": "Paris",
      "country": "France",
      "description": "...",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 4,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 1.3 GET /cities/:id - Get City By ID

**Request:**
```http
GET http://localhost:3000/cities/{cityId}
```

**Response (200):**
```json
{
  "data": {
    "_id": "...",
    "name": "Paris",
    "country": "France",
    "description": "...",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 1.4 PATCH /cities/:id - Update City

**Request:**
```http
PATCH http://localhost:3000/cities/{cityId}
Content-Type: application/json

{
  "description": "Updated description for Paris"
}
```

**Response (200):**
```json
{
  "data": {
    "_id": "...",
    "name": "Paris",
    "country": "France",
    "description": "Updated description for Paris",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 1.5 DELETE /cities/:id - Soft Delete City

**Request:**
```http
DELETE http://localhost:3000/cities/{cityId}
```

**Response (200):**
```json
{
  "message": "City deleted successfully",
  "data": {
    "_id": "...",
    "name": "Paris",
    "country": "France",
    "isActive": false,
    ...
  }
}
```

---

## 2. Place APIs

### 2.1 POST /places - Create Place

**Request:**
```http
POST http://localhost:3000/places
Content-Type: application/json

{
  "name": "Eiffel Tower",
  "city": "{cityId}", // Use Paris cityId from step 1.1
  "description": "Iconic iron lattice tower located on the Champ de Mars",
  "category": "attraction",
  "address": "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France"
}
```

**More Places:**
```json
{
  "name": "Louvre Museum",
  "city": "{parisCityId}",
  "description": "World's largest art museum and historic monument",
  "category": "museum",
  "address": "Rue de Rivoli, 75001 Paris, France"
}
```

```json
{
  "name": "Le Jules Verne",
  "city": "{parisCityId}",
  "description": "Fine dining restaurant in the Eiffel Tower",
  "category": "restaurant",
  "address": "Eiffel Tower, 75007 Paris, France"
}
```

```json
{
  "name": "Shibuya Crossing",
  "city": "{tokyoCityId}",
  "description": "World's busiest pedestrian crossing",
  "category": "attraction",
  "address": "Shibuya City, Tokyo, Japan"
}
```

```json
{
  "name": "The Plaza Hotel",
  "city": "{newYorkCityId}",
  "description": "Luxury hotel in Manhattan",
  "category": "hotel",
  "address": "768 5th Ave, New York, NY 10019, USA"
}
```

**Response (201):**
```json
{
  "data": {
    "_id": "...",
    "name": "Eiffel Tower",
    "city": "{cityId}",
    "description": "...",
    "category": "attraction",
    "address": "...",
    "averageRating": 0,
    "reviewCount": 0,
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 2.2 GET /places - Get All Places (with filters, pagination & sort)

**Request:**
```http
GET http://localhost:3000/places?page=1&limit=10&sort={"averageRating":-1}
```

**Request với filter by city:**
```http
GET http://localhost:3000/places?city={parisCityId}&page=1&limit=10
```

**Request với filter by category:**
```http
GET http://localhost:3000/places?category=restaurant&page=1&limit=10
```

**Request với cả city và category:**
```http
GET http://localhost:3000/places?city={parisCityId}&category=museum&page=1&limit=10&sort={"createdAt":-1}
```

**Response (200):**
```json
{
  "data": [
    {
      "_id": "...",
      "name": "Eiffel Tower",
      "city": "{cityId}",
      "category": "attraction",
      "averageRating": 4.5,
      "reviewCount": 10,
      "isDeleted": false,
      ...
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 2.3 GET /places/:id - Get Place By ID (with populated city)

**Request:**
```http
GET http://localhost:3000/places/{placeId}
```

**Response (200):**
```json
{
  "data": {
    "_id": "...",
    "name": "Eiffel Tower",
    "city": {
      "_id": "...",
      "name": "Paris",
      "country": "France",
      "description": "..."
    },
    "description": "...",
    "category": "attraction",
    "address": "...",
    "averageRating": 4.5,
    "reviewCount": 10,
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 2.4 PATCH /places/:id - Update Place

**Request:**
```http
PATCH http://localhost:3000/places/{placeId}
Content-Type: application/json

{
  "description": "Updated description",
  "category": "attraction"
}
```

**Response (200):**
```json
{
  "data": {
    "_id": "...",
    "name": "Eiffel Tower",
    "description": "Updated description",
    "category": "attraction",
    ...
  }
}
```

---

### 2.5 DELETE /places/:id - Soft Delete Place

**Request:**
```http
DELETE http://localhost:3000/places/{placeId}
```

**Response (200):**
```json
{
  "message": "Place deleted successfully",
  "data": {
    "_id": "...",
    "name": "Eiffel Tower",
    "isDeleted": true,
    ...
  }
}
```

---

## 3. Review APIs

**LƯU Ý:** Cần tạo User trước khi tạo Review. Bạn có thể tạo User thông qua User model trực tiếp hoặc qua API nếu có.

### 3.1 POST /places/:placeId/reviews - Create Review

**Request:**
```http
POST http://localhost:3000/places/{placeId}/reviews
Content-Type: application/json

{
  "user": "{userId}", // Use userId from User model
  "rating": 5,
  "content": "Absolutely amazing! The view from the top is breathtaking. A must-visit when in Paris!"
}
```

**More Reviews:**
```json
{
  "user": "{userId}",
  "rating": 4,
  "content": "Great experience but very crowded. Would recommend going early in the morning to avoid long queues."
}
```

```json
{
  "user": "{userId}",
  "rating": 5,
  "content": "The architecture is stunning! The museum has an incredible collection. Spent the whole day here and still didn't see everything."
}
```

```json
{
  "user": "{userId}",
  "rating": 3,
  "content": "Food was good but service was slow. The location is unique though, dining in the Eiffel Tower is quite an experience."
}
```

```json
{
  "user": "{userId}",
  "rating": 5,
  "content": "Perfect location! The hotel is beautiful and the staff is very professional. Highly recommend for a luxury stay."
}
```

**Response (201):**
```json
{
  "data": {
    "_id": "...",
    "user": "{userId}",
    "place": "{placeId}",
    "rating": 5,
    "content": "Absolutely amazing!...",
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Test Error Cases:**
- Try to review a deleted place (should fail):
```http
POST http://localhost:3000/places/{deletedPlaceId}/reviews
Content-Type: application/json

{
  "user": "{userId}",
  "rating": 5,
  "content": "This should fail"
}
```

- Try with invalid rating (should fail):
```json
{
  "user": "{userId}",
  "rating": 6, // Invalid: must be 1-5
  "content": "This should fail validation"
}
```

- Try with content too short (should fail):
```json
{
  "user": "{userId}",
  "rating": 5,
  "content": "Short" // Invalid: minlength is 10
}
```

---

### 3.2 GET /places/:placeId/reviews - Get Reviews by Place

**Request:**
```http
GET http://localhost:3000/places/{placeId}/reviews
```

**Response (200):**
```json
{
  "data": [
    {
      "_id": "...",
      "user": {
        "_id": "...",
        "username": "john_doe",
        "email": "john@example.com"
      },
      "place": "{placeId}",
      "rating": 5,
      "content": "Absolutely amazing!...",
      "isDeleted": false,
      "createdAt": "...",
      "updatedAt": "..."
    },
    {
      "_id": "...",
      "user": {
        "_id": "...",
        "username": "jane_smith",
        "email": "jane@example.com"
      },
      "place": "{placeId}",
      "rating": 4,
      "content": "Great experience...",
      "isDeleted": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Test Error Cases:**
- Try to get reviews for deleted place (should fail):
```http
GET http://localhost:3000/places/{deletedPlaceId}/reviews
```

---

### 3.3 DELETE /reviews/:id - Delete Review

**Request:**
```http
DELETE http://localhost:3000/reviews/{reviewId}
```

**Response (200):**
```json
{
  "message": "Review deleted successfully",
  "data": {
    "_id": "...",
    "user": "{userId}",
    "place": "{placeId}",
    "rating": 5,
    "content": "...",
    "isDeleted": false,
    ...
  }
}
```

**LƯU Ý:** Sau khi xóa review, place's `averageRating` và `reviewCount` sẽ tự động được cập nhật bởi middleware.

---

## 4. Testing Flow (Recommended Order)

### Step 1: Create Users
1. POST /users - Tạo User 1 (john_doe)
2. POST /users - Tạo User 2 (jane_smith)
3. POST /users - Tạo User 3 (bob_wilson)
4. Lưu các `userId` để dùng sau
5. GET /users - Verify users đã được tạo

### Step 2: Create Cities
1. POST /cities - Tạo Paris
2. POST /cities - Tạo Tokyo
3. POST /cities - Tạo New York
4. POST /cities - Tạo London
5. Lưu các `cityId` để dùng sau

### Step 3: Create Places
1. POST /places - Tạo Eiffel Tower (city: Paris)
2. POST /places - Tạo Louvre Museum (city: Paris)
3. POST /places - Tạo Le Jules Verne (city: Paris)
4. POST /places - Tạo Shibuya Crossing (city: Tokyo)
5. POST /places - Tạo The Plaza Hotel (city: New York)
6. Lưu các `placeId` để dùng sau

### Step 4: Test City APIs
1. GET /cities - Lấy tất cả cities
2. GET /cities?country=France - Filter by country
3. GET /cities/:id - Lấy city by ID
4. PATCH /cities/:id - Update city
5. GET /cities/:id - Verify update

### Step 5: Test Place APIs
1. GET /places - Lấy tất cả places
2. GET /places?city={parisCityId} - Filter by city
3. GET /places?category=restaurant - Filter by category
4. GET /places/:id - Lấy place by ID (verify city populated)
5. PATCH /places/:id - Update place
6. GET /places/:id - Verify update

### Step 6: Create Reviews
1. POST /places/{eiffelTowerId}/reviews - Tạo review 1 (rating: 5)
2. POST /places/{eiffelTowerId}/reviews - Tạo review 2 (rating: 4)
3. POST /places/{louvreId}/reviews - Tạo review 3 (rating: 5)
4. POST /places/{restaurantId}/reviews - Tạo review 4 (rating: 3)

### Step 7: Verify Rating Updates
1. GET /places/{eiffelTowerId} - Verify averageRating = 4.5, reviewCount = 2
2. GET /places/{louvreId} - Verify averageRating = 5, reviewCount = 1

### Step 8: Test Review APIs
1. GET /places/{placeId}/reviews - Lấy reviews của một place
2. Verify user được populate đúng

### Step 9: Test Delete Review
1. DELETE /reviews/{reviewId} - Xóa một review
2. GET /places/{placeId} - Verify averageRating và reviewCount đã được update lại

### Step 10: Test Soft Delete
1. DELETE /places/{placeId} - Soft delete một place
2. GET /places - Verify place không còn trong list
3. POST /places/{deletedPlaceId}/reviews - Should fail (place deleted)
4. DELETE /cities/{cityId} - Soft delete một city
5. GET /cities - Verify city không còn trong list
6. DELETE /users/{userId} - Soft delete một user
7. GET /users - Verify user không còn trong list
8. GET /places/{placeId}/reviews - Verify reviews của user đã bị xóa (hard delete)

---

## 5. Postman Collection Variables

Để dễ test, bạn có thể tạo các variables trong Postman:

- `baseUrl`: `http://localhost:3000`
- `johnUserId`: (sau khi tạo User john_doe)
- `janeUserId`: (sau khi tạo User jane_smith)
- `bobUserId`: (sau khi tạo User bob_wilson)
- `parisCityId`: (sau khi tạo Paris)
- `tokyoCityId`: (sau khi tạo Tokyo)
- `newYorkCityId`: (sau khi tạo New York)
- `eiffelTowerPlaceId`: (sau khi tạo Eiffel Tower)
- `louvrePlaceId`: (sau khi tạo Louvre)

Sau đó dùng trong requests như: `{{baseUrl}}/cities/{{parisCityId}}`

---

## 6. Error Responses

### 400 Bad Request
```json
{
  "error": "Name and country are required"
}
```

### 404 Not Found
```json
{
  "error": "City not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## 7. Quick Test Script

Bạn có thể tạo một script để test nhanh:

```bash
# 1. Create Cities
curl -X POST http://localhost:3000/cities \
  -H "Content-Type: application/json" \
  -d '{"name":"Paris","country":"France","description":"City of Light"}'

# 2. Get Cities
curl http://localhost:3000/cities?page=1&limit=10

# 3. Create Place (replace {cityId} với actual ID)
curl -X POST http://localhost:3000/places \
  -H "Content-Type: application/json" \
  -d '{"name":"Eiffel Tower","city":"{cityId}","category":"attraction","description":"Iconic tower"}'

# 4. Create Review (replace {placeId} và {userId} với actual IDs)
curl -X POST http://localhost:3000/places/{placeId}/reviews \
  -H "Content-Type: application/json" \
  -d '{"user":"{userId}","rating":5,"content":"Amazing place! Must visit!"}'
```
