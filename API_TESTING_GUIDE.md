# API Testing Guide - TaskMaster

This guide provides step-by-step instructions for testing the TaskMaster API endpoints.

## Prerequisites

- Running TaskMaster backend (http://localhost:5000)
- Postman, cURL, Thunder Client, or similar API testing tool
- MongoDB running and connected

---

## Test Scenarios

### 1. Authentication Flow

#### Step 1: Register a New User
**POST** `http://localhost:5000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "password123",
  "firstName": "Alice",
  "lastName": "Johnson"
}
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "alice",
    "email": "alice@example.com"
  }
}
```

**Save the token for next requests!**

#### Step 2: Register Another User
Repeat with different credentials:
```json
{
  "username": "bob",
  "email": "bob@example.com",
  "password": "password123",
  "firstName": "Bob",
  "lastName": "Smith"
}
```

#### Step 3: Login
**POST** `http://localhost:5000/api/auth/login`

**Body:**
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

#### Step 4: Get Current User
**GET** `http://localhost:5000/api/auth/me`

**Headers:**
```
Authorization: Bearer <your_token_from_register_or_login>
```

#### Step 5: Update Profile
**PUT** `http://localhost:5000/api/auth/profile`

**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "bio": "Product Manager at TaskMaster"
}
```

#### Step 6: Change Password
**POST** `http://localhost:5000/api/auth/change-password`

**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

---

### 2. Team Management

#### Step 1: Create a Team (as Alice)
**POST** `http://localhost:5000/api/teams`

**Headers:**
```
Authorization: Bearer <alice_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Development Team",
  "description": "Frontend and backend development"
}
```

**Expected Response (201):** Returns team object with ID. Save the team ID!

#### Step 2: Get All Teams (as Alice)
**GET** `http://localhost:5000/api/teams`

**Headers:**
```
Authorization: Bearer <alice_token>
```

#### Step 3: Get Team by ID
**GET** `http://localhost:5000/api/teams/<team_id>`

**Headers:**
```
Authorization: Bearer <alice_token>
```

#### Step 4: Add Bob to the Team (as Alice)
**POST** `http://localhost:5000/api/teams/<team_id>/members`

**Headers:**
```
Authorization: Bearer <alice_token>
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "<bob_user_id>",
  "role": "member"
}
```

#### Step 5: Update Member Role
**PATCH** `http://localhost:5000/api/teams/<team_id>/members`

**Headers:**
```
Authorization: Bearer <alice_token>
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "<bob_user_id>",
  "role": "admin"
}
```

#### Step 6: Update Team (as Alice)
**PUT** `http://localhost:5000/api/teams/<team_id>`

**Headers:**
```
Authorization: Bearer <alice_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Updated Development Team",
  "description": "All development activities"
}
```

---

### 3. Task Management

#### Step 1: Create a Task (in the team)
**POST** `http://localhost:5000/api/tasks`

**Headers:**
```
Authorization: Bearer <alice_token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Design API Documentation",
  "description": "Create comprehensive API docs with examples",
  "dueDate": "2026-07-30T00:00:00Z",
  "priority": "high",
  "teamId": "<team_id>",
  "assignedTo": ["<bob_user_id>"],
  "tags": ["documentation", "api"],
  "project": "Documentation Sprint"
}
```

**Save the task ID!**

#### Step 2: Create Another Task
```json
{
  "title": "Setup CI/CD Pipeline",
  "description": "Configure GitHub Actions for automated testing",
  "dueDate": "2026-08-15T00:00:00Z",
  "priority": "urgent",
  "teamId": "<team_id>",
  "assignedTo": ["<alice_user_id>"],
  "tags": ["devops", "ci-cd"]
}
```

#### Step 3: Get All Tasks (with filtering)
**GET** `http://localhost:5000/api/tasks`

**Headers:**
```
Authorization: Bearer <alice_token>
```

**Variations:**
```
GET /api/tasks?status=open
GET /api/tasks?priority=high
GET /api/tasks?assignedTo=<bob_user_id>
GET /api/tasks?search=documentation
GET /api/tasks?teamId=<team_id>&sortBy=-dueDate
GET /api/tasks?page=1&limit=5
```

#### Step 4: Get Single Task
**GET** `http://localhost:5000/api/tasks/<task_id>`

**Headers:**
```
Authorization: Bearer <alice_token>
```

#### Step 5: Update Task Status (Bob completes it)
**PUT** `http://localhost:5000/api/tasks/<task_id>`

**Headers:**
```
Authorization: Bearer <bob_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "in-progress",
  "priority": "medium"
}
```

#### Step 6: Complete Task
**PATCH** `http://localhost:5000/api/tasks/<task_id>/complete`

**Headers:**
```
Authorization: Bearer <bob_token>
```

