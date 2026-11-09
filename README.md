# AlphaX

AlphaX is a feature-rich, scalable Learning Management System built to bridge the gap between instructors and students. It offers a seamless environment for course creation, content delivery, progress tracking, and interactive assessments.

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```
*(or run `npm install` inside both `client` and `server` folders)*

### 2. Seed Initial Database (Optional)
If your MongoDB database is empty, seed demo courses and educator:
```bash
npm run seed
```

### 3. Start Both Client and Server
Run both frontend and backend concurrently from the root directory:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)

### Individual Commands
- **Frontend only**: `npm run dev:client`
- **Backend only**: `npm run dev:server`
- **Build Frontend**: `npm run build`
