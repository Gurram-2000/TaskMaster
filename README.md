# TaskMaster Backend - Task Tracking & Team Collaboration System

A comprehensive Node.js/Express backend system for task tracking, management, and team collaboration. This application enables teams to create, assign, track tasks, and collaborate through comments and attachments.

## 🚀 Features

### User Authentication & Management
- ✅ Secure user registration and login with JWT
- ✅ Password hashing using bcryptjs
- ✅ User profile management
- ✅ Password change functionality
- ✅ Role-based access control (Admin, User)

### Task Management
- ✅ Create, read, update, and delete (CRUD) tasks
- ✅ Task status tracking (open, in-progress, completed, cancelled)
- ✅ Priority levels (low, medium, high, urgent)
- ✅ Task filtering by status, priority, assignee, team, and date
- ✅ Full-text search in task title and description
- ✅ Task assignment to multiple team members
- ✅ Pagination support for task lists
- ✅ Sorting by multiple fields

### Team & Project Collaboration
- ✅ Create and manage teams
- ✅ Add/remove team members
- ✅ Role-based team member permissions (admin, member, viewer)
- ✅ Team member management
- ✅ Project organization within teams

### Comments & Collaboration
- ✅ Add comments to tasks
- ✅ Edit and delete comments
- ✅ @mention team members in comments
- ✅ Comment pagination
- ✅ File attachment support
- ✅ Track edited comments with timestamps

### Data Models
- ✅ User model with authentication
- ✅ Task model with comprehensive attributes
- ✅ Team model with member management
- ✅ Comment model with mention support
- ✅ Attachment model for file uploads

## 📋 Prerequisites

- **Node.js** v14.0 or higher
- **npm** or **yarn**
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **Git** (for version control)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Gurram-2000/TaskMaster.git
cd TaskMaster
```

### 2. Install Dependencies

```bash
npm install
```

or if using yarn:

```bash
yarn install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and update the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/taskmaster
DATABASE_NAME=taskmaster

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
```

### 4. Ensure MongoDB is Running

**Local MongoDB:**
```bash
# On Windows, ensure MongoDB service is running
# Or start it with:
mongod
```

**Using MongoDB Atlas (Cloud):**
Replace `MONGODB_URI` with your Atlas connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskmaster?retryWrites=true&w=majority
```

### 5. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server should start on `http://localhost:5000`

Expected output:
```
✅ MongoDB connected successfully
✅ TaskMaster Backend running on port 5000
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

Most endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Auth Endpoints

### Register User
- **POST** `/auth/register`
- **Description**: Create a new user account
- **Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response** (201):
  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
  ```

### Login User
- **POST** `/auth/login`
- **Description**: Authenticate user and get JWT token
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (200):
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```

### Get Current User Profile
- **GET** `/auth/me`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "bio": "Software Developer",
      "teams": [...]
    }
  }
  ```

### Update Profile
- **PUT** `/auth/profile`
- **Auth**: Required
- **Body** (all fields optional):
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Full-stack developer"
  }
  ```
- **Response** (200): Updated user object

### Change Password
- **POST** `/auth/change-password`
- **Auth**: Required
- **Body**:
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword123"
  }
  ```
- **Response** (200): Success message

### Logout
- **POST** `/auth/logout`
- **Auth**: Required
- **Response** (200): `{ "message": "Logged out successfully" }`

---

## 📝 Task Endpoints

### Create Task
- **POST** `/tasks`
- **Auth**: Required
- **Body**:
  ```json
  {
    "title": "Design homepage",
    "description": "Create mockups and prototypes for the new homepage",
    "dueDate": "2026-06-30T00:00:00Z",
    "priority": "high",
    "teamId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "assignedTo": ["60f7b3b3b3b3b3b3b3b3b3b4"],
    "tags": ["design", "frontend"],
    "project": "Website Redesign"
  }
  ```
- **Response** (201): Created task object

