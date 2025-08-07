# API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
All protected endpoints require `Authorization: Bearer <token>` header.

## Endpoints

### Authentication

**POST /auth/register**
Register a new user

```json
{
  "email": "user@university.edu",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "age": 21,
  "major": "Computer Science",
  "year": "Junior",
  "location": "Main Campus"
}
```

**POST /auth/login**
Login user

```json
{
  "email": "user@university.edu",
  "password": "password123"
}
```

**POST /verify-email**
Verify email address

```json
{
  "token": "verification-token"
}
```

### User Management

**GET /user/profile** 🔒
Get current user profile

**PUT /user/profile** 🔒
Update user profile

**POST /user/upload-photo** 🔒
Upload profile photo (multipart/form-data)

**GET /user/potential-matches** 🔒
Get potential matches

**GET /user/smart-matches** 🔒
Get matches with compatibility scores

**POST /user/action** 🔒
Like or dislike a user

```json
{
  "targetUserId": "user-id",
  "action": "like" // or "dislike"
}
```

**GET /user/matches** 🔒
Get user's matches

### Messaging

**POST /messages** 🔒
Send a message

```json
{
  "receiverId": "user-id",
  "content": "Hello there!"
}
```

**GET /messages/:userId** 🔒
Get messages with specific user
