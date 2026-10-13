# OS Process Management & CPU Scheduling Simulator

A full-stack, real-time web application converting the Java Swing CPU scheduling simulator into a modern web platform. Built for college Operating Systems coursework and local demonstration.

---

## 👥 Project Team Members & Contributions

| Member | Assigned Role | Key Responsibilities & Contributions |
| :--- | :--- | :--- |
| **Rishikesh Sah** | **Frontend Development** | Designed and built the React + TypeScript user interface, interactive cycle-accurate Gantt chart timeline, algorithm comparison charts using Recharts, and dark navy design system. |
| **Pappu Kumar** | **Backend Development** | Implemented the Spring Boot REST API, core scheduling algorithms (FCFS, SJF, SRTF, Priority, Round Robin), CPU idle time calculation, and metrics evaluation. |
| **Shresth Pathak** | **Integration, Testing & Documentation** | Authored comprehensive JUnit 5 test suites (20 test cases), verified algorithm edge cases and preemption logic, integrated REST APIs with Axios, and prepared system documentation. |

---

## 🚀 Key Features

1. **Dashboard Overview**:
   - Live KPI cards: Total Processes, NEW processes, READY queue, TERMINATED processes.
   - Quick action shortcuts (Load Benchmark Set, Launch Simulation, Benchmark All).
   - Real-time backend connection health indicator in the header.

2. **Process Lifecycle Management**:
   - Create processes with validation (PID, Arrival Time $\ge$ 0, Burst Time $>$ 0, Priority $\ge$ 1).
   - Process states: `NEW`, `READY`, `TERMINATED`.
   - Visual FIFO Ready Queue monitor.
   - One-click batch actions: "Move All to Ready", "Load Benchmark Set (P1-P5)", "Clear All".

3. **Interactive CPU Scheduling Simulator**:
   - Supports 5 scheduling algorithms:
     - **FCFS** (First-Come, First-Served — Non-preemptive)
     - **SJF** (Shortest Job First — Non-preemptive)
     - **SRTF** (Shortest Remaining Time First — Preemptive)
     - **Priority** (Non-preemptive, lower numerical value = higher priority)
     - **Round Robin** (Preemptive with configurable Time Quantum)
   - **Interactive Gantt Chart**: Color-coded process execution blocks, CPU idle blocks, cycle durations, and time ticks.
   - **Performance Metrics**: Average Waiting Time (WT), Average Turnaround Time (TAT), Average Response Time (RT), CPU Utilization percentage, and Total Clock cycles.
   - **Detailed Breakdown Table**: PID, Arrival Time, Burst Time, Start Time, Completion Time, Turnaround Time, Waiting Time, Response Time.

4. **Multi-Algorithm Comparison Screen**:
   - Benchmark all 5 algorithms simultaneously with a single click.
   - Highlights best performers: Best WT, Best TAT, and Best RT.
   - Interactive bar charts comparing WT, TAT, and RT per algorithm.
   - Side-by-side comparative table.

5. **About & Documentation Page**:
   - Comprehensive team member breakdown.
   - Full technical architecture overview.
   - OS mathematical formulas and definitions.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + TypeScript
  - Vite 8
  - Lucide React (Icons)
  - Recharts (Data visualization)
  - Axios (REST client with interceptors)
  - Custom CSS Design System (Dark Navy theme)
- **Backend**:
  - Java 21 / 24 SE
  - Spring Boot 3.3.4 (Spring Web, Validation)
  - Jakarta Bean Validation
  - JUnit 5 & Mockito
  - Apache Maven 3.9
- **Database**:
  - In-memory data store / H2 database for simulation history

---

## 📁 Project Folder Structure

```
os-process-scheduling-simulator/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/osscheduler/
│       │   │   ├── OsSchedulerApplication.java
│       │   │   ├── config/CorsConfig.java
│       │   │   ├── controller/
│       │   │   │   ├── ProcessController.java
│       │   │   │   └── SchedulingController.java
│       │   │   ├── dto/
│       │   │   │   ├── CreateProcessRequest.java
│       │   │   │   ├── ProcessResponse.java
│       │   │   │   ├── SchedulingRequest.java
│       │   │   │   ├── SchedulingResponse.java
│       │   │   │   ├── ProcessResult.java
│       │   │   │   ├── GanttSegment.java
│       │   │   │   ├── CompareRequest.java
│       │   │   │   └── CompareResponse.java
│       │   │   ├── model/
│       │   │   │   ├── Process.java
│       │   │   │   ├── ProcessState.java
│       │   │   │   └── SchedulingHistory.java
│       │   │   ├── repository/
│       │   │   │   ├── ProcessRepository.java
│       │   │   │   └── SchedulingHistoryRepository.java
│       │   │   ├── scheduler/SchedulingAlgorithms.java
│       │   │   ├── service/SchedulingService.java
│       │   │   └── exception/GlobalExceptionHandler.java
│       │   └── resources/application.properties
│       └── test/
│           └── java/com/osscheduler/SchedulingAlgorithmsTest.java
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── types/index.ts
│       ├── services/
│       │   ├── api.ts
│       │   └── schedulingService.ts
│       ├── hooks/useToast.ts
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── Sidebar.tsx
│       │   └── Toast.tsx
│       └── pages/
│           ├── DashboardPage.tsx
│           ├── ProcessManagementPage.tsx
│           ├── SimulationPage.tsx
│           ├── ComparisonPage.tsx
│           └── AboutPage.tsx
└── README.md
```

---

## ⚡ How to Run Locally

### 1. Start Backend (Spring Boot — Port 8080)
From the `backend` folder:
```powershell
mvn spring-boot:run
```
*(Or use `C:\Users\anike\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run`)*

The backend starts at `http://localhost:8080`.

### 2. Start Frontend (React + Vite — Port 5173)
From the `frontend` folder:
```powershell
npm run dev
```

The frontend will be accessible at `http://localhost:5173`.

---

## 🧪 Test Execution Results

All 20 backend unit test cases passed with 0 errors and 0 failures:

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.osscheduler.SchedulingAlgorithmsTest
[INFO] Tests run: 20, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.288 s
[INFO] 
[INFO] Results:
[INFO] Tests run: 20, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 📡 REST API Documentation

### Process Management
- `GET /api/processes` — Retrieve all processes.
- `GET /api/processes/{pid}` — Retrieve process by PID.
- `POST /api/processes` — Create new process (`pid`, `arrivalTime`, `burstTime`, `priority`).
- `PUT /api/processes/{pid}/ready` — Transition process from `NEW` to `READY`.
- `DELETE /api/processes/{pid}` — Delete process by PID.
- `DELETE /api/processes` — Clear all processes.

### Scheduling Simulation & Comparison
- `POST /api/scheduling/run` — Run algorithm simulation (`algorithm`, `timeQuantum`). Returns Gantt segments, process metrics, and averages.
- `POST /api/scheduling/compare` — Compare all 5 algorithms (`timeQuantum`). Returns side-by-side statistics and best-performing algorithms.
- `GET /api/scheduling/history` — Get historical simulation executions.
