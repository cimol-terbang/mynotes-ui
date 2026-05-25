# myNotes — Frontend

Personal notes web app built with Vue 3 + Vite. Write in Markdown, browse by category or tag, leave comments, and manage everything through a built-in admin dashboard.

## Features

- 📝 Browse posts across three categories — Essay, Poem, and Story
- 🔍 Filter by category or tag
- 💬 Comment section on every post (anonymous-friendly)
- 🖼️ Markdown rendering with image embed support
- 🌙 Dark / light mode toggle
- � Password-protected admin dashboard
- ✍️ Admin: compose posts in Markdown with live preview
- 📤 Admin: upload and embed images directly into the editor
- 📱 Fully responsive

## Tech Stack

| | |
|---|---|
| Framework | Vue 3 (Composition API) |
| Build tool | Vite |
| UI components | PrimeVue + PrimeIcons |
| Markdown | marked |
| HTTP | Axios |
| Routing | Vue Router |
| Linting | ESLint + oxlint |
| Formatting | Prettier |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API URL

Create a `.env.development` file (or copy from the example):

```env
VITE_API_URL=http://localhost:3000
```

Point this at your running [myNotes backend](https://github.com/haotian/notes-backend).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
├── assets/          # Global CSS and static assets
├── components/
│   └── AppLayout.vue    # Navbar + footer shell
├── views/
│   ├── HomeView.vue     # Post grid with category/tag filtering
│   ├── PostView.vue     # Full post with markdown render + comments
│   ├── TagView.vue      # Posts filtered by tag
│   ├── AboutView.vue
│   └── admin/
│       └── AdminView.vue  # Admin dashboard (login, compose, manage)
├── services/
│   └── api.js           # Axios instances + all API calls
├── router/
│   └── index.js
└── main.js
```

## API Endpoints Consumed

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | All published posts |
| GET | `/posts/:slug` | Single post by slug |
| GET | `/posts/category/:category` | Posts by category |
| GET | `/posts/tag/:tag` | Posts by tag |
| GET | `/comments/:postId` | Comments for a post |
| POST | `/comments` | Submit a comment |
| POST | `/admin/login` | Admin authentication |
| POST | `/admin/posts` | Create a post |
| DELETE | `/admin/posts/:id` | Delete a post |
| POST | `/admin/upload` | Upload an image |

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # Run oxlint + ESLint with auto-fix
npm run format    # Format source with Prettier
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://note-api.haotian.my.id:5965` |
