# Auth Service API Documentation

This service handles user authentication for the ft_transcendence project using JWT tokens.

## Base URL

```
http://localhost:3001/api/auth
```

## Endpoints

### 1. Register User

Creates a new user and automatically logs them in.

**Endpoint:** `POST /register`

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "firstname": "string",
  "password": "string"
}
```

**Success Response (200):**

```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "kmoraga",
    "firstname": "Kris",
    "email": "kris@example.com"
  }
}
```

**Error Responses:**

- `400`: Registration failed (email/username already exists)
- `500`: Internal server error

**Example:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kmoraga",
    "email": "kris@example.com",
    "firstname": "Kris",
    "password": "password123"
  }'
```

### 2. Login User

Authenticates a user and returns a JWT token.

**Endpoint:** `POST /login`

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "kmoraga",
    "firstname": "Kris",
    "email": "kris@example.com"
  }
}
```

**Error Responses:**

- `401`: Invalid credentials
- `500`: Login failed

**Example:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kris@example.com",
    "password": "password123"
  }'
```

### 3. Verify Token

Validates a JWT token and returns user information.

**Endpoint:** `GET /verify`

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "kmoraga",
    "firstname": "Kris",
    "email": "kris@example.com"
  }
}
```

**Error Responses:**

- `401`: Invalid or expired token
- `401`: No token provided

**Example:**

```bash
curl -X GET http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Logout User

Invalidates the current JWT token.

**Endpoint:** `POST /logout`

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "message": "Logout successful"
}
```

**Error Responses:**

- `401`: Invalid token

**Example:**

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Authentication Flow

1. **Registration/Login**: Client receives a JWT token
2. **Store Token**: Save the token in localStorage or sessionStorage
3. **Protected Requests**: Include token in Authorization header
4. **Token Validation**: Use `/verify` endpoint to check token validity
5. **Logout**: Call `/logout` to invalidate the token

## Token Information

- **Expiration**: 24 hours
- **Format**: JWT (JSON Web Token)
- **Header Format**: `Authorization: Bearer <token>`

## Integration with Other Services

This auth service communicates with the Users service to:

- Create new users during registration
- Validate user credentials during login
- Fetch updated user information for token verification

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials/token)
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a descriptive message:

```json
{
  "error": "Error description here"
}
```
