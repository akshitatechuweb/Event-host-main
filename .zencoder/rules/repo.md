---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary
A monorepo containing a full-stack event hosting application with a Node.js/Express backend and a Next.js frontend.

## Repository Structure
- **backend/**: Node.js server with Express and MongoDB.
- **frontend/**: Next.js application with TypeScript and Tailwind CSS.

## Projects

### Backend
**Configuration File**: `backend/package.json`

#### Language & Runtime
**Language**: JavaScript (Node.js)  
**Type**: Module (ESM)  
**Framework**: Express.js

#### Dependencies
**Main Dependencies**:
- express
- mongoose (MongoDB)
- jsonwebtoken (Auth)
- bcryptjs
- multer (File upload)
- pdfkit (PDF generation)
- qrcode
- razorpay (Payments)

#### Build & Installation
```bash
cd backend
npm install
npm run dev
```

#### Main Files
- **Entry Point**: `backend/index.js`
- **Models**: `backend/models/`
- **Controllers**: `backend/controllers/`

### Frontend
**Configuration File**: `frontend/package.json`

#### Language & Runtime
**Language**: TypeScript  
**Framework**: Next.js 16  
**UI Library**: React 19

#### Dependencies
**Main Dependencies**:
- next
- react
- axios
- tailwindcss
- lucide-react
- @radix-ui/react-*

#### Build & Installation
```bash
cd frontend
npm install
npm run dev
# Production build
npm run build
npm start
```

#### Main Files
- **App Router**: `frontend/app/`
- **Components**: `frontend/components/`
