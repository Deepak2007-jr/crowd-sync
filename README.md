# Crowd-Sync: Campus Event Evacuation Guide

> **Every Second Counts. Every Exit Matters.**

Crowd-Sync is an intelligent campus event safety and emergency evacuation management system designed to assist students, visitors, event organizers, and campus safety personnel during emergencies such as fire accidents, stampede hazards, overcrowding, and blocked exits.

The system models the campus as a weighted graph and leverages a dynamic cost-weighted **Dijkstra Shortest Path Algorithm** to recommend the safest available evacuation route by evaluating real-time simulated crowd congestion, active hazard alerts, and verified physical corridor blockages.

---

## ⚠️ Academic Prototype Notice
This is an academic prototype. All crowd density figures, sensor telemetry, and evacuation routes are simulated for college project demonstration purposes. In a real emergency, official campus safety personnel, emergency sirens, and verified responder instructions take priority. Do not present simulated routes as guaranteed safe real-world paths.

---

## 🚀 Key Features

1. **Interactive Campus SVG Map**:
   - High-contrast, responsive campus digital twin rendering academic blocks, auditoriums, cafeterias, sports grounds, and outdoor walkways.
   - 4 Emergency Exits (Exit A North, Exit B East, Exit C South, Exit D West).
   - 2 Designated Safe Assembly Points (Central Oval Lawn AP-1, South Athletic Lawn AP-2).
   - Color-coded crowd density heat indicators (Green: Low, Yellow: Moderate, Orange: High, Red: Critical).
   - Blocked corridor rendering with animated danger hazard stripes and warning badges.

2. **Dynamic Dijkstra Evacuation Engine**:
   - Cost function: $\text{Route Cost} = \text{Distance} + \text{Congestion Penalty} + \text{Risk Penalty}$.
   - Blocked corridors are assigned $\infty$ cost and excluded from path calculations.
   - Optional mobility preference filter for step-free wheelchair ramp verification.
   - Calculates optimal and secondary alternative candidate routes with clear human-readable explanations.
   - Safe fallback warning when all routes are obstructed (never fabricates an unverified route).

3. **Role-Based Access Control (RBAC)**:
   - **Student / Visitor**: View campus map, crowd density indicators, active emergency alerts, nearest exits, request evacuation routes, report field hazards.
   - **Event Organizer**: Schedule campus events, monitor expected attendance against venue capacity limits, track venue hazards.
   - **Campus Safety Officer (Admin)**: Broadcast and resolve emergency alerts, review student hazard reports, adjust simulated zone occupancies in real-time, trigger emergency bottleneck scenarios, export safety audit CSV reports.

4. **1-Click Demonstration Login**:
   - Convenient 1-click role switcher buttons on the login screen for seamless presentation.

5. **Crowd Monitoring & Historical Trends**:
   - Recharts-powered 6-hour historical crowd trend area chart.
   - Live zone-wise capacity progress bars with automated capacity overload warnings.

6. **Safety Analytics & Export**:
   - Pie charts of emergency alerts by severity.
   - Bar charts of reported hazards by category.
   - Instant downloadable CSV campus safety audit reports.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 + Vite
  - TypeScript
  - Tailwind CSS
  - Lucide React (Icons)
  - React Router DOM v6
  - Recharts (Analytics & telemetry visualization)
  - Axios (REST API communication)
- **Backend**:
  - Python 3.13 / 3.11+
  - FastAPI
  - Pydantic v2
  - SQLAlchemy ORM 2.0
  - SQLite (with zero-change migration path to PostgreSQL)
  - PyJWT & PBKDF2-HMAC-SHA256 (Secure password hashing)
  - Dynamic Dijkstra Algorithm Implementation
- **Testing**:
  - Pytest (Backend API & algorithm testing)
  - TypeScript Compiler (`tsc`) & Vite build validator

---

## 🔑 Demo Accounts & Credentials

The system comes pre-seeded with realistic fictional campus data and accounts:

| Role | Name | Email | Password |
|---|---|---|---|
| **Campus Safety Officer (Admin)** | Chief Officer Sarah Jenkins | `admin@campus.edu` | `admin123` |
| **Event Organizer** | Prof. Marcus Vance | `organizer@campus.edu` | `organizer123` |
| **Student / Visitor** | Alex Chen | `student@campus.edu` | `student123` |

*Tip: You can also use the instant 1-click buttons on the Login page to authenticate directly without typing.*

---

## 🧪 Demonstration Scenario Walkthrough

To showcase the dynamic rerouting capabilities for your college mini-project presentation:

1. **Baseline State**:
   - Log in as **Student / Visitor**.
   - Navigate to **Evacuation Guide** (`/evacuation`).
   - Select **Grand Auditorium** as the starting point.
   - Notice the engine recommends **Exit A (North Main)** as the closest exit with minimal congestion.

2. **Trigger Emergency Bottleneck**:
   - Log in as **Campus Safety Officer (Admin)** or switch role on the dashboard.
   - In the **Safety Simulation & Demo Controls** panel, click:
     `[Simulate Auditorium Surge & Blocked Path]`
   - **Observed Behavior**:
     - Auditorium occupancy immediately spikes to **96% (Critical Overload)**.
     - The North connector corridor is marked with red dashed lines and a **BLOCKED** badge.
     - A Critical Emergency Alert is broadcasted to all active screens.

