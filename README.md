# 🎮 Game Center

A full-stack web application for casual gaming with real-time chat lobbies. Built as a Lerna-based monorepo, Game Center combines Node.js/Express backend with React/MUI frontend to deliver a lightweight and fast gaming experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## 🌟 Features

### 🔐 Authentication & Security
- **Firebase Authentication** with Google OAuth and Email/Password login
- **Session Management** using stateless JWT cookies (no `express-session`/`memorystore`)
- **Security Middleware** including `helmet`, rate limiting, and input sanitization
- **Cookie-based Authentication** with secure parsing

### 🎯 Gaming Experience
- **2048 Game** - Classic tile-sliding puzzle game
- **Tombala (Turkish Bingo)** - Traditional lottery-style game
- **Real-time Lobbies** with WebSocket support (max 4 participants per lobby)
- **Game Statistics** and leaderboards with Firebase Realtime Database
- **Achievement System** with progress tracking

### 💬 Social Features
- **Real-time Chat** in game lobbies with WebSocket integration
- **User Profiles** with avatar and display name support
- **Friend System** (in development)
- **Push Notifications** using Browser Notification API

### 🎨 User Interface
- **Material-UI v6** component-based architecture
- **Dark/Light Theme** toggle with persistent settings
- **Responsive Design** optimized for desktop and mobile
- **Progressive Web App (PWA)** with offline support
- **Internationalization** (English & Turkish) using `react-i18next`

### 📊 Data Management
- **Firestore Database** for user profiles and game data
- **Firebase Realtime Database** for live leaderboards
- **Context API & React Query** for state management
- **Data Tables** with `react-material-table`
- **Number Formatting** with `react-number-format`

## 🏗️ Architecture

### Monorepo Structure
Built with **Lerna** for managing multiple packages in a single repository:

```
Game-Center/
├── packages/
│   ├── game-center-backend/     # Node.js/Express API server
│   ├── game-center-frontend/    # React/MUI web application
│   ├── game-2048/              # 2048 game package
│   └── game-tombala/           # Tombala game package
├── lerna.json                  # Lerna configuration
├── package.json               # Root package configuration
└── README.md                  # This file
```

### Technology Stack

**Backend (Node.js v22+)**
- **Express.js** - Web application framework
- **WebSocket** - Real-time communication
- **Firebase Admin SDK** - Authentication and database
- **Session Management** - Stateless JWT cookies (no `express-session`/`memorystore`)
- **Security** - `helmet`, `compression`, `morgan`, `cookie-parser`

**Frontend (React 18)**
- **React 18** with Hooks and Context API
- **Material-UI v6** - Component library
- **React Router v6** - Client-side routing
- **React Query** - Server state management
- **i18next** - Internationalization
- **PWA Support** - Service worker and manifest

**Database & Services**
- **Firebase Authentication** - User management
- **Firestore** - Document database
- **Firebase Realtime Database** - Live data sync
- **Firebase Cloud Storage** - File storage

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js v22** or higher
- **Yarn** package manager
- **Firebase Project** with configured services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mtgsoftworks/Game-Center.git
   cd Game-Center
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Configuration**

   Copy the example environment files and configure them:

   **Backend Configuration**
   ```bash
   cp packages/game-center-backend/.env.example packages/game-center-backend/.env
   ```

   Edit `packages/game-center-backend/.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   
   # Firebase Service Account (JSON string)
   GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account","project_id":"..."}'
   
   # Firebase Configuration
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=1:123456789:web:abcdef
   FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
   FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

   **Frontend Configuration**
   ```bash
   cp packages/game-center-frontend/.env.example packages/game-center-frontend/.env
   ```

   Edit `packages/game-center-frontend/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   
   # Firebase Configuration (same as backend)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### Development

1. **Start the Backend Server**
   ```bash
   cd packages/game-center-backend
   yarn dev
   ```

2. **Start the Frontend Application** (in a new terminal)
   ```bash
   cd packages/game-center-frontend
   yarn start
   ```

