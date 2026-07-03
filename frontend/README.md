# 🎬 CineMax — Premium Movie Streaming Platform

A modern, production-ready movie streaming & selling frontend built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

---

## ✨ Features

- **Authentication** — Login & Signup with full form validation (Zod + React Hook Form)
- **Home Page** — Cinematic hero banner, movie categories, category filtering
- **Movie Detail Page** — Full details, trailer/video player, lock screen for non-subscribers
- **Subscription System** — 3-tier pricing (Basic, Premium, Annual) with mock payment UI
- **User Dashboard** — Profile, stats, watchlist, subscription management
- **Search & Browse** — Live search, category filters, sort by rating/year/title
- **State Management** — Zustand with localStorage persistence
- **Responsive Design** — Mobile-first, works on all screen sizes
- **Dark Theme** — Premium dark aesthetic throughout
- **Framer Motion** — Smooth page transitions and micro-animations
- **Protected Routes** — Subscription-gated content

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the project
cd cinemax

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js 14 App Router
│   ├── page.tsx                # Home page
│   ├── layout.tsx              # Root layout with fonts
│   ├── globals.css             # Global styles
│   ├── loading.tsx             # Loading skeleton
│   ├── not-found.tsx           # 404 page
│   ├── auth/
│   │   ├── login/page.tsx      # Login page
│   │   └── signup/page.tsx     # Signup page
│   ├── movies/
│   │   └── [id]/page.tsx       # Movie detail page
│   ├── dashboard/page.tsx      # User dashboard
│   ├── pricing/page.tsx        # Pricing/plans page
│   └── search/page.tsx         # Search & browse page
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Sticky navbar with auth state
│   │   └── Footer.tsx          # Site footer
│   ├── movies/
│   │   ├── MovieCard.tsx       # Movie card with hover effects
│   │   ├── MovieGrid.tsx       # Responsive movie grid
│   │   ├── MovieSkeleton.tsx   # Loading skeleton
│   │   ├── HeroSection.tsx     # Featured movie hero
│   │   └── CategoryFilter.tsx  # Animated category pills
│   ├── ui/
│   │   ├── PricingCard.tsx     # Subscription plan card
│   │   ├── Toast.tsx           # Toast notifications
│   │   └── ProtectedRoute.tsx  # Auth/subscription guard
│   └── auth/
│
├── lib/
│   ├── data.ts                 # Mock movie data & helper functions
│   └── utils.ts                # Utility functions (cn, formatRating, etc.)
│
├── store/
│   └── authStore.ts            # Zustand store (auth + subscription)
│
├── hooks/
│   └── useAuth.ts              # Auth hook wrapper
│
└── types/
    └── index.ts                # TypeScript type definitions
```

---

## 🎨 Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `brand-red` | `#e50914` | Primary CTA, highlights |
| `brand-gold` | `#f5c518` | Premium, ratings, accents |
| `bg-primary` | `#0a0a0f` | Main background |
| `bg-secondary` | `#111118` | Cards, surfaces |
| `text-primary` | `#ffffff` | Main text |
| `text-secondary` | `#b3b3cc` | Subtext |

### Fonts
- **Display**: Bebas Neue — used for titles, section headers
- **Body**: DM Sans — used for all body text, UI elements

---

## 🔐 Authentication Flow

1. User visits **Sign Up** → fills form (name, email, password, confirm) → redirected to Pricing
2. User chooses a **Plan** → mock payment → redirected to Dashboard
3. **Subscribed users** get full movie access
4. **Non-subscribed users** see trailer + lock screen on movie detail
5. State persists in localStorage via Zustand `persist` middleware

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` 14 | App Router, SSR, routing |
| `framer-motion` | Page transitions, animations |
| `zustand` | Global state management |
| `react-hook-form` | Form state management |
| `zod` | Schema validation |
| `@hookform/resolvers` | Zod adapter for RHF |
| `lucide-react` | Icon library |
| `tailwind-merge` | Conditional class merging |
| `clsx` | Class name utility |

---

## 🛠 Customization

### Add New Movies
Edit `src/lib/data.ts` and add a new object to the `movies` array:

```ts
{
  id: 13,
  title: "My Movie",
  description: "Description...",
  poster: "https://...",
  backdropUrl: "https://...",
  trailerUrl: "https://www.youtube.com/embed/...",
  videoUrl: "/videos/my-movie.mp4",
  category: "Action",
  rating: 8.5,
  year: 2024,
  duration: "2h 10m",
  genre: "Action · Thriller",
  director: "Director Name",
  cast: ["Actor 1", "Actor 2"],
  trending: true,
  badge: "new",
}
```

### Add Real Video
Replace `videoUrl` with actual video URLs or integrate a service like Mux or Cloudflare Stream.

### Connect Real Auth
Replace the `authStore.ts` login/signup actions with real API calls to your backend.

---

## 📝 Notes

- This is a **demo frontend** — no real payments are processed
- Movie images use Unsplash; replace with TMDB or your own CDN
- Video player is mocked; integrate Mux or Cloudflare Stream for production
- Auth is local state; connect to a backend (e.g., NextAuth.js) for production

---

## 📄 License

MIT — use freely for personal and commercial projects.