### Get Tasks (with filtering & pagination)
- **GET** `/tasks`
- **Auth**: Required
- **Query Parameters**:
  - `status` - Filter by status: `open`, `in-progress`, `completed`, `cancelled`
  - `priority` - Filter by priority: `low`, `medium`, `high`, `urgent`
  - `assignedTo` - Filter by assigned user ID
  - `teamId` - Filter by team ID
  - `search` - Search in title and description
  - `sortBy` - Sort field (default: `-createdAt`). Use `-` prefix for descending
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 10)

- **Examples**:
  ```
  GET /tasks?status=open&priority=high
  GET /tasks?search=homepage&sortBy=dueDate
  GET /tasks?assignedTo=60f7b3b3b3b3b3b3b3b3b3b4&page=2&limit=20
  ```

- **Response** (200):
  ```json
  {
    "tasks": [...],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
  ```

### Get Task by ID
- **GET** `/tasks/:taskId`
- **Auth**: Required
- **Response** (200): Complete task object with comments and attachments

### Update Task
- **PUT** `/tasks/:taskId`
- **Auth**: Required
- **Body** (all fields optional):
  ```json
  {
    "title": "Updated title",
    "description": "Updated description",
    "status": "in-progress",
    "priority": "medium",
    "dueDate": "2026-07-15T00:00:00Z",
    "assignedTo": ["60f7b3b3b3b3b3b3b3b3b3b4"],
    "tags": ["design"]
  }
  ```
- **Response** (200): Updated task object

### Delete Task
- **DELETE** `/tasks/:taskId`
- **Auth**: Required
- **Response** (200): Success message

### Complete Task
- **PATCH** `/tasks/:taskId/complete`
- **Auth**: Required
- **Response** (200): Task with status set to `completed`

### Assign Task to Users
- **POST** `/tasks/:taskId/assign`
- **Auth**: Required
- **Body**:
  ```json
  {
    "assignedTo": ["60f7b3b3b3b3b3b3b3b3b3b4", "60f7b3b3b3b3b3b3b3b3b3b5"]
  }
  ```
- **Response** (200): Updated task object

---

## 👥 Team Endpoints

### Create Team
- **POST** `/teams`
- **Auth**: Required
- **Body**:
  ```json
  {
    "name": "Frontend Team",
    "description": "Responsible for all frontend development"
  }
  ```
- **Response** (201): Created team object

### Get All Teams
- **GET** `/teams`
- **Auth**: Required
- **Response** (200): Array of teams

### Get Team by ID
- **GET** `/teams/:teamId`
- **Auth**: Required
- **Response** (200): Complete team object with members and tasks

### Update Team
- **PUT** `/teams/:teamId`
- **Auth**: Required (Team owner only)
- **Body**:
  ```json
  {
    "name": "Updated team name",
    "description": "Updated description"
  }
  ```
- **Response** (200): Updated team object

### Add Team Member
- **POST** `/teams/:teamId/members`
- **Auth**: Required (Team owner only)
- **Body**:
  ```json
  {
    "userId": "60f7b3b3b3b3b3b3b3b3b3b4",
    "role": "member"
  }
  ```
- **Response** (200): Updated team object with new member

### Remove Team Member
- **DELETE** `/teams/:teamId/members`
- **Auth**: Required (Team owner only)
- **Body**:
  ```json
  {
    "userId": "60f7b3b3b3b3b3b3b3b3b3b4"
  }
  ```
- **Response** (200): Updated team object

### Update Member Role
- **PATCH** `/teams/:teamId/members`
- **Auth**: Required (Team owner only)
- **Body**:
  ```json
  {
    "userId": "60f7b3b3b3b3b3b3b3b3b3b4",
    "role": "admin"
  }
  ```
- **Response** (200): Updated team object

### Delete Team
- **DELETE** `/teams/:teamId`
- **Auth**: Required (Team owner only)
- **Response** (200): Success message

---

## 💬 Comment Endpoints

### Create Comment
- **POST** `/comments`
- **Auth**: Required
- **Body**:
  ```json
  {
    "content": "This looks great! @johndoe please review.",
    "taskId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "mentions": ["60f7b3b3b3b3b3b3b3b3b3b4"]
  }
  ```
- **Response** (201): Created comment object

### Get Comments for Task
- **GET** `/comments/task/:taskId`
- **Auth**: Required
- **Query Parameters**:
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 20)

