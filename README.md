# DevTinder 🚀

DevTinder is a full-stack, real-time networking and matching application built specifically for developers. It bridges the gap between social networking and professional collaboration by allowing developers to swipe, connect, match, and communicate in real-time. 

With advanced capabilities like OTP-based email verification, WhatsApp-style read receipts, and peer-to-peer WebRTC video calling, DevTinder provides a premium messaging and connection experience.

---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [Tech Stack Breakdown](#%EF%B8%8F-tech-stack-breakdown)
3. [Architecture & System Design](#%EF%B8%8F-architecture--system-design)
4. [In-Depth Feature Documentation](#-in-depth-feature-documentation)
    - [1. User Authentication Flow](#1-user-authentication-flow)
    - [2. The Matching Engine (Tinder-Style)](#2-the-matching-engine-tinder-style)
    - [3. Real-Time Chat & "WhatsApp-Style" Receipts](#3-real-time-chat--whatsapp-style-receipts)
    - [4. WebRTC Video/Audio Calling](#4-webrtc-videoaudio-calling)
5. [Directory Structure](#-directory-structure)
6. [Getting Started (Local Development)](#-getting-started-local-development)

---

## ✨ Core Features
- **Tinder-Style Swiping:** Browse developer profiles and express interest (`interested`) or skip (`ignored`). Mutually interested users become `accepted` matches.
- **Robust Authentication:** Secure JWT-cookie-based auth. Includes NodeMailer OTP verification for new signups and GitHub OAuth integration.
- **Real-Time Global Presence:** Instantly see who is currently `Online` and track users' exact `Last Seen` timestamps.
- **Advanced Chat Engine:** Integrated WebSockets for real-time messaging featuring WhatsApp-style receipt indicators (Single Grey Tick: Sent, Double Grey Tick: Delivered, Double Blue Tick: Seen) even handling bulk offline deliveries seamlessly.
- **WebRTC Video/Audio Calls:** Engage in fully integrated browser-to-browser peer calling across active chats via a global call overlay system.
- **Media Uploads:** Cloudinary integration for smooth profile picture uploading.

---

## 🛠️ Tech Stack Breakdown

### Frontend (Client)
- **Framework:** React 19 + Vite (Fast compilation, ES modules)
- **Styling:** Tailwind CSS v4 (Utility-first, responsive layouts, glassmorphism)
- **State Management:** React Context (for global Socket & User scopes) & React Router DOM v7 (Routing)
- **Communication:** Axios (HTTP client for REST APIs), Socket.io-client (Real-time events)

### Backend (Server)
- **Framework:** Node.js + Express.js 5
- **Database:** MongoDB + Mongoose (Schema validation, aggregation pipelines)
- **Authentication:** JSON Web Tokens (JWT), bcrypt (password hashing), Nodemailer (OTP emails)
- **Real-Time:** Socket.io v4 (Rooms, Global broadcasting, Signaling Server for WebRTC)
- **File Storage:** Cloudinary (Profile image processing)

---

## ⚙️ Architecture & System Design

The application follows a standard **MERN (MongoDB, Express, React, Node)** architecture enhanced by an asynchronous **Socket.io** layer running parallel to the REST API.

- **REST API (Express):** Handles state-heavy and secure operations (Authentication, Database Queries, Match State mutations, Profile uploading).
- **Socket / WebSockets (Socket.io):** Handles volatile, high-speed ephemeral data (Typing status, Real-time message streaming, Presence heartbeats, WebRTC SDP Signaling).
- **Security:** The backend relies heavily on `cookie-parser` to validate HTTP-only JWT cookies on every protected route. Socket connections are tied directly into the presence map upon successful client initialization.

---

## 📚 In-Depth Feature Documentation

### 1. User Authentication Flow
- **Signup with OTP:** New users provide an email. The server generates a random 6-digit OTP, stores it in memory (or a temporary collection), and dispatches it via Nodemailer. Once the client prompts and validation passes, the real user document is inserted into the MongoDB `User` collection.
- **GitHub OAuth:** Users can bypass manual signup via GitHub OAuth. The server fetches their GitHub profile, maps the first/last names and avatars, and mints an auth cookie.
- **JWT Cookies:** Login issues an `httpOnly` secure token expiring in several days. All authenticated API calls intercept this cookie via `authMiddleware`.

### 2. The Matching Engine (Tinder-Style)
The core connection loop is executed via the `connectionRequest` schema:
- **Statuses:** `ignored`, `interested`, `accepted`, `rejected`.
- **Feed (`GET /feed`):** Aggregates profiles. It systematically filters out the current user, any users they heavily interacted with previously (already sent a connection request), and any users who have blocked/rejected them.
- **Requests (`GET /user/requests/received`):** View incoming `interested` requests and transition them to `accepted`. 
- **Matches (`GET /user/connections`):** When two developers are paired (A sent `interested`, B clicked `accepted`), they open a permanent two-way channel unlocking the chat features.

### 3. Real-Time Chat & "WhatsApp-Style" Receipts
The messaging framework runs synchronously over MongoDB and asynchronously over Socket.io.
- **Data Model:** A message contains `senderId`, `receiverId`, `text`, and `status: ["sent", "delivered", "seen"]`.
- **Socket Rooms:** Two users in an active pair join a unique, dynamically sorted room string: `[userA, userB].sort().join("_")` to ensure mutual namespace delivery.
- **Delivery Math Phase 1 (Online & In View):** Message is parsed, saved as `sent`, broadcast to the room. The receiver's client immediately issues a `markMessagesSeen` event. The sender instantly upgrades to Double Blue Ticks.
- **Delivery Math Phase 2 (Online but outside chat):** A global `incomingMessageAlert` gets captured by the root layout. It issues a local `messageDelivered` hook and spawns a Toast pushing single grey ticks to Double Grey ticks.
- **Delivery Math Phase 3 (Offline Catchup):** When User B boots up the application after being offline, the `userConnected` socket listener queries MongoDB for any `sent` payloads aimed at User B. It bulk-updates them to `delivered` and fires a `bulkMessageStatusUpdate` back to User A's active socket, seamlessly granting them their desired Double Grey Ticks locally.

### 4. WebRTC Video/Audio Calling
The app features an uninterrupted context layer (`CallOverlay.jsx`) allowing calls to float over the UI.
- **Signaling Server:** Uses Socket.io to transfer initial "Offers" and "Answers".
- **ICE Candidates:** Once connections are initiated, active IP routing parameters are routed between the callers (`iceCandidate` listener).
- **Streams:** Renders standard HTML5 `<video>` blocks capturing local navigator streams.

---

## 📁 Directory Structure

```text
d:\DevTinder
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable units (CallOverlay, Buttons)
│   │   ├── layout/             # Root views (Body layer)
│   │   ├── pages/              # Primary Routes (Login, Feed, Profile, Chat)
│   │   ├── utils/              # Contexts (SocketContext), Axios configurations
│   │   ├── index.css           # Tailwind v4 globals & utilities
│   │   └── App.jsx             # React Router DOM mappings
│   ├── package.json
│   └── vite.config.js
│
├── Server/                     # Node/Express Backend
│   ├── src/
│   │   ├── config/             # DB execution & socket.io signaling logic
│   │   ├── models/             # Mongoose Schemas (user, message, connectionRequest)
│   │   ├── middleware/         # authentication locks
│   │   ├── routes/             # Isolated Express Routers (auth, chat, profile, request)
│   │   └── app.js              # Server entry point
│   ├── .env                    # Cloudinary & MongoDB URI variables
│   └── package.json
```

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- MongoDB connection string (Atlas or Local)
- Cloudinary credentials (for image uploads)

### 2. Environment Variables
Create a `.env` in the `Server` directory containing:
```env
PORT=3000
DB_CONNECTION_SECRET=mongodb://your_mongo_url
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

### 3. Execution
Open two terminal instances.

**Terminal 1 (Backend):**
```bash
cd Server
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
npm run dev
```

Navigate to `http://localhost:5173` to view the application.

---
*Generated by Antigravity API Assistant during development and enhancements.*
