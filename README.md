
##  Project Structure

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
