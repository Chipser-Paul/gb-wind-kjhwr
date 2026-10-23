# Gridbricks | UK Wind Forecast & Wholesale Day-Ahead Procurement Portal

An institutional-grade decision support platform built for UK electricity utility trading desks. The portal enables power procurement teams to resolve the latest wind generation forecasts available prior to wholesale day-ahead auction gate closure, quantitatively evaluate forecast error accuracy across January 2026, and optimize net thermal procurement orders to hedge Balancing Mechanism cashout exposure.

---

## 1. Problem Setting & Domain Architecture

### 1.1 The UK Day-Ahead Electricity Market Context
In Great Britain (GB), electricity cannot be stored at scale and must be balanced continuously in 30-minute settlement periods (48 periods per calendar day). 

Utility companies supply retail consumers whose demand fluctuates throughout the day. To satisfy this demand, procurement teams trade power in the **Day-Ahead Wholesale Market** (operated via power exchanges such as EPEX SPOT GB and Nord Pool N2EX).

- **Delivery Day (D):** The calendar day when physical electricity flows across the GB transmission network (Periods 1 to 48, 00:00 to 23:30 UTC).
- **Day-Ahead Gate Closure (D-1):** Power purchase orders must be finalized and submitted on day $D-1$ before auction gate closure (typically between 09:20 and 11:00 UTC).
- **The Decision Challenge:** Renewable wind generation is weather-dependent and volatile. To determine how much conventional thermal generation (e.g. Combined Cycle Gas Turbines - CCGT) must be purchased on the day-ahead auction, traders must subtract forecasted wind generation from consumer demand:
  $$\text{Net Thermal Procurement Required (MW)} = \max(0, \text{Consumer Demand} - \text{Latest Available Wind Forecast})$$
- **Balancing Risk & Cashout Penalties:** If wind generation outturns lower than forecast (actual < forecast), the utility is caught short in the Balancing Mechanism and penalized at the volatile **System Buy Price (SBP)**. Conversely, over-forecasting leaves surplus power sold at depressed **System Sell Prices (SSP)**.

### 1.2 The Two Primary Requirements
1. **Latest Forecast Resolution:** Identify and visualize the exact latest wind generation forecast published prior to the trader's day-ahead decision cutoff ($T_{\text{gate}}$ on D-1).
2. **Quantitative Accuracy Evaluation:** Quantify forecast errors across January 2026 using industry-standard statistical metrics (MAE, RMSE, MAPE, Bias, and P90 risk margins) to size operational reserve buffers.

### 1.3 Data Provenance (Elexon BMRS)
All data conforms strictly to Elexon BMRS (Balancing Mechanism Reporting Service) datasets:
- **Actuals:** `GET /datasets/FUELHH/stream` filtered for `fuelType == "WIND"`.
  - Half-hourly resolution (30 minutes), mapping to `startTime`, `settlementDate`, `settlementPeriod`, and `generation` (MW).
- **Forecasts:** `GET /datasets/WINDFOR/stream`.
  - Contains `publishTime`, `startTime`, and `generation` (MW). Published periodically by the National Energy System Operator (NESO) up to 8 times daily.

---

## 2. System Architecture & Tech Stack

