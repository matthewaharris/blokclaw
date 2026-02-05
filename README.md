# BlokClaw

Open-source API registry for AI agents. Discover, register, and integrate APIs designed for autonomous agent consumption.

## Overview

BlokClaw is a centralized registry where:
- **API providers** can register their services with agent-friendly contracts
- **AI agents** can discover and integrate new capabilities programmatically
- **Developers** can browse available APIs and integration examples

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT authentication

**Frontend:**
- React + Vite
- Tailwind CSS

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 14+

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/blokclaw.git
cd blokclaw

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Run database migrations
cd backend
npm run migrate

# Start development servers
npm run dev  # Backend on :3000
cd ../frontend
npm run dev  # Frontend on :5173
```

## Project Structure

```
blokclaw/
├── backend/          # Express API
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── models/   # Database models
│   │   ├── middleware/
│   │   └── server.js
│   └── migrations/   # DB migrations
├── frontend/         # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── public/
└── docs/            # Documentation
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Status:** 🚧 Early development (MVP in progress)
