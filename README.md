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
npm run setup    # Create users and seed database
npm start        # Runs at http://localhost:8787
```

### 2. Setup Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev      # Runs at http://localhost:5173
```

## User Credentials

| Name | Username | Password | Role |
|------|----------|----------|------|
| **Munania** | MUNANIA | Munania@2024! | **Admin** |
| Freddi Kang'ethe | FREDDI.KANGETHE | Freddi@2024! | Member |
| Laura | LAURA | Laura@2024! | Member |
| Wairimu | WAIRIMU | Wairimu@2024! | Member |
| Manyatta | MANYATTA | Manyatta@2024! | Member |
| Juniors | JUNIORS | Juniors@2024! | Member |

## Features

- Login System (JWT authentication)
- Member Directory with inside jokes
- Photo Gallery with uploads
- Events Calendar (birthdays & reunions)
- Blog Wall with emoji reactions
- Admin Panel (Munania can manage users)
