# AI Career Advisor

CareerAI is an AI-powered career guidance platform built to help users discover suitable career paths based on their education, skills, interests, and career goals.

## Features

- AI Career Recommendations — Personalized career suggestions based on user profiles.
- Skill Gap Analysis — Identifies skills users may need to develop for their target careers.
- Learning Roadmap — Provides structured steps for career development and learning progress tracking.
- User Authentication — Secure registration and login using JWT and password hashing.
- Analysis History — View and manage previous career analyses.
- PDF Export — Export career analysis reports.
- Super admin role with extra privileges
- Protected routes with auth, admin and super admin middleware
- Automatic handling of expired sessions on the client (auth interceptor)
- Server-side logging

## Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | React, Vite, CSS            |
| Backend   | Node.js, Express            |
| Database  | MongoDB with Mongoose       |
| Auth      | JWT                         |
| AI        | LLM API (see `aiService.js`) |

## Project Structure

```
AI-Career-Advisor/
├── public/                 # Static assets
├── src/                    # React frontend
│   ├── pages/              # Home, Login, Register, Dashboard, AdminDashboard
│   ├── utils/              # Auth interceptor
│   ├── App.jsx
│   └── main.jsx
├── server/                 # Express backend
│   ├── config/             # Database connection
│   ├── middleware/         # auth, admin, super admin
│   ├── models/             # User, Analysis
│   ├── routes/             # auth, ai, admin
│   ├── services/           # AI service, logger
│   ├── .env.example
│   └── server.js
├── index.html
├── vite.config.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB database (local or MongoDB Atlas)
- An API key for the AI provider used in `server/services/aiService.js`

### 1. Clone the repository

```bash
git clone https://github.com/Noman-Abrar/AI-Career-Advisor.git
cd AI-Career-Advisor
```

### 2. Install dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 3. Configure environment variables

Copy the example file and fill in your own values:

```bash
cd server
cp .env.example .env
```

Never commit your real `.env` file. It is already listed in `.gitignore`.

### 4. Run the app

Start the backend:

```bash
cd server
npm start
```

In a second terminal, start the frontend from the project root:

```bash
npm run dev
```

The frontend runs on the Vite dev server (usually `http://localhost:5173`).

## Scripts

Frontend (project root):

- `npm run dev` starts the Vite dev server
- `npm run build` creates a production build
- `npm run lint` runs ESLint

Backend (`server/`):

- `npm start` starts the Express server

## Roles

- **User**: register, log in, request AI career analysis, view history
- **Admin**: everything a user can do, plus access to the admin dashboard
- **Super Admin**: full control, including managing admins

## Deployment

- Frontend: Vercel or Netlify
- Backend: Render, Railway or similar
- Set the same environment variables from `.env.example` in your hosting platform's settings instead of uploading a `.env` file.

## Author

Noman Abrar — [GitHub](https://github.com/Noman-Abrar)
