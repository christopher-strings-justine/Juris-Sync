# ⚖️ JurisSync

> **Enterprise AI-Powered Forensic Legal Document Auditing & Contradiction Detection Platform**  
> *Compliant with the Digital Personal Data Protection (DPDP) Act*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Groq LPU](https://img.shields.io/badge/Inference-Groq%20LPU%20(Llama%203.3%2070B)-F55036?style=flat-square)](https://groq.com/)
[![DPDP Act](https://img.shields.io/badge/Compliance-DPDP%20Act%20Enforced-10B981?style=flat-square)](https://www.meity.gov.in/)

---

## 📖 Overview

**JurisSync** is an advanced legal tech workbench designed for judges, lawyers, legal receivers, and compliance auditors. It ingests complex, multi-document legal bundles (PDFs), performs forensic contradiction detection across temporal, geographic, monetary, and factual dimensions, and automatically enforces privacy compliance under the **Digital Personal Data Protection (DPDP) Act**.

### 🌟 Key Capabilities

- **🔍 Multi-Document Bundle Ingestion**: Upload heterogenous case bundles, affidavits, contracts, lease deeds, and financial filings simultaneously.
- **⚡ Forensic Contradiction Detection**: Identifies factual mismatches (geographical impossibilities, date conflicts, currency differences) and logical fallacies (e.g. *ad hominem*, straw man).
- **🛡️ DPDP Act Privacy & Physical Redaction Engine**: Automatically extracts sensitive personal data (Aadhaar, PAN, Bank Accounts, DOB, Addresses) and physically burns redaction blocks into PDF pages for unauthorized roles.
- **👁️ Split-Screen Interactive Viewer**: Synchronized dual-pane PDF viewer with dynamic, bounding-box highlights directly anchored over conflicting clauses.
- **⏳ Temporal Topology & Chronological Flow**: Compiles timelines of cross-document events with anomaly and conflict flags.
- **⚖️ Precedent & Case Law Search Hub**: Interactive precedent database querying Indian case law, statutory citations, and court rulings with dossier saving.
- **🔐 Multi-Role Clearance (RBAC)**: Switch between **Judicial/Authorized Clearance** (unredacted evidence) and **Public/Legal Receiver Clearance** (redacted evidence & masked PII).
- **🗃️ Cryptographically Signed Audit Dossiers**: Export forensic case logs and contradiction records in structured, verifiable JSON format.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 Client                        │
│   (Dashboard, Dual-Pane PDF Viewer, Timeline, Search Hub)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST (port 3000 -> 8000)
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend Server                   │
├─────────────────────────────────────────────────────────────┤
│ • PyMuPDF (fitz) & pdfplumber - Text & Bounding Box Engine   │
│ • Physical Redaction Engine - PDF Sanitization & Masking    │
│ • Groq LPU API (Llama 3.3 70B) / Heuristic Fallback Engine   │
│ • Fernet AES Encryption Vault - SQLite / SQLAlchemy Database │
│ • Multi-Role Access Control (RBAC Header Guard)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

Before running JurisSync locally, ensure you have:

- **Node.js**: `v18.0.0` or later (`v20+` or `v22+` recommended)
- **npm** or **pnpm** or **yarn**
- **Python**: `3.10` or higher (`3.11` or `3.12` or `3.14` tested)
- **Git** (for cloning the repository)

---

## 🚀 Quick Start (One-Command Launch)

The fastest way to launch both the backend and frontend on localhost:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Juris-Sync.git
cd Juris-Sync
```

### 2. Run the Startup Script
```bash
chmod +x start.sh
./start.sh
```

> **What this does automatically:**
> 1. Creates a Python virtual environment in `backend/.venv` (if not present).
> 2. Installs all required Python dependencies from `backend/requirements.txt`.
> 3. Installs all frontend npm packages in `frontend/`.
> 4. Launches the **FastAPI Backend** on `http://localhost:8000`.
> 5. Launches the **Next.js Frontend** on `http://localhost:3000`.

Once started, open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🛠️ Step-by-Step Manual Setup

If you prefer to run the backend and frontend in separate terminals:

### Terminal 1: Backend Setup (FastAPI)

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Create and activate a Python virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 3. Install backend dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. (Optional) Configure environment variables
cp .env.example .env

# 5. Start the FastAPI development server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend endpoints will be available at:
- **API Base:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **Alternative ReDoc:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/api/health`

---

### Terminal 2: Frontend Setup (Next.js 16)

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. (Optional) Configure local environment
cp .env.example .env.local

# 4. Start the Next.js development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

## ⚙️ Environment Variables

JurisSync works out of the box with zero configuration thanks to its built-in heuristic fallback engine. To enable live Groq cloud inference or custom encryption keys, configure the `.env` files:

### Backend Configuration (`backend/.env` or root `.env`)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | *(Optional)* | Groq API key for live Llama 3.3 70B analysis. If empty, the engine uses dynamic heuristic parsing. |
| `ENCRYPTION_KEY` | *(Auto-generated)* | 32-byte URL-safe base64 Fernet key for encrypting sensitive case records. |
| `BACKEND_HOST` | `0.0.0.0` | IP interface to bind the FastAPI server. |
| `BACKEND_PORT` | `8000` | Port for the FastAPI server. |
| `BACKEND_BASE_URL` | `http://localhost:8000` | URL used for generating links to preview redacted/unredacted PDFs. |
| `DATABASE_URL` | `sqlite:///./jurissync.db` | SQLAlchemy database URL (SQLite by default). |
| `ALLOWED_ORIGINS` | `http://localhost:3000,...` | Comma-separated CORS allowed origins. |

### Frontend Configuration (`frontend/.env.local`)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | The base URL of the FastAPI backend. |

---

## 👥 Clearance Roles & RBAC Demonstration

JurisSync simulates a realistic multi-tier judicial permission model:

| Role | Clearance Level | Redaction Status | Capabilities |
| :--- | :--- | :--- | :--- |
| **Judge** | Maximum | Unredacted | Full access to evidence, vault decryption, full audit log, decision stamping. |
| **Lawyer** | Authorized | Unredacted | Access to client/opposing documents, precedent search, insight bookmarking. |
| **Org Admin** | Authorized | Unredacted | System oversight, contradiction verification, dossier export. |
| **Legal Receiver / Public** | Restricted | **REDACTED** | DPDP Act physical black-out on Aadhaar, PAN, Bank details, PII masked. |

> 💡 **Pro-Tip**: You can toggle clearance dynamically on the dashboard header using the clearance switch to immediately see the difference between unredacted evidence and DPDP-enforced redacted documents!

---

## 🧪 Testing with Demo Documents

JurisSync includes sample PDF generation and testing scripts:

### 1. Generate a Test Legal Bundle PDF
```bash
cd backend
python create_mock_pdf.py
```
This generates `JurisSync_Demo_Legal_Bundle.pdf` containing conflicting real estate deeds and purchase agreements.

### 2. Test Backend Upload via Python Script
```bash
python test_upload.py
```

### 3. Test in the Web UI
1. Go to `http://localhost:3000/login`.
2. Select **Lawyer** or **Judge** and click **Authenticate**.
3. Drag and drop `backend/JurisSync_Demo_Legal_Bundle.pdf` (or any legal PDFs).
4. Click **Start Multi-Agent Forensic Audit**.
5. Click on any detected contradiction card to open the **Dual-Pane Split Screen Viewer**.
6. Click **Temporal Topology** to view the timeline graph, or **AI Legal Search** to query case precedents.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Sample Header / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API status and root information | None |
| `GET` | `/api/health` | Health check endpoint | None |
| `POST` | `/api/analyze-bundle` | Upload and analyze PDF document bundles | `multipart/form-data` with `files` + `x-user-role` |
| `POST` | `/api/update-contradiction-status` | Verify, dismiss, or update status of an anomaly | `{"contradiction_id": "...", "status": "VERIFIED"}` |
| `GET` | `/api/timeline-analysis` | Retrieve temporal event chronology | `?contradiction_id=...` + `x-user-role` |
| `POST` | `/api/legal-search` | Search case law precedents | `{"query": "breach of contract"}` |
| `POST` | `/api/save-insight` | Save a precedent note to case dossier | `{"contradiction_id": "...", "case_title": "...", "insight_notes": "..."}` |

---

## 📁 Project Directory Structure

```
Juris-Sync/
├── backend/
│   ├── .venv/                     # Python virtual environment (auto-created)
│   ├── services/
│   │   ├── ai_analyzer.py         # Groq LLM & heuristic contradiction engine
│   │   └── redaction.py           # DPDP Act physical PDF redaction & encryption
│   ├── database.py                # SQLite database session and connection setup
│   ├── encryption.py              # Fernet symmetric AES encryption vault
│   ├── models.py                  # SQLAlchemy ORM models (Cases, Contradictions, PII)
│   ├── main.py                    # FastAPI application, routes, and CORS setup
│   ├── create_mock_pdf.py         # Utility script to generate sample test PDF bundles
│   ├── test_upload.py             # CLI test script for PDF bundle upload
│   ├── requirements.txt           # Python dependencies
│   └── .env.example               # Backend environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Landing page with enterprise introduction
│   │   │   ├── login/page.tsx     # Role-based clearance authorization portal
│   │   │   └── dashboard/page.tsx # Main forensic audit workbench & split-screen
│   │   ├── components/
│   │   │   ├── CommandStrip.tsx   # Top telemetry bar & clearance toggle
│   │   │   ├── SplitScreenViewer.tsx # Dual-pane PDF visualizer with canvas highlights
│   │   │   ├── TimelineAnalysis.tsx  # Interactive chronology graph & anomaly flags
│   │   │   ├── LegalSearchHub.tsx # Precedent query & case law dossier saver
│   │   │   └── ui/                # Reusable UI component library (shadcn/radix)
│   │   └── lib/
│   │       ├── config.ts          # Centralized API endpoints & base URL config
│   │       └── utils.ts           # Classnames helper utilities
│   ├── package.json               # Frontend dependencies & Next.js scripts
│   ├── tsconfig.json              # TypeScript compiler configuration
│   └── .env.example               # Frontend environment variables template
│
├── package.json                   # Root workspace scripts (npm run dev, etc.)
├── start.sh                       # One-command localhost startup script
├── .env.example                   # Full-stack environment template
└── README.md                      # Comprehensive project documentation
```

---

## ❓ Troubleshooting & FAQs

### 1. Port 8000 or 3000 is already in use
- To change the backend port, run:
  ```bash
  BACKEND_PORT=8001 uvicorn main:app --port 8001
  ```
  And update `NEXT_PUBLIC_API_BASE_URL=http://localhost:8001` in `frontend/.env.local`.
- To change the frontend port:
  ```bash
  npm run dev -- -p 3001
  ```

### 2. Can I use JurisSync without a Groq API Key?
**Yes!** JurisSync features a dynamic heuristic fallback engine that parses uploaded PDFs, calculates bounding-box coordinates with PyMuPDF, performs regex-based PII redaction, and serves mock contradiction topologies seamlessly.

### 3. How do I enable live LLM contradiction extraction?
Obtain a free or enterprise API key from [Groq Console](https://console.groq.com/) and add it to `backend/.env`:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 4. Are uploaded documents persisted?
Uploaded PDFs are processed and stored in `backend/public/` for previewing. Sensitive text extracted during analysis is encrypted using AES (Fernet) before being saved in SQLite (`backend/jurissync.db`).

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <b>JurisSync</b> — Empowering the Judiciary with High-Assurance Forensic AI.
</p>
