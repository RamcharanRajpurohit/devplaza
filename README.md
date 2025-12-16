# DevPlaza

A full-stack web application with React (Vite) frontend and Node.js/Express backend.

## 🔍 Finding and Setting Up .env Files

This organization uses environment variables to configure the application. Environment files (`.env`) are **not tracked in git** for security reasons.

### Location of .env Files

The project requires `.env` files in two locations:

1. **Server**: `/server/.env`
2. **Client**: `/client/.env`

### How to Set Up .env Files

1. **Navigate to the server directory**:
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Navigate to the client directory**:
   ```bash
   cd client
   cp .env.example .env
   ```

3. **Edit the .env files** with your actual configuration values:
   - Open each `.env` file in your text editor
   - Replace the placeholder values with your actual credentials

### Required Environment Variables

#### Server (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `ACCESS_TOKEN_SECRET` | JWT access token secret | Random strong string |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret | Random strong string |
| `MAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `MAIL_USER` | Email address for sending | `your-email@gmail.com` |
| `MAIL_PASS` | Email password or app password | Your password |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) | Your Google client ID |

#### Client (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:5000` |

### Finding .env Files in the Repository

To check if `.env` files exist (they are gitignored):

```bash
# From the project root
find . -name ".env" -type f 2>/dev/null | grep -v node_modules
```

To see which `.env` files are required:

```bash
# Look for .env.example files
find . -name ".env.example" -type f
```

### Security Notes

⚠️ **Important**: 
- Never commit `.env` files to version control
- Keep your secrets secure
- Use strong, random strings for JWT secrets
- For email, use app-specific passwords (not your main password)
- Different environments (dev, staging, prod) should have different values

### Generating Secure Secrets

For JWT secrets, you can generate secure random strings using:

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64
```

## 🚀 Getting Started

1. Clone the repository
2. Set up `.env` files as described above
3. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```
4. Run the application:
   ```bash
   # Terminal 1 - Start server
   cd server
   npm run dev
   
   # Terminal 2 - Start client
   cd client
   npm run dev
   ```

## 📝 Additional Resources

- `.env.example` files contain all required variables with descriptions
- Check the `server/src` directory to see how environment variables are used
- Client environment variables must be prefixed with `VITE_` for Vite to expose them
