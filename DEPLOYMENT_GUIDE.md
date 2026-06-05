# Deployment Guide - TaskMaster Backend

Complete guide for deploying TaskMaster to various platforms.

## Prerequisites

- Git repository pushed to GitHub (public repo required)
- Node.js application tested locally
- All environment variables documented

---

## 🌐 Option 1: Deploy to Heroku (Recommended for beginners)

### Step 1: Setup Heroku Account

1. Create account at https://www.heroku.com
2. Install Heroku CLI from https://devcenter.heroku.com/articles/heroku-cli

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Create Heroku App

```bash
heroku create your-app-name
```

Replace `your-app-name` with unique name (e.g., `taskmaster-api-prod`)

### Step 4: Setup MongoDB Atlas (Cloud)

1. Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create database user
4. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string

### Step 5: Set Environment Variables on Heroku

```bash
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskmaster?retryWrites=true&w=majority"
heroku config:set JWT_SECRET="your_very_secret_key_min_32_chars"
heroku config:set NODE_ENV="production"
heroku config:set JWT_EXPIRE="7d"
```

### Step 6: Deploy

```bash
git push heroku main
# or if your branch is master:
git push heroku master
```

### Step 7: View Logs

```bash
heroku logs --tail
```

### Step 8: Test Deployment

```bash
curl https://your-app-name.herokuapp.com/api/health
```

---

## 🚂 Option 2: Deploy to Railway

### Step 1: Setup Railway

1. Create account at https://railway.app
2. Connect GitHub account

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select TaskMaster repository
4. Click "Deploy"

### Step 3: Add MongoDB Plugin

1. In Railway dashboard, click "Add"
2. Select "MongoDB"
3. Add to your project

### Step 4: Configure Environment

1. Go to Variables tab
2. Add:
   - `MONGODB_URI`: Auto-set by Railway MongoDB plugin
   - `JWT_SECRET`: Your secret key
   - `NODE_ENV`: production
   - `PORT`: 8080 (Railway default)

### Step 5: Deploy

Railway auto-deploys on git push. Check deployment status in dashboard.

---

## ☁️ Option 3: Deploy to Render

### Step 1: Setup Render

1. Create account at https://render.com
2. Connect GitHub

### Step 2: Create New Web Service

1. Click "New +"
2. Select "Web Service"
3. Connect GitHub repository
4. Select TaskMaster repo

### Step 3: Configure Service

**Settings:**
- Name: `taskmaster-api`
- Environment: `Node`
- Region: Select closest region
- Build Command: `npm install`
- Start Command: `npm start`

### Step 4: Add Environment Variables

In Environment section:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
NODE_ENV=production
```

### Step 5: Deploy

Click "Create Web Service" to deploy.

---

## 🐳 Option 4: Deploy with Docker (Advanced)

### Step 1: Create Dockerfile

Create `Dockerfile` in root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Step 2: Create .dockerignore

```
node_modules
npm-debug.log
.git
.env
uploads
.DS_Store
```

### Step 3: Build Image

```bash
docker build -t taskmaster-api:1.0 .
```

### Step 4: Run Container

```bash
docker run -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="your_secret" \
  -e NODE_ENV="production" \
  taskmaster-api:1.0
```

### Step 5: Deploy to Docker Hub (Optional)

```bash
docker tag taskmaster-api:1.0 your-username/taskmaster-api:1.0
docker push your-username/taskmaster-api:1.0
```

---

## 📦 Option 5: Deploy to AWS EC2

### Step 1: Setup EC2 Instance

1. Create AWS account
2. Launch Ubuntu 22.04 EC2 instance
3. Download key pair (.pem file)

### Step 2: Connect to Instance

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-instance-ip
```

### Step 3: Install Dependencies

```bash
sudo apt update
sudo apt install -y nodejs npm git

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 4: Clone Repository

```bash
git clone https://github.com/Gurram-2000/TaskMaster.git
cd TaskMaster
npm install
```

### Step 5: Setup Environment

```bash
cp .env.example .env
nano .env
# Add your configuration
```

### Step 6: Start with PM2

```bash
pm2 start src/server.js --name "taskmaster-api"
pm2 startup
pm2 save
```

### Step 7: Setup Nginx Reverse Proxy

```bash
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

### Step 8: Setup SSL (Optional but Recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔐 Production Best Practices

### 1. Environment Variables

**Never commit `.env` file!** Use `.env.example` as template.

Critical variables:
- `JWT_SECRET`: Use strong, random 32+ character string
- `MONGODB_URI`: Use Atlas with IP whitelisting
- `NODE_ENV`: Set to `production`

### 2. Database Security

```javascript
// Use connection pool
// IP whitelist on MongoDB Atlas
// Use strong database passwords
// Enable encryption at rest
```

### 3. API Security

- Enable HTTPS/SSL
- Implement rate limiting
- Use helmet.js (already included)
- Validate all inputs
- Implement CORS properly

### 4. Monitoring

Add error tracking:

```bash
npm install sentry
```

Then in server.js:
```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### 5. Logging

Use production-grade logger:

```bash
npm install winston
```

### 6. Backup

- Enable MongoDB automated backups
- Regular database snapshots
- Version control backups

---

## 📊 Monitoring & Performance

### Health Checks

```bash
curl https://your-api.com/api/health
```

### Performance Optimization

1. **Enable database indexing** (already in models)
2. **Use pagination** (implemented in API)
3. **Cache responses** when appropriate
4. **Optimize queries** - select only needed fields

### Auto-Scaling

Most platforms auto-scale based on CPU/memory usage:
- Heroku: Dynos
- Railway: Replica sets
- Render: Auto-scaling
- AWS: Load balancer + multiple EC2s

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Verify connection string
- Check IP whitelist on Atlas
- Ensure database exists

### "Port already in use"
- Change PORT in environment
- Kill process: `lsof -ti:5000 | xargs kill`

### "Out of memory"
- Check database queries
- Enable pagination
- Increase server resources

### "Slow API responses"
- Check database indexes
- Monitor server resources
- Enable caching

---

## 📈 Post-Deployment Checklist

- [ ] Test all endpoints on production URL
- [ ] Verify database connectivity
- [ ] Check error logging
- [ ] Monitor performance metrics
- [ ] Setup automatic backups
- [ ] Enable monitoring/alerting
- [ ] Document deployment process
- [ ] Test user registration flow
- [ ] Verify JWT token generation
- [ ] Test file upload (if implemented)
- [ ] Monitor database growth
- [ ] Plan scaling strategy

---

## 🔄 Continuous Deployment

### GitHub Actions (Auto-deploy on push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Heroku

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

Set secrets in GitHub Settings → Secrets

---

## 📞 Support

For deployment issues:
- Check platform documentation
- Review error logs
- Check database connectivity
- Verify environment variables
- Test locally before deploying

---

**Happy deploying! 🚀**
