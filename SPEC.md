# Friend Zone - Our Digital Home

## Concept & Vision

A cozy digital scrapbook for a close-knit friend group—somewhere between a private social network and a physical memory box. The design evokes the warmth of late-night hangouts, inside jokes, and shared memories. It should feel like walking into a friend's living room: comfortable, familiar, and genuinely welcoming.

## Design Language

### Aesthetic Direction
Soft, dreamy nostalgia meets modern minimalism. Think Polaroid photos pinned to cork boards, handwritten notes, warm lighting through curtains. Rounded corners everywhere like hugging shapes.

### Color Palette
- **Primary**: `#E8B4B8` (dusty rose)
- **Secondary**: `#A7C4BC` (sage green)
- **Accent**: `#F4D06F` (warm gold)
- **Background**: `#FDF6F0` (cream)
- **Surface**: `#FFFFFF` (white)
- **Text Primary**: `#5D5D5D` (warm gray)
- **Text Secondary**: `#9A9A9A` (light gray)
- **Pastel Purple**: `#D4A5D9` (lavender)
- **Pastel Blue**: `#A8D8EA` (sky)

### Typography
- **Headings**: 'Quicksand', sans-serif (weight 600-700) — rounded, friendly
- **Body**: 'Nunito', sans-serif (weight 400-600) — warm readability
- **Accent/Handwritten feel**: 'Caveat', cursive — for tags and special notes

### Spatial System
- Base unit: 8px
- Generous padding (24-48px)
- Large border-radius: 16-24px for cards, 50% for avatars
- Soft shadows with warm tint: `0 4px 20px rgba(93, 93, 93, 0.08)`

### Motion Philosophy
- Gentle fade-ins on scroll (300ms ease-out)
- Subtle hover lifts on cards (transform: translateY(-4px))
- Staggered entrance animations for grid items
- Soft pulse on interactive elements

### Visual Assets
- Lucide icons (rounded style matches aesthetic)
- Unsplash images for placeholder memories
- Decorative: subtle polka dot patterns, wavy dividers, sticker-like badges

## Layout & Structure

### Navigation
Fixed top nav with rounded pill buttons, semi-transparent backdrop blur. Logo on left, nav links centered, small profile icon on right.

### Sections (Single Page Application feel with smooth scroll)

1. **Hero** — Full viewport height, centered welcome message with floating decorative shapes, subtle parallax on background

2. **Member Directory** — Masonry-style grid of profile cards, each with avatar, name, bio snippet, and "inside joke" tag badge

3. **Media Gallery** — Lightbox-enabled grid of memories, organized by "trip" or date. Polaroid-style frames.

4. **Events Calendar** — Monthly view with birthday dots and event markers. Side panel shows upcoming events list.

5. **Blog Wall** — Reverse chronological feed of posts, each with author avatar, timestamp, content, and reaction buttons.

### Responsive Strategy
- Desktop: Full layouts, multi-column grids
- Tablet: 2-column grids, stacked sidebars
- Mobile: Single column, hamburger nav, touch-friendly targets (min 44px)

## Features & Interactions

### Navigation
- Smooth scroll to sections on nav click
- Active section highlighted in nav
- Mobile: slide-out drawer menu

### Member Directory
- Cards flip slightly on hover revealing full bio
- "Inside Joke" tag has sticker/badged appearance
- Click to expand modal with full profile

### Media Gallery
- Grid of polaroid-styled images
- Click opens lightbox with navigation arrows
- Filter by trip/event using pill buttons

### Events Calendar
- Click date to see details
- Birthday indicators with cake icon
- Event cards show RSVP status concept

### Blog Wall
- "Write something" floating action button
- Posts have emoji reaction buttons
- Timestamp shows relative time ("2 days ago")

### States
- Loading: Skeleton placeholders with pulse animation
- Empty: Friendly illustrations with encouraging text
- Error: Soft, non-alarming message with retry option

## Component Inventory

### NavBar
- Semi-transparent white with blur
- Logo: "Friend Zone" in Quicksand + small heart icon
- Links: Home, Members, Gallery, Events, Blog
- Mobile: hamburger icon reveals drawer

### Hero Section
- Large welcoming title with subtle text shadow
- Tagline in Caveat font
- Floating decorative shapes (circles, stars) with slow drift animation
- Scroll indicator arrow bouncing gently

### Member Card
- Large circular avatar (80px) with soft shadow
- Name in Quicksand bold
- Bio in Nunito (2-3 lines, truncated)
- "Inside Joke" tag: pill shape, gradient background, Caveat font
- Hover: lift + subtle glow

### Media Card (Polaroid Style)
- White border frame (looks like instant photo)
- Image with slight rotation (-2 to 2deg)
- Caption below in handwritten style
- Hover: straighten + lift

### Event Card
- Date badge on left (month/day)
- Event title + location
- Type indicator (birthday = cake, reunion = clinking glasses)
- Attendee avatars stacked

### Blog Post
- Author row: avatar, name, timestamp
- Content area with proper line breaks
- Reaction bar: emoji buttons with counts
- Subtle separator between posts

### Button Variants
- Primary: dusty rose background, white text, rounded
- Secondary: outlined, sage green
- Ghost: text only with underline on hover
- FAB: floating action button, circle, accent color

## Technical Approach

### Backend
- **Node.js + Express** server
- **MongoDB Atlas** for database storage
- **JWT authentication** with bcrypt password hashing
- **Multer** for image uploads
- RESTful API architecture

### Database Models
- **User**: username, email, password (hashed), displayName, bio, insideJoke, role (admin/member), avatar
- **GalleryItem**: imageUrl, caption, category, uploadedBy, rotation
- **Event**: title, date, type (birthday/reunion/other), location, description, createdBy
- **Post**: content, author, reactions (Map), image

### API Endpoints
- `/api/auth/*` - Authentication (login, register, logout)
- `/api/users/*` - User management (admin can add/edit/delete)
- `/api/gallery/*` - Image gallery management
- `/api/events/*` - Events calendar management
- `/api/posts/*` - Blog wall posts with reactions

### Frontend
- **Single HTML file** with embedded CSS and JavaScript
- Vanilla JS for interactions (connects to backend API)
- CSS Grid and Flexbox for layouts
- CSS custom properties for theming
- Intersection Observer for scroll animations
- Google Fonts: Quicksand, Nunito, Caveat
- Lucide Icons via CDN

### User Management
- 6 initial users created via `setup-db.js`
- **MUNANIA** is the admin with full user management rights
- New users can only be added by the admin
- JWT tokens expire after 7 days