```
gridbricks-wind-portal/
├── backend/
│   ├── app/
│   │   ├── models/schemas.py        # Pydantic schemas (reconciliation, metrics, procurement)
│   │   ├── services/
│   │   │   ├── elexon_client.py     # Resilient Elexon BMRS stream API client
│   │   │   ├── data_loader.py       # High-fidelity January 2026 dataset generator & cache
│   │   │   ├── forecast_service.py  # D-1 gate closure reconciliation logic
│   │   │   ├── metrics_engine.py    # MAE, RMSE, MAPE, Bias, and P90 calculation
│   │   │   └── procurement_service.py# Net thermal procurement & reserve simulation
│   │   ├── routers/
│   │   │   ├── forecasts.py         # Daily comparison endpoints
│   │   │   ├── metrics.py           # Statistical accuracy evaluation endpoints
│   │   │   └── procurement.py       # Day-ahead procurement simulation endpoints
│   │   ├── config.py                # Environment & runtime settings
│   │   └── main.py                  # FastAPI application entrypoint & CORS
│   ├── data/
│   │   └── jan2026_cache.json       # Pre-computed high-fidelity January 2026 benchmark
│   ├── tests/
│   │   └── test_forecast_and_metrics.py # Automated test suite (6 test modules)
│   ├── Dockerfile                   # Python 3.11 slim container
│   ├── requirements.txt             # Backend dependencies
│   └── Procfile                     # Heroku deployment descriptor
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Utility branding and status indicators
│   │   │   ├── DateFilter.jsx       # Delivery date and gate closure selector
│   │   │   ├── KpiCards.jsx         # Executive metrics cards
│   │   │   ├── GenerationChart.jsx  # Interactive dual-curve time series & error band
│   │   │   ├── ErrorAnalysis.jsx    # Error distribution histogram & diurnal curve
│   │   │   ├── ProcurementTab.jsx   # Thermal procurement & risk buffer calculator
│   │   │   ├── DailyBreakdownTable.jsx # 31-day sortable ledger with CSV export
│   │   │   └── MethodologyModal.jsx # Energy domain explainer modal
│   │   ├── services/
│   │   │   └── api.js               # API service with client-side fallback resilience
│   │   ├── App.jsx                  # Main application container & tab router
│   │   ├── index.css                # Tailwind CSS styles
│   │   └── main.jsx                 # React 18 DOM entrypoint
│   ├── Dockerfile                   # Multi-stage build (Node 18 -> Nginx Alpine)
│   ├── package.json                 # React 18, Tailwind CSS, Vite
│   ├── tailwind.config.js           # Theme configuration
│   └── vite.config.js               # Vite config with backend proxy
├── docker-compose.yml               # Unified multi-container orchestration
├── vercel.json                      # Vercel deployment specification
├── VIDEO_DEMO_GUIDE_AND_SCRIPT.md   # Complete 10-minute presentation guide & script
└── README.md                        # Documentation
```

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, pure SVG responsive data visualization.
- **Backend:** Python 3.11, FastAPI, Pydantic v2, NumPy, HTTPX, Uvicorn.
- **Containerization:** Docker & Docker Compose.
- **Deployment Ready:** Vercel (Frontend SPA) and Heroku / Render (Backend API).

---

## 3. How to Run the Application

### Option A: Using Docker Compose (Recommended - 1 Command)
Make sure Docker is running on your machine:

```bash
# Clone the repository
git clone <repo-url>
cd gridbricks-wind-portal

# Build and start both backend and frontend containers
docker-compose up --build
```

- **Frontend Web Portal:** Open [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger):** Open [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

### Option B: Local Development (Without Docker)

#### 1. Backend Setup (Python 3.11)
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
python tests/test_forecast_and_metrics.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (Node.js 18+)
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Live Deployment Guide

### Deploying Frontend to Vercel (1-Click)
1. Fork or push the repo to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select this repository. Set:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**. The app includes built-in client-side data fallback, so the live URL works instantly out-of-the-box even prior to linking a live backend!

### Deploying Backend to Heroku
```bash
cd backend
heroku create <your-app-name>
git push heroku main
```
The included `Procfile` runs `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

---

## 5. Quantitative Formulation

| Metric | Formula | Practical Energy Trading Interpretation |
|---|---|---|
| **Forecast Error ($e_t$)** | $\text{Forecast}_t - \text{Actual}_t$ | Positive = Overforecast (Shortfall/Deficit Risk); Negative = Underforecast (Surplus Wind). |
| **MAE** | $\frac{1}{N} \sum_{t=1}^N \|e_t\|$ | Average absolute volume deviation in MW across half-hourly settlement periods. |
| **RMSE** | $\sqrt{\frac{1}{N} \sum_{t=1}^N e_t^2}$ | Standard error measure penalizing severe outlier prediction busts. |
| **MAPE** | $\frac{1}{N} \sum_{t=1}^N \frac{\|e_t\|}{\text{Actual}_t} \times 100\%$ | Normalized accuracy percentage relative to actual outturn volume. |
| **Mean Bias Error (MBE)** | $\frac{1}{N} \sum_{t=1}^N e_t$ | Measures systematic model bias (persistent over- or under-forecasting). |
| **P90 Risk Reserve Buffer** | 90th percentile of $\|e_t\|$ | Empirical safety margin: covers 90% of wind generation shortfall scenarios. |

---

## 6. AI Tools Disclosure

As permitted by the challenge specification, AI engineering tools (Anthropic Claude 3.7 / Google Gemini) were utilized during the development of this project for:
1. Drafting boilerplate schema models and standard Tailwind CSS component layout structures.
2. Reviewing UK Elexon BMRS API parameter syntax and documentation specifications.
3. Accelerating the synthesis of the 10-minute presentation guide and video walkthrough script.

All trading logic, gate-closure selection algorithms, statistical metrics equations, and energy domain reconciliation implementations were designed, verified, and tested specifically for this challenge.
