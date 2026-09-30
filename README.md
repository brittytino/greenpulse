# GreenPulse — Greenhouse Agricultural Monitoring Dashboard

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38b2ac.svg)](https://tailwindcss.com/)
[![AWS Serverless](https://img.shields.io/badge/AWS-Amplify%20|%20Lambda%20|%20DynamoDB-orange.svg)](https://aws.amazon.com/)

A modern, lightweight, production-ready **Greenhouse Agricultural Monitoring Dashboard** engineered for urban agricultural communities. The system continuously tracks micro-climates across 8 specialized greenhouse beds (BED-01 to BED-08), monitoring **Soil Moisture**, **Temperature**, and **Humidity** in real time.

Built to be completely deployed on AWS serverless infrastructure:
```
React / Vite (AWS Amplify) ➔ Amazon API Gateway ➔ AWS Lambda (TypeScript) ➔ Amazon DynamoDB
```

> **Viva / Demonstration Ready**: Operates immediately out of the box for local development **without requiring AWS credentials or local DynamoDB installation**. It features an integrated local API Gateway simulator and autonomous local cache fallback.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Key Features](#key-features)
5. [Project Folder Structure](#project-folder-structure)
6. [Agronomic Thresholds](#agronomic-thresholds)
7. [Local Development Setup](#local-development-setup)
8. [Environment Variables](#environment-variables)
9. [REST API Endpoints](#rest-api-endpoints)
10. [Amazon DynamoDB Data Model](#amazon-dynamodb-data-model)
11. [CRUD Lifecycle Flow](#crud-lifecycle-flow)
12. [Automated Testing](#automated-testing)
13. [AWS Deployment Preparation Guide](#aws-deployment-preparation-guide)

---

## 1. Project Overview

GreenPulse was developed for urban agricultural communities to eliminate guesswork in greenhouse micro-climate management. Different crops—from heirloom tomatoes and strawberries to culinary herbs and microgreens—have distinct moisture, thermal, and humidity requirements. 

GreenPulse provides:
- **Instant Health Status**: Categorizes conditions into `Healthy`, `Warning`, `Critical`, or `Offline` using agronomic thresholds.
- **Manual & Sensor Ingestion**: Accommodates automated telemetry while allowing growers to log manual soil calibrations.
- **Real-Time Polling & Telemetry Simulation**: Built-in 20-second background synchronization with an interactive demonstration mode for sensor data simulation.
- **Faulty Data Management**: Full ability to edit readings or permanently delete sensor outliers.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                         │
│  React 18 + Vite + TypeScript + Tailwind CSS + Lucide Icons │
│  Hosted on: AWS Amplify Hosting                             │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                       │
│  Amazon API Gateway (REST API / HTTP API with CORS)        │
│  Routes: /readings, /readings/{id}                         │
└──────────────────────────────┬──────────────────────────────┘
                               │ Proxy Integration
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     COMPUTE / HANDLER                       │
│  Single AWS Lambda Function: "GreenPulseAPI" (Node.js 20.x) │
│  Handler: dist/handlers/index.handler                       │
│  Dispatches based on method, path, and parameters:          │
│  - GET    /readings (supports ?bedId=...)                   │
│  - GET    /readings/{id}                                    │
│  - POST   /readings                                         │
│  - PUT    /readings/{id}                                    │
│  - DELETE /readings/{id}                                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ AWS SDK v3 DynamoDBDocumentClient
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                         │
│  Amazon DynamoDB Single-Table (`GreenhouseReadings`)        │
│  - Partition Key: id (String)                               │
│  - GSI: bedId-timestamp-index (PK: bedId, SK: timestamp)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

- **Frontend**:
  - **React 18.3**: Component-driven reactive user interface.
  - **Vite 5.4**: Lightning-fast ES module bundler.
  - **TypeScript 5.6**: Strict type safety across components and services.
  - **Tailwind CSS 3.4**: Clean, modern agriculture-inspired design system.
  - **Lucide React**: Crisp semantic iconography.
  - **Custom SVG Trend Charts**: Zero-dependency, lightweight, ultra-crisp responsive trend visualization.
- **Backend**:
  - **TypeScript + NodeNext**: Strict type-checking and modern ESM syntax.
  - **AWS Lambda Types (`@types/aws-lambda`)**: Native APIGatewayProxyEvent and APIGatewayProxyResult structures.
  - **AWS SDK for JavaScript v3 (`@aws-sdk/lib-dynamodb`)**: DocumentClient for optimized DynamoDB marshalling.
  - **Express 4.21 (Local Runner)**: Offline proxy simulating API Gateway locally on `http://localhost:3000`.
- **Testing**:
  - **Vitest 2.1**: High-performance unit test runner.

---

## 4. Key Features

1. **Top Summary Cards**: Instant macroscopic metrics across all 8 monitored beds:
   - Total beds count and online bed status.
   - Aggregate Average Soil Moisture (%).
   - Aggregate Average Temperature (°C).
   - Aggregate Average Humidity (%).
   - Real-time count of Healthy, Warning, and Critical beds.
2. **Bed Monitoring Grid**:
   - Individual cards for beds `BED-01` through `BED-08` displaying crop names, greenhouse section (Alpha, Beta, Gamma), live telemetry values, individual metric status dots, and relative timestamp (`Updated 2 mins ago`).
   - One-click access to **Bed Details Modal** displaying statistical minimums, averages, maximums, and individual bed audit trails.
3. **Agronomic Trend Analysis**:
   - Interactive trend chart for Soil Moisture, Temperature, and Humidity.
   - Visual target zone highlighting optimal agronomic ranges.
   - Filterable across all beds combined or isolated by specific bed.
4. **Audit Reading History Table**:
   - Displays Bed, Date, Time, Soil Moisture, Temperature, Humidity, Source, Health Status, and Actions.
   - Integrated full-text search, bed filter dropdown, source filter (`sensor`, `manual`, `simulated`), date sorting toggle (`Newest First` / `Oldest First`), and pagination.
   - **Responsive Card View**: Automatically transforms into stacked mobile cards on smaller viewports.
5. **Add & Edit Reading Modals**:
   - Strict client- and server-side validation against agronomic boundaries.
   - Preserves reading ID and `createdAt` timestamp on updates, updating `updatedAt`.
6. **Safe Deletion Dialog**:
   - Confirmation dialog preventing accidental removals.
   - Immediate reactive UI update, stats recalculation, and toast feedback.
7. **Simulated Sensor Telemetry**:
   - Development toggle button in header to simulate automated field sensors transmitting live telemetry every few seconds.

---

## 5. Project Folder Structure

```
agri/
├── package.json              # Monorepo configuration and orchestrator scripts
├── vitest.config.ts          # Vitest testing configuration
├── shared/
│   └── types/
│       └── reading.ts        # Shared TypeScript domain contracts
├── frontend/
│   ├── package.json          # Frontend dependencies (React, Vite, Tailwind, Lucide)
│   ├── tsconfig.json         # Strict TypeScript configuration
│   ├── vite.config.ts        # Vite configuration and path aliases
│   ├── tailwind.config.js    # Agriculture color palette and typography tokens
│   ├── .env.example          # Environment variables template
│   ├── index.html            # Application entry HTML with SEO metadata
│   └── src/
│       ├── main.tsx          # React application mount
│       ├── App.tsx           # Main app component
│       ├── index.css         # Tailwind base and custom scrollbars
│       ├── types/            # Frontend interfaces
│       ├── config/
│       │   └── thresholds.ts # Centralized agronomic thresholds & bed metadata
│       ├── data/
│       │   └── mockReadings.ts# Seed realistic greenhouse telemetry
│       ├── services/
│       │   ├── api.ts        # API Gateway HTTP client
│       │   └── readingsService.ts # Service layer with local offline fallback
│       ├── hooks/
│       │   ├── useReadings.ts# Real-time state, polling timer & CRUD hooks
│       │   └── useToast.ts   # Notification toasts hook
│       ├── utils/
│       │   ├── dateUtils.ts  # ISO and relative time formatting
│       │   ├── statusUtils.ts# Status colors, badges, and icon helpers
│       │   └── validation.ts # Client validation functions
│       ├── layouts/
│       │   └── DashboardLayout.tsx
│       └── components/
│           ├── Header.tsx
│           ├── SummaryCards.tsx
│           ├── BedGrid.tsx
│           ├── BedCard.tsx
│           ├── BedDetailModal.tsx
│           ├── TrendCharts.tsx
│           ├── ReadingHistoryTable.tsx
│           ├── AddReadingModal.tsx
│           ├── EditReadingModal.tsx
│           ├── DeleteConfirmDialog.tsx
│           ├── ToastContainer.tsx
│           └── UI/
│               ├── Badge.tsx
│               ├── Button.tsx
│               ├── Card.tsx
│               ├── Input.tsx
│               └── Select.tsx
├── backend/
│   ├── package.json          # Backend dependencies (AWS SDK v3, Express, TS)
│   ├── tsconfig.json         # NodeNext TypeScript compilation
│   ├── .env.example          # Backend environment variables
│   └── src/
│       ├── config/
│       │   └── dynamodb.ts   # DynamoDB DocumentClient & fallback detector
│       ├── types/            # Backend DTOs & response contracts
│       ├── utils/
│       │   ├── response.ts   # Standardized API Gateway response builder
│       │   └── validation.ts # Backend validation & bounds checking
│       ├── services/
│       │   ├── memoryStore.ts# Local in-memory mock store
│       │   └── dynamodbService.ts # DynamoDB operations & local fallback
│       ├── handlers/         # Pure AWS Lambda handlers
│       │   ├── getReadings.ts
│       │   ├── getReadingById.ts
│       │   ├── createReading.ts
│       │   ├── updateReading.ts
│       │   ├── deleteReading.ts
│       │   └── index.ts
│       └── server.ts         # Local API Gateway simulator on port 3000
└── tests/
    ├── validation.test.ts    # Boundary & missing fields unit tests
    ├── status.test.ts        # Status calculation & threshold tests
    └── crud.test.ts          # Lambda handler CRUD lifecycle tests
```

---

## 6. Agronomic Thresholds

Thresholds are centralized in `frontend/src/config/thresholds.ts`:

| Metric | Healthy | Warning | Critical | Unit |
| :--- | :---: | :---: | :---: | :---: |
| **Soil Moisture** | 40% – 80% | 30%–39% or 81%–90% | < 30% or > 90% | `%` |
| **Temperature** | 20.0°C – 32.0°C | 16.0°C–19.9°C or 32.1°C–36.0°C | < 16.0°C or > 36.0°C | `°C` |
| **Air Humidity** | 40% – 80% | 30%–39% or 81%–90% | < 30% or > 90% | `%` |

**Bed Health Status Determination**:
1. If any metric is in `Critical` range ➔ Bed Status = `Critical`
2. Else if any metric is in `Warning` range ➔ Bed Status = `Warning`
3. Else if all metrics are in optimal range ➔ Bed Status = `Healthy`
4. If no reading received within 120 minutes ➔ Bed Status = `Offline`

---

## 7. Local Development Setup

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### Quick Start (Running Both Frontend and Backend)

1. **Install Dependencies**:
   ```bash
   # From the repository root:
   npm install
   npm install --prefix frontend
   npm install --prefix backend
   ```

2. **Start Backend API Simulator (Port 3000)**:
   ```bash
   npm run dev:backend
   ```
   *Runs the Express runner executing the exact AWS Lambda handlers.*

3. **Start Frontend Dev Server (Port 5173)** in a second terminal:
   ```bash
   npm run dev:frontend
   ```
   *Open [http://localhost:5173](http://localhost:5173) in your browser.*

> **Zero AWS Required**: If you only start the frontend without the backend (`npm run dev:frontend`), GreenPulse automatically operates using its built-in browser-side storage fallback.

---

## 8. Environment Variables

Create `.env` files from `.env.example` templates:

### Frontend (`frontend/.env`)
```bash
# In local development:
VITE_API_BASE_URL=http://localhost:3000

# When deployed to AWS, replace with your deployed API Gateway invoke URL:
# VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

### Backend (`backend/.env`)
```bash
PORT=3000
NODE_ENV=development

# AWS Configuration (when deploying to AWS or connecting to real AWS DynamoDB)
# If left unset, the backend will automatically use its built-in in-memory mock store
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=GreenhouseReadings
```

---

## 9. REST API Endpoints

All responses follow a consistent JSON schema:
- **Success (200 / 201)**: `{ "success": true, "data": <payload>, "message": "Optional feedback" }`
- **Error (400 / 404 / 500)**: `{ "success": false, "message": "Description", "errors": { ... } }`

| Method | Endpoint | Query / Body | Status Codes | Description |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/readings` | `?bedId=BED-01` | 200, 500 | List all readings (newest first), with optional bed filter. |
| `GET` | `/readings/{id}` | None | 200, 404, 500 | Fetch a specific sensor reading by its ID. |
| `POST` | `/readings` | `{ bedId, soilMoisture, temperature, humidity, timestamp?, source? }` | 201, 400, 500 | Record a new sensor reading. |
| `PUT` | `/readings/{id}` | `{ bedId?, soilMoisture?, temperature?, humidity?, timestamp? }` | 200, 400, 404, 500 | Update an existing reading while preserving ID and `createdAt`. |
| `DELETE` | `/readings/{id}` | None | 200, 404, 500 | Remove a reading permanently. |
| `GET` | `/health` | None | 200 | Diagnostic health check endpoint. |

---

## 10. Amazon DynamoDB Data Model

### Single-Table Design: `GreenhouseReadings`

The database schema utilizes an optimized single-table layout designed for low latency, predictable costs, and horizontal scalability:

```
Table: GreenhouseReadings
├── Partition Key (PK): id (String, UUID)
└── Global Secondary Index (GSI): bedId-timestamp-index
    ├── Partition Key: bedId (String)
    └── Sort Key: timestamp (String, ISO 8601)
```

### Item Attributes
| Attribute | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique identifier (e.g., `rdg-1790747931189-y7n3c`) |
| `bedId` | String | Greenhouse bed identifier (`BED-01` through `BED-08`) |
| `timestamp` | String | Reading measurement timestamp (ISO 8601 UTC) |
| `soilMoisture`| Number | Volumetric water content percentage (0.0 to 100.0) |
| `temperature` | Number | Ambient/soil temperature in degrees Celsius |
| `humidity` | Number | Relative humidity percentage (0.0 to 100.0) |
| `source` | String | Data source: `manual`, `sensor`, or `simulated` |
| `createdAt` | String | Record creation timestamp (immutable) |
| `updatedAt` | String | Record last modified timestamp |

### Supported Access Patterns
1. **Get Reading by ID (`GET /readings/{id}`)**: `GetItem` using `Key: { id }` (O(1) operation).
2. **Update Reading (`PUT /readings/{id}`)**: `PutItem` preserving `createdAt`.
3. **Delete Reading (`DELETE /readings/{id}`)**: `DeleteItem` using `Key: { id }`.
4. **Get Latest Readings for a Bed (`GET /readings?bedId=BED-01`)**: `Query` on GSI `bedId-timestamp-index` with `bedId = :bedId`, sorted descending by `timestamp`.
5. **Get All Readings for Overview (`GET /readings`)**: `Scan` with chronological sorting.

---

## 11. CRUD Lifecycle Flow

```
[ User Interaction ] 
        │
        ▼
[ readingsService.ts ] (Frontend)
        │ ➔ apiClient()
        ▼
[ API Gateway / Express Runner ]
        │ ➔ Converts Request to APIGatewayProxyEvent
        ▼
[ Lambda Handler (e.g. createReading.ts) ]
        │ 1. Parses JSON Body
        │ 2. Validates Ranges & Required Fields
        │ 3. Injects ID, createdAt, updatedAt
        ▼
[ dynamodbService.ts ]
        │ ➔ PutCommand to DynamoDB
        ▼
[ API Gateway Proxy Result ]
        │ ➔ Returns HTTP 201 with standardized JSON
        ▼
[ Frontend Hook: useReadings ]
        │ ➔ Triggers silent refetch & UI state update
        ▼
[ Toast Feedback Notification ]
```

---

## 12. Automated Testing

The project includes unit tests for input validation, threshold boundaries, status calculations, and full Lambda handler CRUD execution.

Run tests:
```bash
npm test
```

### Test Coverage Highlights:
- **`tests/validation.test.ts`**:
  - Valid reading payload validation.
  - Rejection of missing required fields (`bedId`, `soilMoisture`, `temperature`, `humidity`).
  - Rejection of out-of-bounds soil moisture (< 0% or > 100%).
  - Rejection of out-of-bounds humidity (< 0% or > 100%).
  - Rejection of invalid temperatures (< -20°C or > 65°C).
  - Validation of bed ID constraints (`BED-01` through `BED-08`).
- **`tests/status.test.ts`**:
  - Verification of Healthy, Warning, and Critical boundaries across all 3 metrics.
  - Precedence hierarchy: Critical > Warning > Healthy.
  - Offline condition evaluation for readings older than threshold.
- **`tests/crud.test.ts`**:
  - Lambda execution for `GET /readings`.
  - Lambda execution for `POST /readings` (verifies 201 Created and generated ID).
  - Lambda execution for `GET /readings/{id}`.
  - Lambda execution for `PUT /readings/{id}` (verifies preservation of ID and `createdAt`).
  - Lambda execution for `DELETE /readings/{id}` (verifies 200 OK and subsequent 404).
  - Bed filtering parameter verification.
  - Validation failure handling (verifies 400 Bad Request and error object).

---

## 13. AWS Deployment Preparation Guide

*(Note: Do not execute deployment now; this section documents the exact AWS configuration to be performed later.)*

### 1. Amazon DynamoDB Setup
1. Open the **DynamoDB Console** in your AWS region (e.g. `us-east-1`).
2. Create Table:
   - **Table name**: `GreenhouseReadings`
   - **Partition key**: `id` (String)
3. Create Global Secondary Index (GSI):
   - **Index name**: `bedId-timestamp-index`
   - **Partition key**: `bedId` (String)
   - **Sort key**: `timestamp` (String)
   - **Projected attributes**: All

### 2. Single AWS Lambda Function Setup (`GreenPulseAPI`)
1. Build and package the single backend Lambda ZIP:
   ```bash
   cd backend
   npm run build
   npm run package
   ```
   *This outputs `backend/GreenPulseAPI.zip` (lightweight, self-contained deployment package).*
2. In the AWS Lambda Console, create a function:
   - **Function name**: `GreenPulseAPI`
   - **Runtime**: Node.js 20.x (or 22.x)
   - **Architecture**: x86_64 or arm64
   - **Execution Role**: Attach policy with DynamoDB permissions:
     - `dynamodb:GetItem`
     - `dynamodb:PutItem`
     - `dynamodb:UpdateItem`
     - `dynamodb:DeleteItem`
     - `dynamodb:Scan`
     - `dynamodb:Query` on table `GreenhouseReadings` and index `bedId-timestamp-index`
3. Upload `backend/GreenPulseAPI.zip` in the Code tab.
4. Set **Runtime settings ➔ Handler** to:
   ```
   dist/handlers/index.handler
   ```
   *(or `handlers/index.handler`)*
5. Environment Variables:
   - `DYNAMODB_TABLE_NAME`: `GreenhouseReadings`
   - `AWS_REGION`: `us-east-1`

### 3. Amazon API Gateway Setup (Single Lambda Integration)
1. Create an **HTTP API** or **REST API** named `GreenPulse-API`.
2. Configure Integration:
   - Route `ANY /readings` ➔ Integration: Lambda `GreenPulseAPI`
   - Route `ANY /readings/{id}` ➔ Integration: Lambda `GreenPulseAPI`
   - *(Alternatively, use greedy proxy `{proxy+}` to route all API calls to `GreenPulseAPI`)*
3. Enable **CORS** on all routes (`Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`).
4. Deploy the API to a stage named `prod`. Note the Invoke URL (e.g. `https://xyz123.execute-api.us-east-1.amazonaws.com/prod`).

### 4. AWS Amplify Hosting (Frontend)
1. In the `frontend/` directory, update `.env`:
   ```bash
   VITE_API_BASE_URL=https://xyz123.execute-api.us-east-1.amazonaws.com/prod
   ```
2. In the AWS Amplify Console, choose **Host web app**, connect your Git repository, and specify the build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install --prefix frontend
       build:
         commands:
           - npm run build --prefix frontend
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
   ```
3. Deploy the application.
