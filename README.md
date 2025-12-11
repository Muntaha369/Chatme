# Chat Me

> Simple chat application (client + server) using WebSockets (Socket.IO), React (Vite) and MongoDB.

This repository contains two main parts:
- `client/` — React frontend built with Vite, Tailwind and Zustand.
- `server/` — Node/Express backend with Socket.IO and MongoDB (Mongoose).

## Tech stack / libraries used

- Frontend
  - React (via Vite)
  - react-router-dom
  - socket.io-client
  - axios
  - Zustand (state management)
  - Tailwind CSS (styles)
  - framer-motion, lucide-react (UI extras)

- Backend
  - Node.js + Express
  - socket.io
  - mongoose (MongoDB)
  - bcrypt, jsonwebtoken (auth)
  - multer (file upload)
  - dotenv

- Infrastructure
  - MongoDB
  - Docker / Docker Compose (optional, runs server + client + mongo)

## Repository layout

```
client/        # React app (Vite)
server/        # Express + Socket.IO server
docker-compose.yml
README.md
```

## Prerequisites

- Node.js (v18+ recommended)
- npm (or yarn)
- Docker & Docker Compose (optional, required only if you want to run via Docker)

## Environment variables

- Server: create a `.env` file in `server/` (a sample `.env` is used in the repo). Minimum variables:

```
PORT=3002
URI=mongodb://127.0.0.1:27017/socket
JWT_SECRET_KEY=your_jwt_secret_here
```

- Client: the frontend expects `VITE_SERVER_URL` so it can reach the backend. You can set this either via `.env` in `client/` or export it when running. Example `.env` for client (Vite env keys must start with `VITE_`):

```
VITE_SERVER_URL=http://localhost:3002
```

## Run locally (without Docker)

1. Clone the repo and open a terminal at the repository root.

2. Start the backend server

```powershell
cd server
npm install
# create .env with the variables shown above (or copy .env if present)
npm start   # uses nodemon (app.js)
```

3. Start the frontend

```powershell
cd client
npm install
# create client/.env with VITE_SERVER_URL if needed
npm run dev
```

4. Open the app

- Frontend (Vite) default: http://localhost:5173
- Backend API / Socket server: http://localhost:3002

Notes:
- Start the server before the client so that the client can connect to the socket server at `VITE_SERVER_URL`.
- If you run MongoDB locally, make sure it is available on the `URI` you specify in the server `.env`.

## Run with Docker Compose

This repository includes a `docker-compose.yml` that builds the client and server images and launches a MongoDB container.

From the repository root run:

```powershell
docker-compose up --build
```

Services:
- `server` — built from `./server`, exposed on port `3002`
- `client` — built from `./client`, exposed on port `5173`
- `mongo` — official MongoDB image, exposed on `27017` and persisted to a Docker volume

The compose file sets `VITE_SERVER_URL=http://localhost:3002` for the client. If you run Docker on a non-local host or inside a VM, update the URL accordingly.

To stop and remove containers:

```powershell
docker-compose down -v
```

## Build & production preview

You can build the client for production and run the server against the built static files if you wire them together. Currently the project runs the Vite dev server during development.

To build the client:

```powershell
cd client
npm run build

# serve the built files or integrate into the server as static assets (not configured by default)
```

## Troubleshooting / common issues

- Invalid Hook Call / Hooks errors: ensure you import hooks from React and only call hooks inside components or custom hooks. Avoid multiple React copies — check `npm ls react` in both `client` and root if you see these errors.
- `node_modules` tracked by git: if you accidentally committed `node_modules`, remove from git with `git rm -r --cached node_modules` and commit after ensuring `.gitignore` contains `node_modules/`.
- Vite dev server shows module export errors: check your imports; React hooks (`useState`, etc.) must be imported from `'react'`, not from your store.
- If the client can't connect to the server when running in Docker, verify `VITE_SERVER_URL` in `docker-compose.yml` or in your client `.env`.

## Useful commands

- Start server (dev): `cd server && npm start`
- Start client (dev): `cd client && npm run dev`
- Run everything with Docker: `docker-compose up --build`
- Build client: `cd client && npm run build`

## Contributing

Feel free to open issues or pull requests. Keep front-end and back-end changes reasonably scoped and include run steps for any manual testing required.

## License

This project is released under the MIT License — see the `LICENSE` file for details.

Badge: ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
