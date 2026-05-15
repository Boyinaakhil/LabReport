# Enterprise Lab Reports Module (Angular 18 & Node.js/FHIR)

This repository contains the complete implementation of the enterprise-grade Lab Reports Module for a Patient Portal using Angular 18+, TailwindCSS, Express.js, MongoDB, and HL7 FHIR (HAPI).

## Architecture Overview

The system is designed using a multi-tier microservices architecture:

1. **Frontend (Angular 18)**: 
   - Uses Standalone Components.
   - Designed with TailwindCSS and Angular Material for a modern, responsive UI.
   - Implements advanced features such as Glassmorphism UI, AI Insights mockups, and dynamic tables.
   - Includes pages: Dashboard, Lab Reports Data Table, and Detailed View.

2. **Backend (Node.js & Express)**:
   - Written in TypeScript for type safety.
   - Acts as a gateway to the MongoDB database for local state (user preferences, bookmarks, metadata).
   - Integrates directly with the HAPI FHIR R4 sandbox API to fetch dynamic health data (Patients, DiagnosticReports, Observations).

3. **Database (MongoDB)**:
   - Manages Users, Roles (Patient, Doctor, Admin), and Report Metadata that aren't natively supported by basic FHIR schemas.

## Requirements
- Node.js 18+
- Angular CLI 18
- Docker Desktop
- MongoDB (if running locally without Docker)

## Installation & Running Locally

### Running with Docker (Recommended)
This will spin up the backend, frontend, and a local MongoDB instance.
```bash
docker-compose up --build
```
Access the application at `http://localhost`.

### Running manually
**1. Backend:**
```bash
cd backend
npm install
npm run build
npm start
```
(Ensure MongoDB is running on localhost:27017 or update `.env`). Backend runs on port 3000.

**2. Frontend:**
```bash
cd frontend
npm install
npm run start
```
Frontend runs on port 4200.

## Key Features Implemented

✅ **Dashboard Analytics**: Shows AI insights and total normal/abnormal reports.
✅ **Interactive Data Table**: Professional enterprise table with actions and status badges.
✅ **FHIR Integration**: Abstracted FHIR service to hit `http://hapi.fhir.org/baseR4`.
✅ **Responsive Design**: Full Tailwind integration.
✅ **Secure Architecture**: Environment variables, Docker configurations, JWT structure.

## Folder Structure

```
LabReportUI/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts (Server entry)
│   │   ├── config/db.ts
│   │   ├── models/ (User, ReportMetadata)
│   │   ├── routes/ (FHIR, Reports)
│   │   └── services/ (FHIR Integration Service)
│   └── package.json
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── src/
    │   ├── app/
    │   │   ├── layouts/ (Main Layout with Sidebar)
    │   │   ├── pages/ (Dashboard, Lab Reports, Report Detail)
    │   │   └── services/ (FHIR Service)
    │   ├── styles.scss (Global theme)
    │   └── main.ts
    ├── tailwind.config.js
    └── package.json
```

## Bonus Features Included
- **AI Health Insights**: UI representation of AI-generated insights based on biomarker trends.
- **Glassmorphic UI Elements**: Used in custom layout classes.
- **Critical Alert System**: Highlighted indicators on both Dashboard and Detailed View.
