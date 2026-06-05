# Quick Start Guide - TaskMaster Backend

Get the TaskMaster backend running in minutes!

## 1️⃣ Clone & Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/Gurram-2000/TaskMaster.git
cd TaskMaster

# Install dependencies
npm install
```

## 2️⃣ Setup Environment (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Make sure MONGODB_URI points to your MongoDB instance
```

### .env Configuration

**For Local MongoDB:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskmaster
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskmaster?retryWrites=true&w=majority
```

## 3️⃣ Start MongoDB

### Windows (Local)
```bash
# If MongoDB is installed as a service, it should auto-start
# Or manually start MongoDB daemon
mongod
```

### Using MongoDB Atlas (Cloud)
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string and paste into `.env` file

## 4️⃣ Run the Server

### Development (with hot reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

**Expected output:**
```
✅ MongoDB connected successfully
✅ TaskMaster Backend running on port 5000
```

## 5️⃣ Test the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{"status":"OK","message":"TaskMaster Backend is running"}
```

### Register a User
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

**Response:** Token and user data

## 📚 Next Steps

1. **Read Full Documentation**: See `README.md` for complete API reference
2. **Test Endpoints**: Follow `API_TESTING_GUIDE.md` for comprehensive testing
3. **Explore Code**: Check `src/` directory structure
4. **Deploy**: See `README.md` for deployment options (Heroku, Railway, etc.)

## 🐛 Troubleshooting

### "MongoDB connection failed"
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify credentials if using Atlas

### "Port 5000 already in use"
Change PORT in `.env`:
```env
PORT=5001
```

### "Cannot find module 'express'"
Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📖 API Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create new task |
| GET | `/api/teams` | Get all teams |
| POST | `/api/teams` | Create new team |
| POST | `/api/comments` | Add comment to task |

See `README.md` for full API documentation.

## 💡 Pro Tips

- Use Postman for easier API testing
- Check `API_TESTING_GUIDE.md` for detailed test scenarios
- Save JWT tokens for subsequent requests
- Use pagination for large datasets: `?page=1&limit=10`
- Filter tasks by status: `?status=open&priority=high`

## 🚀 You're Ready!

Your TaskMaster backend is now running. Connect your frontend and start tracking tasks! 🎉

---

For detailed documentation, see:
- 📖 `README.md` - Full API Reference
- 🧪 `API_TESTING_GUIDE.md` - Testing Guide
- 💻 `src/` - Source code structure
