# Conexion — Server

Express + WebSocket matchmaking server for the Conexion app.  
A single process serves both **HTTP REST** routes and **WebSocket** connections on the same port.

## Setup

```bash
cd server
npm install
```

## Run

```bash
# Production
npm start

# Development (auto-restarts on file changes — requires Node 18+)
npm run dev
```

Runs on **port 3001** by default. Override with environment variables:

```bash
PORT=4000 ORIGIN=https://yourapp.com npm start
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | HTTP + WS port |
| `ORIGIN` | `http://localhost:3000` | Allowed CORS origin |

## REST Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness probe — returns `{ status, uptime }` |
| `GET` | `/api/stats` | Live stats — online users, queue depth, active sessions |

### Example

```bash
curl http://localhost:3001/health
# { "status": "ok", "uptime": 42.1 }

curl http://localhost:3001/api/stats
# { "online": 4, "queued": 1, "activeSessions": 1, "timestamp": "..." }
```

## WebSocket

Connect to **`ws://localhost:3001/ws`**.

### Client → Server

| Message | Description |
|---|---|
| `{ type: "queue", interests: string[] }` | Join matchmaking queue |
| `{ type: "cancel" }` | Leave queue |
| `{ type: "message", text: string }` | Send a chat message to partner |
| `{ type: "skip" }` | Skip current partner and re-queue |
| `{ type: "end" }` | End the session cleanly |
| `{ type: "ping" }` | Keep-alive |

### Server → Client

| Message | Description |
|---|---|
| `{ type: "queued", position, online }` | You're in the queue |
| `{ type: "matched", sharedInterests, sessionId }` | Matched with a partner |
| `{ type: "message", text, ts }` | Message from partner |
| `{ type: "partner_left" }` | Partner disconnected |
| `{ type: "online_count", count }` | Live online user count (broadcast) |
| `{ type: "pong" }` | Response to ping |

## Matchmaking Algorithm

Users are scored by shared interests. The server always picks the highest-scoring candidate from the queue. Users with no interests selected match anyone (wildcard, score = 0).
