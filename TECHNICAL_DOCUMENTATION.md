# Game Center - Technical Documentation

## v0.2 (2025-04-27)
- Lobby editing and deletion (`src/pages/EditLobbyPage.js`).
- Event scheduling with date-time pickers and countdown timers.
- Lobby listing and creation in `GameDetailPage.js`.
- Chat notifications via browser Notification API.
- Extended i18n support (English & Turkish).

## Overview
Game Center is a monorepo containing:
- **Backend**: Node.js + Express server using Firebase Auth & Firestore.
- **Frontend**: React app with Redux Toolkit, React Query, MUI for UI, i18n, PWA support.
- **Games**: Lerna-managed packages (e.g., 2048, Tombola).

## Architecture

### Monorepo Structure
```
/game-center
├── package.json    # Lerna config
├── lerna.json
├── TECHNICAL_DOCUMENTATION.md
├── README.md
├── package/
│   ├── game-center-backend/
│   ├── game-center-frontend/
│   └── games/
│       └── game_2048/
│       └── game_tombala/
```

### Backend
- **Framework**: Express.js
- **Auth**: Firebase Admin SDK (service account JSON), token verification middleware
- **Data**: Firestore collections (`games`, `lobbies`, `chatMessages`, `users`)
- **Email**: Mailtrap for development, production can swap provider
- **Websocket**: WS server for real-time chat
- **Middleware**: security (helmet, compression, cors), sanitization, rate-limit

#### Key Components
- `server.js`: initializes Firebase Admin, Firestore, routes, error handlers.
- `controllers/`: business logic for auth, games, lobbies.
- `middleware/authMiddleware.js`: verifies Firebase ID token.
- `routes/`: API endpoints under `/api/auth`, `/api/games`, `/api/lobbies`.
- `utils/sendEmail.js`: wraps MailtrapClient.

### Frontend
- **Framework**: React, CRA + custom overrides
- **UI**: Material UI (MUI)
- **State**: Redux Toolkit for global, React Query for API caching
- **Routing**: React Router v6
- **i18n**: react-i18next
- **PWA**: service worker, manifest
- **Testing**: Jest, React Testing Library, Cypress
- **Docs**: Storybook for component library

#### Key Components
- `src/pages`: HomePage, Auth, Lobby pages, GameDetailPage
- `src/components`: Navbar, Button, Modal, Chat, etc.
- `src/services`: axios instance, authService, gameService, lobbyService
- `src/routes/Routes.js`: protected routes based on user context
- `src/contexts/UserContext.js`: manages auth state

## Deployment
- **CI/CD**: GitHub Actions runs tests, lints, builds
- **Backend**: containerized, deploy to Heroku/GCP
- **Frontend**: Netlify/Vercel or static on S3 + CloudFront

## Testing
- Unit: Jest + RTL
- E2E: Cypress tests under `cypress/`

## Contribution Guidelines
See [README.md](README.md#contributing) for details.
