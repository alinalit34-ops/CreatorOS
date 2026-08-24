# Creator OS ⚡

A unified, full-stack operating system for modern content creators to manage content planning, real-time analytics, audience intelligence, AI strategy generation, and monetization tracking.

---

## 🌟 Key Features

- **Unified Content Calendar & Kanban Board**: Plan, schedule, draft, and publish multi-platform content across YouTube, TikTok, Instagram, Twitter/X, and LinkedIn.
- **Real Telemetry & Analytics Dashboard**: Synchronize verified channel statistics via OAuth 2.0 (YouTube & TikTok) with strict zero-state telemetry guards.
- **Audience Heatmaps & Engagement Wave**: Identify peak posting windows with interactive day/hour engagement matrix and follower demographics.
- **AI Strategy & Scripting Engine**: Powered by Google Gemini 2.5 Flash for content idea generation, hook crafting, script writing, and cross-platform repurposing.
- **Monetization & Sponsorship Tracker**: Manage brand deals, affiliate revenue, ad payouts, and goal milestones with live revenue pacing.
- **Cloud Persistence & Auth**: Firebase Firestore persistence for user profiles, posts, target goals, and platform tokens.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS, Motion, Lucide React, Recharts, Radix / Base UI
- **Backend**: Node.js, Express, TypeScript (tsx in development, esbuild bundled CommonJS for production)
- **AI Integration**: `@google/genai` (Google Gemini 2.5 Flash)
- **Database & Auth**: Firebase Firestore & Firebase Auth
- **APIs & Integrations**: Google APIs (YouTube Data API v3), TikTok Open API (OAuth 2.0)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or `pnpm` / `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/creator-os.git
   cd creator-os
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in the required configuration:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   APP_URL="http://localhost:3000"

   # Optional: Platform Integrations
   YOUTUBE_CLIENT_ID="your-google-client-id"
   YOUTUBE_CLIENT_SECRET="your-google-client-secret"
   TIKTOK_CLIENT_KEY="your-tiktok-client-key"
   TIKTOK_CLIENT_SECRET="your-tiktok-client-secret"
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 📦 Build & Production

To compile the frontend assets and backend server bundle for production:

```bash
npm run build
```

To run the production build:

```bash
npm start
```

---

## 📁 Project Structure

```
creator-os/
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Modular UI feature components
│   │   ├── ai/             # AI Strategy, Assistant, and Chat
│   │   ├── analytics/      # Analytical charts, performance telemetry
│   │   ├── audience/       # Heatmaps, follower trends, active hours
│   │   ├── calendar/       # Calendar scheduling views
│   │   ├── common/         # Cards, buttons, navigation, modals
│   │   ├── dashboard/      # Main dashboard & metric drill-downs
│   │   ├── monetization/   # Sponsorships, revenue streams, invoices
│   │   ├── onboarding/     # Initial user setup & platform linking
│   │   ├── planner/        # Kanban board & content pipeline
│   │   └── settings/       # Account preferences & connections
│   ├── lib/                # Firebase config and utilities
│   ├── services/           # AI services & telemetry extraction
│   ├── types.ts            # Global TypeScript types and interfaces
│   ├── App.tsx             # Main application orchestrator
│   └── main.tsx            # React application entry point
├── server.ts               # Express server with Vite middleware & OAuth endpoints
├── metadata.json           # Application manifest
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies and scripts
```

---

## 🔒 Security & Privacy

- All API keys (Gemini, Google OAuth, TikTok Client Secret) remain strictly on the backend and are never exposed to the client.
- OAuth token exchanges occur exclusively via secure server-to-server endpoints.
