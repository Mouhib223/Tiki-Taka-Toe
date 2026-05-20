<img width="1440" height="1330" alt="image" src="https://github.com/user-attachments/assets/dc7cb385-db69-42b0-9a7a-e69629af6963" />
⚽ Tiki Taka Toe — Full Stack Football Game

A real-time multiplayer Tic-Tac-Toe–style football trivia game powered by API-Football (v3), built with NestJS (backend) and Angular (frontend).

🚀 Overview

Tiki Taka Toe transforms classic Tic-Tac-Toe into a football knowledge battle:

Each cell requires naming a valid football player
Players are validated using a real football database
Real-time gameplay using WebSockets
Fully dynamic grid based on football attributes (clubs, nationality, position, etc.)
🌍 Why API-Football?

We use API-Football v3 as the single source of truth for players.

Feature	API-Football
Data	Millions of players from 1200+ leagues
Fields	Name, nationality, clubs, stats, photo
Free Plan	100 requests/day
Auth	Simple API key

🔗 Sign up: https://dashboard.api-football.com/register

🧠 Architecture
                    API-Football (v3)
                           │
                           ▼
                  ┌───────────────────┐
                  │   NestJS Backend  │
                  │                   │
                  │ PlayerSyncService │ ← fetch + cache players
                  │ GameService       │ ← game logic
                  │ WebSocket Gateway │ ← real-time sync
                  └─────────┬─────────┘
                            │ REST + WS
                            ▼
                  ┌───────────────────┐
                  │ Angular Frontend  │
                  │ GameBoard UI      │
                  │ Player Input UI   │
                  └───────────────────┘
💡 Key Concept

Instead of calling API-Football during gameplay:

✔ We sync players ONCE into PostgreSQL
✔ Game logic runs locally on our database
✔ No API quota wasted during matches
✔ Fast + scalable + offline-safe backend

📁 Project Structure
tiki-taka-toe/
├── backend/
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── config/
│   │   │   └── api-football.config.ts
│   │   ├── player/
│   │   │   ├── player.module.ts
│   │   │   ├── player.entity.ts
│   │   │   ├── player.service.ts
│   │   │   └── player-sync.service.ts   # API-Football sync engine
│   │   ├── game/
│   │   │   ├── game.module.ts
│   │   │   ├── game.controller.ts
│   │   │   ├── game.service.ts
│   │   │   ├── game.gateway.ts
│   │   │   └── game.entity.ts
│   │   └── grid/
│   │       └── grid-template.service.ts
│   └── .env
│
└── frontend/
    └── src/app/
        ├── components/
        │   ├── game-board/
        │   ├── cell/
        │   ├── player-input/
        │   └── scoreboard/
        └── services/
⚙️ Backend Setup (NestJS)
1. Install dependencies
npm install
2. Create .env

Inside /backend/.env:

Database credentials (PostgreSQL)
API-Football key
Backend port
3. Run database

Make sure PostgreSQL is running (Docker or local).

4. Start backend
npm run start:dev
🧪 Test API connection
GET http://localhost:3000/player/test-api

Expected:

{
  "success": true,
  "data": { ...API-Football response... }
}
🔄 Sync players from API-Football
POST http://localhost:3000/player/sync

This will:

Fetch leagues
Pull players
Store them in PostgreSQL
Build local cache for gameplay
🎮 Frontend Setup (Angular)
1. Install dependencies
npm install
2. Start Angular app
ng serve

Frontend runs at:

http://localhost:4200
🔌 Real-Time Features
WebSocket connection (Socket.IO)
Live board updates
Turn synchronization
Instant validation of player answers

Events:

joinRoom
makeMove
gameUpdated
playerJoined
skipTurn
🧩 Game Rules
Players take turns
Each cell = football challenge
Must enter valid player from database
Condition-based grid (clubs, nationality, position)
First to align wins
🛠 Tech Stack
Backend
NestJS
TypeORM / PostgreSQL
Socket.IO
Axios
API-Football v3
Frontend
Angular (Standalone)
RxJS
Socket.IO Client
Tailwind CSS
🔐 Environment Variables
Backend .env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=tiki_taka

API_FOOTBALL_KEY=your_api_key_here
API_FOOTBALL_BASE=https://v3.football.api-sports.io

PORT=3000
⚠️ Common Issues
❌ API returns 403
API key incorrect
Header must be: x-apisports-key
❌ Docker not running
Start Docker Desktop
Restart terminal
❌ Angular build errors
Delete node_modules
Run npm install again
📌 Future Improvements
AI-assisted player suggestions
Ranked matchmaking system
Tournament mode
Global leaderboard
Mobile responsive UI
Anti-cheat validation layer
👨‍💻 Author

Built as a full-stack learning + portfolio project demonstrating:

Real-time systems
External API integration
Scalable backend design
Modern Angular architecture
