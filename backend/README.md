# Friend Zone - Backend

Node.js + Express + MongoDB API server.

## Setup

```bash
cd backend
npm install
```

## First Time Setup

Create users and seed database:
```bash
npm run setup
```

## Start Server

```bash
npm start
```

Server runs at `http://localhost:8787`

## Environment Variables

Create a `.env` file:
```
PORT=8787
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Gallery
- `GET /api/gallery` - List images
- `POST /api/gallery` - Upload image

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `DELETE /api/events/:id` - Delete event

### Posts
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:id/react` - Add reaction
