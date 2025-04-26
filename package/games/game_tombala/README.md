# Tombola Game

A real-time multiplayer Bingo game built with React, TypeScript, and Firebase.

## Features

- Real-time game synchronization with Firebase Realtime Database.
- User authentication via Firebase Authentication (Email/Password, Facebook).
- Internationalization support with i18next.
- Responsive UI with Tailwind CSS and MUI.
- Sound effects with Howler and toast notifications with react-hot-toast.
- Routing using `react-router-dom`.
- Mobile-friendly design.

## Technology Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, MUI, framer-motion, react-router-dom.
- **State & Localization:** i18next, react-i18next.
- **Backend:** Firebase Realtime Database & Authentication.
- **Tools:** Vite, ESLint, PostCSS.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create a `.env` file based on `.env.example` and add your Firebase configuration:**
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_DATABASE_URL=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open `http://localhost:5173` in your browser.**

## Available Scripts

- `npm run dev` / `yarn dev`: Start development server.
- `npm run build` / `yarn build`: Build for production.
- `npm run preview` / `yarn preview`: Preview production build.
- `npm run lint` / `yarn lint`: Run ESLint.

## Project Structure

```bash
.
├── public/                # Static assets and localization files
└── src/                   # Application source code
    ├── components/        # Reusable React components
    ├── config/            # Firebase configuration
    ├── contexts/          # React Context providers
    ├── hooks/             # Custom React hooks
    ├── services/          # API/service modules
    ├── types/             # TypeScript type definitions
    ├── utils/             # Utility functions
    ├── index.css          # Global CSS
    ├── i18n.ts            # Localization setup
    ├── App.tsx            # Main app and routes
    └── main.tsx           # App entry point
```
