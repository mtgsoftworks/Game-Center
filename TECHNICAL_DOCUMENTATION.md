# Game Center - Technical Documentation

## v0.2 (2025-04-27)
- Lobby editing and deletion (`src/pages/EditLobbyPage.js`).
- Event scheduling with date-time pickers and countdown timers.
- Lobby listing and creation in `GameDetailPage.js`.
- Chat notifications via browser Notification API.
- Extended i18n support (English & Turkish).

## v0.3 (2025-04-27)
- Switched from Redux Toolkit to Context API for state management.
- Upgraded MUI to v6 and replaced HTML tags with MUI components.
- Implemented numeric formatting (`react-number-format`) on HomePage.
- Replaced standard MUI Table with `react-material-table` in LobbyManagementPage.
- Integrated `express-session` & `memorystore` for session handling in backend.
- Added backend middleware: cookie-parser, body-parser, helmet, compression, morgan.
- Set Node.js engine requirement to >=22 in `package.json`.

## Overview
Game Center is a monorepo containing:
- **Backend**: Node.js >=22 + Express server using Firebase Auth & Firestore.
- **Frontend**: React app with Context API, React Query, MUI v6 for UI, i18n, PWA support.
- **Games**: Lerna-managed packages (e.g., 2048, Tombola).

## Stack Updates (v0.3)
- **Backend**: Node.js >=22, Express, express-session, memorystore, body-parser, cookie-parser, helmet, compression, morgan
- **Frontend**: React 18, MUI v6, Context API, React Query, React Router v6, i18n, react-material-table, react-number-format
- **Games**: Lerna-managed packages (`game-2048`, `game_tombala`) lazy-loaded via React `lazy`/`Suspense`

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
- **Email**: production can swap provider
- **Websocket**: WS server for real-time chat
- **Middleware**: security (helmet, compression, cors), sanitization, rate-limit, cookie-parser, body-parser, morgan
- **Session**: express-session, memorystore

#### Key Components
- `server.js`: initializes Firebase Admin, Firestore, routes, error handlers.
- `controllers/`: business logic for auth, games, lobbies.
- `middleware/authMiddleware.js`: verifies Firebase ID token.
- `routes/`: API endpoints under `/api/auth`, `/api/games`, `/api/lobbies`.
- `utils/sendEmail.js`: 

### Frontend
- **Framework**: React, CRA + custom overrides
- **UI**: Material UI (MUI v6)
- **State**: Context API for global, React Query for API caching
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