#### Step 7: Assign Task to Multiple Users
**POST** `http://localhost:5000/api/tasks/<task_id>/assign`

**Headers:**
```
Authorization: Bearer <alice_token>
Content-Type: application/json
```

**Body:**
```json
{
  "assignedTo": ["<alice_user_id>", "<bob_user_id>"]
}
```

#### Step 8: Delete Task
**DELETE** `http://localhost:5000/api/tasks/<task_id>`

**Headers:**
```
Authorization: Bearer <alice_token>
```

---

### 4. Comments & Collaboration

#### Step 1: Add Comment to Task (Bob comments)
**POST** `http://localhost:5000/api/comments`

**Headers:**
```
Authorization: Bearer <bob_token>
Content-Type: application/json
```

**Body:**
```json
{
  "content": "Started working on this. The API looks good but needs optimization in the database queries. @alice can you review?",
  "taskId": "<task_id>",
  "mentions": ["<alice_user_id>"]
}
```

**Save the comment ID!**

#### Step 2: Get Comments for Task
**GET** `http://localhost:5000/api/comments/task/<task_id>`

**Headers:**
```
Authorization: Bearer <alice_token>
```

**With pagination:**
```
GET /api/comments/task/<task_id>?page=1&limit=10
```

#### Step 3: Update Comment (Bob edits)
**PUT** `http://localhost:5000/api/comments/<comment_id>`

**Headers:**
```
Authorization: Bearer <bob_token>
Content-Type: application/json
```

**Body:**
```json
{
  "content": "Updated comment with more details about the optimization needed."
}
```

#### Step 4: Add Mentions to Comment
**POST** `http://localhost:5000/api/comments/<comment_id>/mentions`

**Headers:**
```
Authorization: Bearer <bob_token>
Content-Type: application/json
```

**Body:**
```json
{
  "mentions": ["<alice_user_id>"]
}
```

#### Step 5: Reply with Another Comment (Alice responds)
**POST** `http://localhost:5000/api/comments`

**Headers:**
```
Authorization: Bearer <alice_token>
Content-Type: application/json
```

**Body:**
```json
{
  "content": "Great progress @bob! I'll review the optimization suggestions. Let's schedule a sync call.",
  "taskId": "<task_id>",
  "mentions": ["<bob_user_id>"]
}
```

#### Step 6: Delete Comment
**DELETE** `http://localhost:5000/api/comments/<comment_id>`

**Headers:**
```
Authorization: Bearer <bob_token>
```

---

## Error Handling Tests

### Test Invalid Token
**GET** `http://localhost:5000/api/auth/me`

**Headers:**
```
Authorization: Bearer invalid_token_here
```

**Expected Response (401):**
```json
{
  "error": "Invalid or expired token."
}
```

### Test Missing Required Field
**POST** `http://localhost:5000/api/tasks`

**Body:**
```json
{
  "title": "Task without due date"
}
```

**Expected Response (400):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "value": "Task without due date",
      "msg": "Due date is required",
      "param": "dueDate",
      "location": "body"
    }
  ]
}
```

### Test Access Denial
Bob tries to delete Alice's task:

**DELETE** `http://localhost:5000/api/tasks/<alice_task_id>`

**Headers:**
```
Authorization: Bearer <bob_token>
```

**Expected Response (403):**
```json
{
  "error": "You do not have permission to delete this task"
}
```

---

## Complete Workflow Test

1. Register Alice → Get Alice token
2. Register Bob → Get Bob token
3. Alice creates a team
4. Alice adds Bob to team
5. Alice creates Task 1 and assigns to Bob
6. Alice creates Task 2 and assigns to Alice
7. Bob views all tasks
8. Bob comments on Task 1
9. Alice replies to comment
10. Bob marks Task 1 as complete
11. Verify task status is updated

---

## cURL Command Examples

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"pass123","firstName":"Alice","lastName":"Johnson"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"pass123"}'

# Get current user (replace TOKEN)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Create task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Desc","dueDate":"2026-12-31T00:00:00Z","priority":"high"}'

# Get all tasks
curl -X GET "http://localhost:5000/api/tasks?status=open&priority=high" \
  -H "Authorization: Bearer TOKEN"
```

---

## Testing Tips

1. **Always save IDs** - You'll need user IDs, team IDs, and task IDs for subsequent requests
2. **Use different users** - Test with multiple accounts to ensure permission checks work
3. **Test filtering** - Try different combinations of filters to verify correctness
4. **Check timestamps** - Verify `createdAt`, `updatedAt`, `completedAt` timestamps
5. **Verify relationships** - Check that comments appear on tasks and tasks appear on teams
6. **Test edge cases** - Try duplicate registrations, invalid dates, empty strings, etc.

---

Good luck testing! 🚀