3. **Access the Application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001/api](http://localhost:3001/api)

## 🧪 Testing

### Unit Tests
Run unit tests using Jest and React Testing Library:
```bash
yarn test
```

### End-to-End Tests
Run E2E tests using Cypress:
```bash
yarn workspace game-center-frontend cypress open
```

### Test Coverage
Generate test coverage reports:
```bash
yarn test --coverage
```

## 🐳 Docker Deployment

### Backend Container

1. **Build the Docker Image**
   ```bash
   docker build -t game-center-backend ./packages/game-center-backend
   ```

2. **Run the Container**
   ```bash
   docker run -d \
     -e GOOGLE_APPLICATION_CREDENTIALS_JSON="<SERVICE_ACCOUNT_JSON>" \
     -e FIREBASE_API_KEY="your_api_key" \
     -e FIREBASE_PROJECT_ID="your_project_id" \
     -p 3001:3001 \
     game-center-backend
   ```

### Frontend Deployment

1. **Build for Production**
   ```bash
   cd packages/game-center-frontend
   yarn build
   ```

2. **Deploy Static Files**
   Deploy the `build/` directory to any static hosting service:
   - **Netlify**: Drag and drop or connect Git repository
   - **Vercel**: Import project from Git
   - **AWS S3 + CloudFront**: Upload to S3 bucket with CloudFront distribution

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Game Endpoints
- `GET /api/games` - List available games
- `GET /api/games/:gameId/lobbies` - Get game lobbies
- `POST /api/games/:gameId/lobbies` - Create new lobby
- `PUT /api/lobbies/:lobbyId` - Update lobby
- `DELETE /api/lobbies/:lobbyId` - Delete lobby

### Statistics Endpoints
- `GET /api/games/stats/aggregate` - Get aggregated game statistics
- `GET /api/leaderboard/:gameId` - Get game leaderboard

### WebSocket Events
- `join_lobby` - Join a game lobby
- `leave_lobby` - Leave a game lobby
- `chat_message` - Send chat message
- `game_action` - Send game action

## 🎮 Game Development

### Adding New Games

Games are managed as separate packages in the monorepo. To add a new game:

1. **Create Game Package**
   ```bash
   mkdir packages/game-new-game
   cd packages/game-new-game
   npm init -y
   ```

2. **Implement Game Logic**
   ```javascript
   // packages/game-new-game/src/index.js
   export const GameComponent = () => {
     // Game component implementation
   };
   
   export const gameConfig = {
     name: 'New Game',
     description: 'Description of the new game',
     minPlayers: 1,
     maxPlayers: 4,
     // Other game configuration
   };
   ```

3. **Register in Main Application**
   Add the game to the main application's game registry.

### Game Package Structure
```
packages/game-example/
├── src/
│   ├── components/          # React components
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   └── index.js            # Main export
├── package.json            # Package configuration
└── README.md              # Game-specific documentation
```

## 🔧 Configuration

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication, Firestore, and Realtime Database

2. **Configure Authentication**
   - Enable Google and Email/Password providers
   - Set up authorized domains

3. **Database Rules**
   Configure Firestore and Realtime Database security rules according to your requirements.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FIREBASE_API_KEY` | Firebase API key | ✅ |
| `FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Service account JSON | ✅ |
| `PORT` | Backend server port | ❌ (default: 3001) |
| `NODE_ENV` | Environment mode | ❌ (default: development) |

## 📱 Progressive Web App (PWA)

Game Center is built as a PWA with:
- **Offline Support** - Basic functionality works without internet
- **App Manifest** - Installable on mobile devices
- **Service Worker** - Background sync and caching
- **Push Notifications** - Real-time game and chat notifications

### Installing as PWA
1. Open the application in a supported browser (Chrome, Firefox, Safari)
2. Look for the "Install" prompt or "Add to Home Screen" option
3. Follow the browser-specific installation process

## 🌐 Internationalization

The application supports multiple languages:
- **English (en)** - Default language
- **Turkish (tr)** - Complete translation

### Adding New Languages

1. **Create Translation Files**
   ```bash
   # Add new language files
   packages/game-center-frontend/src/locales/es.json
   ```

2. **Configure i18next**
   Add the new language to the i18next configuration in `src/i18n/index.js`.

3. **Update Language Selector**
   Add the new language option to the language selector component.

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Game-Center.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Follow Coding Standards**
   - Use ESLint and Prettier for code formatting
   - Write unit tests for new features
   - Follow the existing code structure
   - Add comprehensive comments in Turkish for complex logic

4. **Submit Pull Request**
   - Ensure all tests pass
   - Include detailed description of changes
   - Reference any related issues

### Coding Standards

- **JavaScript/React**: Follow Airbnb style guide
- **Commit Messages**: Use conventional commit format
- **Documentation**: Update README and technical docs
- **Testing**: Maintain test coverage above 80%

### Project Structure Guidelines

- **Backend**: Follow MVC pattern
- **Frontend**: Use component-based architecture
- **Games**: Implement as separate packages
- **Shared Code**: Place in common utilities

## 📋 Roadmap

### Upcoming Features

- [ ] **Tournament System** - Organized competitive play
- [ ] **Spectator Mode** - Watch games in progress
- [ ] **Advanced Friend System** - Friend requests and management
- [ ] **Voice Chat** - WebRTC-based voice communication
- [ ] **Mobile Apps** - React Native applications
- [ ] **More Games** - Chess, Checkers, Card games
- [ ] **Admin Dashboard** - Game and user management
- [ ] **Analytics** - Detailed game analytics and insights

### Technical Improvements

- [ ] **GraphQL API** - Replace REST with GraphQL
- [ ] **TypeScript Migration** - Full TypeScript support
- [ ] **Microservices** - Split backend into microservices
- [ ] **Redis Caching** - Improve performance with Redis
- [ ] **Kubernetes Deployment** - Container orchestration
- [ ] **CI/CD Pipeline** - Automated testing and deployment

## 🐛 Troubleshooting

### Common Issues

**1. Firebase Connection Errors**
```
Error: Firebase configuration is invalid
```
- Verify all Firebase environment variables are set correctly
- Check Firebase project settings and API keys
- Ensure service account JSON is properly formatted

**2. WebSocket Connection Failed**
```
WebSocket connection failed
```
- Check if backend server is running on correct port
- Verify firewall settings allow WebSocket connections
- Ensure CORS is properly configured

**3. Build Errors**
```
Module not found: Error: Can't resolve 'package-name'
```
- Run `yarn install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && yarn install`
- Check for version conflicts in package.json

**4. Authentication Issues**
```
Firebase Auth: User not authenticated
```
- Verify Firebase Authentication is enabled
- Check authentication provider configuration
- Ensure authorized domains include your development/production URLs

### Getting Help

- **Documentation**: Read `TECHNICAL_DOCUMENTATION.md` for detailed technical information
- **Issues**: Create an issue on GitHub with detailed problem description
- **Discussions**: Use GitHub Discussions for questions and feature requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase** - Backend services and authentication
- **Material-UI** - React component library
- **Lerna** - Monorepo management
- **React Team** - Frontend framework
- **Express.js** - Backend framework
- **Socket.IO** - Real-time communication

## 📧 Contact

- **GitHub**: [@mtgsoftworks](https://github.com/mtgsoftworks)
- **Project Repository**: [Game-Center](https://github.com/mtgsoftworks/Game-Center)

---

**Game Center** - Where gaming meets community. Built with ❤️ using modern web technologies.