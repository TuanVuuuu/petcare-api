# 🐾 PetCare API

A RESTful API for pet management with Firebase authentication and Firestore database.

## 🚀 Features

- **Authentication**: Firebase Auth with custom token exchange
- **Pet Management**: CRUD operations for pets
- **Security**: JWT token verification, rate limiting, CORS
- **Validation**: Input validation and error handling
- **Health Check**: API health monitoring

## 📋 Prerequisites

- Node.js 18+ 
- Firebase project with Firestore enabled
- Firebase service account credentials

## 🛠️ Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd petcare-api
npm install
```

### 2. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

#### **Option A: Manual Configuration**
Edit `.env` with your Firebase configuration:

```env
# Server Configuration
PORT=8989
NODE_ENV=development

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com

# Firebase Admin SDK (Service Account)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your_project_id.iam.gserviceaccount.com
FIREBASE_UNIVERSE_DOMAIN=googleapis.com

# PostgreSQL Configuration (Optional)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=petcare
DB_USER=petcare_user
DB_PASSWORD=your_secure_password_123

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### **Option B: Auto-extract from serviceAccountKey.json**
If you have a `serviceAccountKey.json` file:

```bash
# Extract Firebase keys to .env
node scripts/extract-firebase-env.js

# Review and update the generated .env file
nano .env
```

### 3. Firebase Setup

1. Create a Firebase project
2. Enable Authentication and Firestore
3. Download service account key as `serviceAccountKey.json` (optional)
4. Run the extraction script to get environment variables

### 4. Start Development Server

```bash
npm run dev
```

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/exchange` | Exchange custom token for ID token |
| POST | `/auth/logout` | Logout user (revoke token) |
| GET | `/auth/me` | Get user profile |
| DELETE | `/auth/delete` | Delete user account |

### Pets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pets` | Get user's pets |
| GET | `/pets/:id` | Get specific pet |
| POST | `/pets` | Create new pet |
| PUT | `/pets/:id` | Update pet |
| DELETE | `/pets/:id` | Delete pet |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |

## 🔐 Authentication Flow

1. **Signup**: Create user → Get custom token
2. **Login**: Get user → Get custom token  
3. **Exchange**: Custom token → ID token
4. **API Calls**: Use ID token in Authorization header
5. **Logout**: Revoke token

## 🧪 Testing

### Run Test Scripts

```bash
# Test authentication flow
npm run test:auth

# Test pets CRUD operations
npm run test:pets

# Run comprehensive test
./test-api.sh
```

### Manual Testing

```bash
# Health check
curl http://localhost:8989/health

# Signup
curl -X POST http://localhost:8989/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test User"}'

# Login
curl -X POST http://localhost:8989/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 🏗️ Architecture

```
src/
├── routes/          # API route handlers
├── services/        # Business logic
├── repositories/    # Data access layer
├── middlewares/     # Custom middleware
└── firebase.js      # Firebase configuration
```

## 🔧 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run test:auth` - Run authentication tests
- `npm run test:pets` - Run pets API tests

### Environment Management

```bash
# Backup environment variables
./scripts/backup-env.sh

# Restore environment variables
./backups/restore_env.sh ./backups/env_backup_YYYYMMDD_HHMMSS.txt

# Extract Firebase keys from serviceAccountKey.json
node scripts/extract-firebase-env.js
```

### Code Structure

- **Routes**: Handle HTTP requests and responses
- **Services**: Business logic and data processing
- **Repositories**: Database operations
- **Middlewares**: Request processing and validation

## 🚨 Error Handling

The API includes comprehensive error handling:

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate resource)
- **500**: Internal Server Error

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize user input
- **Token Verification**: JWT token validation
- **Owner-based Access**: Users can only access their own data
- **Environment Variables**: Secure credential management

## 📊 Monitoring

- Health check endpoint for monitoring
- Comprehensive logging
- Error tracking
- Performance metrics

## 🚀 Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Configure production Firebase project
3. Set up SSL certificates
4. Configure reverse proxy (Nginx)
5. Set up PM2 for process management

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 8989) |
| `NODE_ENV` | Environment | No (default: development) |
| `FIREBASE_API_KEY` | Firebase API key | Yes |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test scripts for examples 