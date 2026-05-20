<img width="1440" height="1330" alt="image" src="https://github.com/user-attachments/assets/dc7cb385-db69-42b0-9a7a-e69629af6963" />
⚽ Tiki Taka Toe — Full-Stack Guide (API-Football Powered)

A real-time football-themed Tic-Tac-Toe game built with:

🧠 NestJS (Backend)
🎨 Angular (Frontend)
⚽ API-Football v3 (Player Data Source)
🐘 PostgreSQL (Database)
🔌 Socket.io (Real-time gameplay)
🌟 Why API-Football?
Feature	API-Football (Free Plan)
Cost	Free forever
Players	Millions across 1200+ leagues
Player Data	Name, nationality, clubs, trophies, stats, photo
Rate Limit	100 requests/day
Auth	Simple API key (header)

🔗 Sign up: https://dashboard.api-football.com/register

🧠 Key Idea

Instead of calling the API during gameplay:

✔ You sync players ONCE → store in PostgreSQL
✔ Game runs entirely on your database
✔ Fast, scalable, offline-friendly
✔ No API quota wasted during matches

🏗 Architecture Overview
                    ┌─────────────────────────────────────┐
                    │         API-Football (v3)           │
                    │  https://v3.football.api-sports.io  │
                    └───────────────┬─────────────────────┘
                                    │ REST (100 req/day free)
                                    ▼
                    ┌─────────────────────────────────────┐
                    │         NestJS Backend               │
                    │                                     │
                    │  ┌───────────────────────────────┐  │
                    │  │ PlayerSyncService            │  │
                    │  │ (fetch → cache Postgres)     │  │
                    │  ├───────────────────────────────┤  │
                    │  │ GameService + WebSocket      │  │
                    │  │ Real-time game engine        │  │
                    │  └───────────────────────────────┘  │
                    └───────────────┬─────────────────────┘
                                    │ REST + WebSocket
                                    ▼
                    ┌─────────────────────────────────────┐
                    │         Angular Frontend             │
                    │                                     │
                    │  GameBoard Component                │
                    │  Cell Component                     │
                    │  PlayerInput Component              │
                    │  Scoreboard                        │
                    └─────────────────────────────────────┘
📁 Project Structure
tiki-taka-toe/
│
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │
│   │   ├── config/
│   │   │   └── api-football.config.ts
│   │
│   │   ├── player/
│   │   │   ├── player.module.ts
│   │   │   ├── player.entity.ts
│   │   │   ├── player.service.ts
│   │   │   ├── player.controller.ts
│   │   │   └── player-sync.service.ts   # Sync from API-Football
│   │
│   │   ├── game/
│   │   │   ├── game.module.ts
│   │   │   ├── game.controller.ts
│   │   │   ├── game.service.ts
│   │   │   ├── game.gateway.ts
│   │   │   └── game.entity.ts
│   │
│   │   └── grid/
│   │       └── grid-template.service.ts
│   │
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── game-board/
│   │   │   │   ├── cell/
│   │   │   │   ├── player-input/
│   │   │   │   └── scoreboard/
│   │   │   │
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── app.routes.ts
│   │   │   └── app.config.ts
│   │   │
│   │   ├── environments/
│   │   │   └── environment.ts
│   │   │
│   │   └── main.ts
│   │
│   ├── package.json
│   └── angular.json
│
└── README.md
⚙️ Environment Variables (.env)

Backend .env example:

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=tiki_taka

API_FOOTBALL_KEY=your_api_key_here
API_FOOTBALL_BASE=https://v3.football.api-sports.io

PORT=3000
🚀 Features
Backend (NestJS)
Player sync from API-Football
PostgreSQL caching layer
Game state engine
WebSocket real-time updates
REST API for search + game creation
Frontend (Angular)
Real-time game board
Player search with autocomplete
Turn-based gameplay
Timer system
Win/loss tracking UI
🧩 Core Modules
Module	Purpose
Player Module	Handles API-Football sync + search
Game Module	Game creation + rules
Grid Module	Dynamic conditions for Tic Tac Toe logic
WebSocket Gateway	Real-time gameplay sync
🔌 API Endpoints
Players
GET  /player/search?q=messi
POST /player/sync
GET  /player/test-api
Game
POST /game/create
🎮 Gameplay Flow
Game starts (Angular frontend)
Backend creates grid + game session
Players select a cell
Player types a football player name
Backend validates against PostgreSQL
WebSocket broadcasts result
Turn switches automatically
🧪 Setup Instructions
Backend
cd backend
npm install
npm run start:dev
Frontend
cd frontend
npm install
ng serve
⚠️ Important Notes
API-Football is used ONLY for syncing players
Gameplay does NOT call external API
PostgreSQL is the single source of truth
WebSocket is required for real-time updates
🏁 Result

A fully real-time football trivia game with:

Live multiplayer logic
Smart player validation
Scalable backend architecture
API-powered football intelligence