- **Response** (200):
  ```json
  {
    "comments": [...],
    "pagination": {...}
  }
  ```

### Update Comment
- **PUT** `/comments/:commentId`
- **Auth**: Required (Comment author only)
- **Body**:
  ```json
  {
    "content": "Updated comment text"
  }
  ```
- **Response** (200): Updated comment object

### Delete Comment
- **DELETE** `/comments/:commentId`
- **Auth**: Required (Comment author only)
- **Response** (200): Success message

### Add Mentions to Comment
- **POST** `/comments/:commentId/mentions`
- **Auth**: Required (Comment author only)
- **Body**:
  ```json
  {
    "mentions": ["60f7b3b3b3b3b3b3b3b3b3b4", "60f7b3b3b3b3b3b3b3b3b3b5"]
  }
  ```
- **Response** (200): Updated comment with mentions

---

## 🧪 Testing

### Manual Testing with cURL

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Create a task (replace TOKEN with your JWT):**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "dueDate": "2026-12-31T00:00:00Z",
    "priority": "high"
  }'
```

### Using Postman

1. Import the API collection (or create manually)
2. Set base URL to `http://localhost:5000/api`
3. For protected endpoints, add `Authorization` header with Bearer token
4. Create and test requests

## 📂 Project Structure

```
TaskMaster/
├── src/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── taskController.js     # Task CRUD operations
│   │   ├── teamController.js     # Team management
│   │   └── commentController.js  # Comment operations
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication & authorization
│   │   └── validation.js         # Input validation
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Task.js               # Task schema
│   │   ├── Team.js               # Team schema
│   │   ├── Comment.js            # Comment schema
│   │   └── Attachment.js         # File attachment schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── taskRoutes.js         # Task endpoints
│   │   ├── teamRoutes.js         # Team endpoints
│   │   └── commentRoutes.js      # Comment endpoints
│   ├── utils/
│   │   ├── tokenUtils.js         # JWT token generation
│   │   └── fileUtils.js          # File handling utilities
│   └── server.js                 # Main server file
├── uploads/                      # File upload directory
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies & scripts
└── README.md                     # This file
```

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` file. Use `.env.example` as template.
2. **Password Hashing**: Passwords are hashed using bcryptjs with 10 salt rounds.
3. **JWT Secrets**: Change `JWT_SECRET` in production.
4. **HTTPS**: Use HTTPS in production environment.
5. **CORS**: Configure CORS appropriately for your frontend domain.
6. **Input Validation**: All inputs are validated using express-validator.
7. **Rate Limiting**: Consider adding rate limiting in production.
8. **Database Security**: Use MongoDB Atlas with IP whitelisting in production.

## 🚀 Deployment

### Deploy to Heroku

1. Create Heroku account and install Heroku CLI
2. In project directory:
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_secret_key
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

### Deploy to Railway, Render, or AWS

Similar process with environment configuration. Refer to respective platform documentation.

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network access if using MongoDB Atlas

### JWT Token Issues
- Ensure token is properly formatted in Authorization header
- Check token hasn't expired
- Verify `JWT_SECRET` matches server configuration

### CORS Errors
- Check frontend domain is allowed in CORS configuration
- Ensure preflight requests are handled

## 📝 Code Quality

The project follows best practices:
- Clear separation of concerns (Models, Controllers, Routes)
- Input validation on all endpoints
- Comprehensive error handling
- Consistent code structure
- Descriptive variable and function names

## 🔄 Future Enhancements

- [ ] Real-time notifications using WebSockets (Socket.io)
- [ ] File upload for task attachments
- [ ] AI-powered task description generation (OpenAI integration)
- [ ] Email notifications
- [ ] Task analytics and reporting
- [ ] Advanced search with filters
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Task dependencies
- [ ] Mobile app API optimization
- [ ] GraphQL API alternative
- [ ] Docker containerization

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💼 Author

**Gurram Venkata Bala Sai**
- GitHub: [@Gurram-2000](https://github.com/Gurram-2000)
- Repository: [TaskMaster](https://github.com/Gurram-2000/TaskMaster)

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review API examples provided

---

**Happy task tracking! 🎯**