3. **Observe Automated Dijkstra Rerouting**:
   - Return to the **Evacuation Guide** or observe the map live.
   - The route engine recalculates instantly:
     - The blocked North corridor is excluded from calculations.
     - The Auditorium's critical crowd multiplier deprioritizes adjoining pathways.
     - The engine highlights a safe alternative route to **Exit C (South Athletic Gate)** or **Exit B (East Gate)**.
     - The explanation box clearly states: *"Recommended over Exit A because Corridor #7 is marked BLOCKED and Auditorium is experiencing critical 96% congestion."*

4. **Reset Scenario**:
   - In the simulation controls, click `[Reset Demo Scenario]` to unblock all corridors and restore normal crowd numbers.

---

## 💻 Installation and Execution Instructions

### Prerequisites
- Node.js (v18+ or v20+)
- Python (v3.10+ to v3.13+)
- Git

### 1. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with campus data and demo users
python scripts/seed_data.py

# Start the FastAPI backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be running at: `http://127.0.0.1:8000`  
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
Open a new terminal window:
```bash
# Navigate to the frontend directory
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server
npm run dev
```
Frontend web application will be accessible at: `http://localhost:5173`

---

## 📂 Project Directory Structure

```
crowd-sync/
├── backend/
│   ├── app/
│   │   ├── algorithms/
│   │   │   └── dijkstra.py          # Dynamic Dijkstra graph routing algorithm
│   │   ├── api/
│   │   │   ├── alerts.py            # Emergency alert broadcast & resolution
│   │   │   ├── analytics.py         # KPIs, telemetry & CSV export
│   │   │   ├── auth.py              # JWT authentication & registration
│   │   │   ├── crowd.py             # Live crowd status & simulation triggers
│   │   │   ├── evacuation.py        # Safe route recommendation endpoint
│   │   │   ├── events.py            # Campus event management CRUD
│   │   │   ├── hazards.py           # Field hazard reporting & review
│   │   │   ├── map.py               # Campus map graph & corridor blockage
│   │   │   └── zones.py             # Campus zone occupancy endpoints
│   │   ├── core/
│   │   │   ├── config.py            # JWT secrets, CORS & settings
│   │   │   ├── dependencies.py      # RBAC role checker dependencies
│   │   │   └── security.py          # PBKDF2 password hashing & token decode
│   │   ├── models/
│   │   │   └── models.py            # 11 SQLAlchemy ORM models
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic v2 validation models
│   │   ├── services/
│   │   │   ├── crowd_simulation.py  # Occupancy thresholds & scenario scripts
│   │   │   └── evacuation_engine.py # High-level graph routing service
│   │   ├── tests/
│   │   │   ├── test_auth.py         # Auth & token validation tests
│   │   │   ├── test_crowd.py        # Crowd telemetry & occupancy tests
│   │   │   ├── test_evacuation.py   # Dijkstra routing & fallback tests
│   │   │   └── test_hazards.py      # Hazard reporting & event tests
│   │   ├── database.py              # SQLAlchemy connection & sessionmaker
│   │   └── main.py                  # FastAPI assembly, CORS & router mounting
│   ├── scripts/
│   │   └── seed_data.py             # Realistic campus database seeder
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Navbar, Footer, AlertBanner, MetricCard, Modal, StatusBadge
│   │   │   └── map/                 # CampusMap, MapLegend, NodeDetailsPanel, RoutePanel, SimulationControls
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Auth state, login, register & 1-click demo
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.tsx  # Admin/Organizer/Student command center layout
│   │   │   └── MainLayout.tsx       # Public portal layout with alert ticker
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx   # Safety officer command center
│   │   │   ├── AlertsPage.tsx       # Emergency alert board
│   │   │   ├── AnalyticsPage.tsx    # Recharts telemetry & CSV export
│   │   │   ├── AssemblyPointsPage.tsx# Assembly ground directory
│   │   │   ├── CrowdMonitoringPage.tsx# Live crowd density board
│   │   │   ├── DashboardRouter.tsx  # Dynamic role dispatcher
│   │   │   ├── EvacuationPage.tsx   # Dynamic Dijkstra routing guide
│   │   │   ├── EventsPage.tsx       # Campus events schedule
│   │   │   ├── HazardsPage.tsx      # Hazard report log
│   │   │   ├── LandingPage.tsx      # Hero & emergency instructions
│   │   │   ├── LoginPage.tsx        # Sign-in with 1-click demo buttons
│   │   │   ├── MapExplorerPage.tsx  # Interactive campus digital twin
│   │   │   └── RegisterPage.tsx     # Student self-registration
│   │   ├── services/                # Axios API services
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── App.tsx                  # React Router configuration
│   │   ├── index.css                # Tailwind base & route animations
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/
│   ├── academic-deliverables.md     # Abstract, DFDs, Mermaid diagrams & flowcharts
│   ├── api-documentation.md         # Full REST API documentation
│   ├── architecture.md              # Multi-tier system architecture
│   ├── database-design.md           # Mermaid ER diagram & schema descriptions
│   └── testing-checklist.md         # Automated and manual verification checklist
└── README.md
```

---

## 🧪 Running Automated Tests

Run backend pytest suite:
```bash
cd backend
.\venv\Scripts\python -m pytest -v app/tests
```
*Expected: 10 passed tests across authentication, occupancy validations, Dijkstra routing, hazard creation, and event capacity restrictions.*

Run frontend production build validation:
```bash
cd frontend
npm run build
```
*Expected: TypeScript compiler checks pass with 0 errors and bundles static assets.*

---

## 🛡️ License & Academic Ethics
Developed for college academic evaluation and demonstration. All sample datasets represent fictional campus configurations.
