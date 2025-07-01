# Prism Backend

Backend API for the Prism Rubik's Cube Timer App using Express, Clerk authentication, and Supabase PostgreSQL with Prisma.

---

## 🚀 Features
---

## 🚀 Features

- 🔐 **Clerk Authentication** – Secure user authentication and session management
- 🗄️ **Supabase PostgreSQL** – Scalable database for storing solve data
- 🚀 **Prisma ORM** – Type-safe database operations
- 📊 **Solve Management** – CRUD operations for solve data
- 📈 **Statistics** – Calculate averages and best times
- 🔒 **User Isolation** – Each user can only access their own data

---
- 🔐 **Clerk Authentication** – Secure user authentication and session management
- 🗄️ **Supabase PostgreSQL** – Scalable database for storing solve data
- 🚀 **Prisma ORM** – Type-safe database operations
- 📊 **Solve Management** – CRUD operations for solve data
- 📈 **Statistics** – Calculate averages and best times
- 🔒 **User Isolation** – Each user can only access their own data

---

## 📚 API Endpoints
## 📚 API Endpoints

### 🔑 Authentication Required
### 🔑 Authentication Required
All endpoints except `/api/health` require a valid Clerk session token in the Authorization header:

```http
Authorization: Bearer <token>

```http
Authorization: Bearer <token>
```

### Endpoints
- `GET /api/health` – Health check
- `GET /api/solves` – Get user's solves (with filtering and sorting)
- `POST /api/solves` – Create a new solve
- `PATCH /api/solves/:id` – Update solve state (+2, DNF)
- `DELETE /api/solves/:id` – Delete a solve
- `GET /api/stats` – Get user statistics

---
- `GET /api/health` – Health check
- `GET /api/solves` – Get user's solves (with filtering and sorting)
- `POST /api/solves` – Create a new solve
- `PATCH /api/solves/:id` – Update solve state (+2, DNF)
- `DELETE /api/solves/:id` – Delete a solve
- `GET /api/stats` – Get user statistics

---

## ⚙️ Setup Instructions
## ⚙️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Clerk
1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Get your API keys from the Clerk dashboard
4. Update `.env` with your Clerk keys:

```env
CLERK_SECRET_KEY=your_secret_key_here
CLERK_PUBLISHABLE_KEY=your_publishable_key_here
```

```env
CLERK_SECRET_KEY=your_secret_key_here
CLERK_PUBLISHABLE_KEY=your_publishable_key_here
```

### 3. Set up Supabase
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database to get your connection string
4. Update `.env` with your Supabase database URL:

```env
DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/postgres?schema=public"
```

```env
DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/postgres?schema=public"
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate
# Push schema to database
npm run db:push
# Or create and run migrations
npm run db:migrate
```

### 5. Start Development Server
```bash
npm run dev
```
The server will start on [http://localhost:3001](http://localhost:3001)
The server will start on [http://localhost:3001](http://localhost:3001)

---
---

## 🛠️ Environment Variables
## 🛠️ Environment Variables
Create a `.env` file in the root directory:

```env
# Clerk Configuration
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Supabase Database URL
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# Server Configuration
PORT=3001
NODE_ENV=development
```

---

## 🗄️ Database Schema
---

## 🗄️ Database Schema

### Solve Model
```prisma
model Solve {
  id         String   @id @default(cuid())
  userId     String   // Clerk user ID
  time       Float    // Solve time in seconds
  scramble   String   // Scramble algorithm
  puzzleType String   @default("3x3") // Puzzle type (3x3, 4x4, etc.)
  state      String   @default("none") // none, +2, DNF
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  id         String   @id @default(cuid())
  userId     String   // Clerk user ID
  time       Float    // Solve time in seconds
  scramble   String   // Scramble algorithm
  puzzleType String   @default("3x3") // Puzzle type (3x3, 4x4, etc.)
  state      String   @default("none") // none, +2, DNF
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
  @@index([userId, puzzleType])
  @@index([createdAt])
}
```

---

## 📦 Available Scripts
---

## 📦 Available Scripts

- `npm run dev` – Start development server with hot reload
- `npm run build` – Build for production
- `npm start` – Start production server
- `npm run db:generate` – Generate Prisma client
- `npm run db:push` – Push schema changes to database
- `npm run db:migrate` – Create and run database migrations
- `npm run db:studio` – Open Prisma Studio for database management

---
- `npm run dev` – Start development server with hot reload
- `npm run build` – Build for production
- `npm start` – Start production server
- `npm run db:generate` – Generate Prisma client
- `npm run db:push` – Push schema changes to database
- `npm run db:migrate` – Create and run database migrations
- `npm run db:studio` – Open Prisma Studio for database management

---

## 🔗 Frontend Integration

The frontend for this project is available at: [https://github.com/Zaid0412/prism](https://github.com/Zaid0412/prism)

To connect your React frontend to this backend:

1. Install Clerk React SDK in your frontend:
   ```bash
   npm install @clerk/clerk-react
   ```
2. Use the session token in API requests:
   ```javascript
   const { getToken } = useAuth();
   const fetchSolves = async () => {
     const token = await getToken();
     const response = await fetch('http://localhost:3001/api/solves', {
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
       }
     });
     // Handle response
   };
   ```

---

## 🚀 Production Deployment
---

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Update CORS origins to your production frontend domain
3. Use a production database (Supabase is already production-ready)
4. Deploy to your preferred platform (Vercel, Railway, Heroku, etc.)

---

## 🛡️ Security Features
---

## 🛡️ Security Features

- ✅ User authentication with Clerk
- ✅ Session token verification
- ✅ User data isolation
- ✅ Input validation
- ✅ CORS protection
- ✅ Environment variable protection

- ✅ Environment variable protection
