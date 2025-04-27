# Game Center

Game Center is a full-stack web application for playing casual games and managing real-time lobbies with chat. It uses a monorepo structure powered by Lerna and includes:

- **Backend**: Node.js + Express with Firebase Auth (Google & email/password), Firestore database and WebSocket for chat.
- **Frontend**: React with MUI, Redux Toolkit, React Query, React Router, i18n (react-i18next), and PWA support.
- **Games**: Lerna-managed packages (e.g., 2048 and Tombola) lazy-loaded into the React app.

---

## v0.2 (2025-04-27)
- Lobby editing and deletion (`src/pages/EditLobbyPage.js`).
- Event scheduling with date-time pickers & countdown timers.
- Lobby listing and creation in `GameDetailPage.js`.
- Chat notifications via browser Notification API.
- Extended i18n support (English & Turkish).

---
## Features

- 🔐 User authentication (Google & Email/Password) via Firebase Auth
- 💬 Real-time chat in lobbies (max 4 participants) via WebSocket
- 🎮 Play 2048 and Tombola with instructions and images
- 🎨 Light/Dark theme toggle in settings
- 📦 Component-driven architecture using Material-UI
- ⚛️ State management: Redux Toolkit & React Query
- 🛡️ Security: helmet, rate limiting, input sanitization
- 🌐 Progressive Web App (offline support + manifest)
- 🧪 Testing: Jest + React Testing Library (unit), Cypress (E2E)
- 📚 Documentation: Storybook for components, `TECHNICAL_DOCUMENTATION.md`

---

## Getting Started

### Prerequisites

- Node.js v18 or later
- Yarn package manager
- Firebase project with Service Account JSON

### Installation

```bash
# Clone repository
git clone https://github.com/mtgsoftworks/Game-Center.git
cd Game-Center

# Install all packages via Lerna
yarn install
```

### Environment Variables

Copy example env files and fill your values:

```bash
# Backend
cp package/game-center-backend/.env.example package/game-center-backend/.env
# Frontend
cp package/game-center-frontend/.env.example package/game-center-frontend/.env
```

#### Backend `.env`
```
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS_JSON='<PASTE_FIREBASE_SERVICE_ACCOUNT_JSON>'
FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
FIREBASE_DATABASE_URL=YOUR_FIREBASE_DATABASE_URL
FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
MAILTRAP_TOKEN=YOUR_MAILTRAP_TOKEN
MAILTRAP_SENDER_EMAIL=YOUR_MAILTRAP_SENDER_EMAIL
MAILTRAP_SENDER_NAME=Game Center
```

#### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
VITE_FIREBASE_DATABASE_URL=YOUR_FIREBASE_DATABASE_URL
VITE_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
```

### Running Locally

```bash
# Backend
cd package/game-center-backend
yarn dev

# Frontend (in a new terminal)
cd package/game-center-frontend
yarn start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

---

## Testing

```bash
# Run backend & frontend unit tests
yarn test

# Run end-to-end tests with Cypress
yarn workspace game-center-frontend cypress open
```

---

## Deployment

### Backend

- Build Docker image:
  ```bash
  docker build -t game-center-backend ./package/game-center-backend
  ```
- Run container with env:
  ```bash
  docker run -d \
    -e GOOGLE_APPLICATION_CREDENTIALS_JSON="<JSON>" \
    -e FIREBASE_* \
    -e MAILTRAP_* \
    -p 3001:3001 game-center-backend
  ```

### Frontend

- Build static files:
  ```bash
  cd package/game-center-frontend
  yarn build
  ```
- Deploy `build/` folder to any static hosting (Netlify, Vercel, S3+CloudFront).

---

## Contributing

Please read [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md) and refer to coding standards.

1. Fork the repo
2. Create a feature branch
3. Follow linting and testing guidelines
4. Submit a pull request

---

## License

MIT License