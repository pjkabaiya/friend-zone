# Friend Zone - Our Digital Home

A private community website for a close-knit friend group.

## Project Structure

```
friend-zone/
├── backend/          # Node.js + Express API
│   ├── server.js    # Express server
│   ├── routes/      # API routes
│   ├── models/      # MongoDB models
│   ├── middleware/  # Auth middleware
│   ├── uploads/     # Uploaded images
│   └── package.json
│
├── frontend/        # React + Vite app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # Auth context
│   │   └── services/     # API service
│   ├── package.json
│   └── vite.config.js
│
└── SPEC.md         # Project specification
```

## Quick Start

### 1. Setup Backend
```bash
cd backend
npm install
npm start
```

### 2. Setup Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

## Getting Started

1. **Create your first account** - Register at the site. The first user automatically becomes admin.
2. **Access Admin Panel** - Admin users can manage members, gallery, events, and more.
3. **Invite members** - Use the Admin Panel to create accounts for other members.

## Features

- Login System (JWT authentication)
- Member Directory with inside jokes
- Photo Gallery with uploads
- Events Calendar (birthdays & reunions)
- Blog Wall with emoji reactions
- Admin Panel (admin users can manage users)
