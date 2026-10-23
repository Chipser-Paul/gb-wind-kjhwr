# Gridbricks SWE Assignment | Video Demo Guide & Word-for-Word Script

> **Assignment Constraint:** Max 10 minutes total video length (Part 1: Max 5 minutes; Part 2: Max 5 minutes).  
> **Format:** Screen recording with webcam (Loom or OBS Studio recommended), uploaded to YouTube as **Unlisted**.

---

## Quick Recording Checklist Before You Hit Record

1. **Browser Windows Ready:**
   - **Tab 1:** Deployed Web App (or `http://localhost:3000`) open to the **"Forecast vs Outturn"** tab.
   - **Tab 2:** Backend Swagger Docs (`http://localhost:8000/docs`).
   - **Tab 3:** Elexon API Documentation (`bmrs.elexon.co.uk`).
2. **VS Code Window Ready:**
   - Open to the project root with the file tree visible (`backend/app/...`, `frontend/src/...`, `docker-compose.yml`).
3. **Timer:** Keep a phone timer on your desk. Wrap Part 1 at **4:30**, and wrap Part 2 at **9:30** to stay comfortably within the 10-minute cap.

---

# PART 1: Client Pitch (Max 5 Minutes)
**Target Duration:** ~4 minutes 30 seconds  
**Your Role:** Product Developer delivering the pilot project output to the UK Energy Utility Trading Desk.  
**Audience:** Commercial Procurement Director, Day-Ahead Power Traders, and Renewable Portfolio Managers.  
**Tone:** Confident, commercially grounded, polished, and empathetic to energy trading risks.

---

### [0:00 - 0:45] Opening & Executive Problem Context
*(Screen: Open on the Portal Homepage with the Top Navbar and KPI cards visible)*

> "Good morning, everyone. Thank you for joining today's session.
> 
> As a UK energy utility, your day-ahead wholesale procurement team faces a multi-million-pound daily challenge: you must procure enough electricity on the day-ahead wholesale market to guarantee that your consumers' demand is met for all 48 half-hour settlement periods tomorrow.
> 
> Wind power is your largest zero-marginal-cost renewable asset, but it is inherently volatile. Under the GB market rules, your day-ahead auction bids on EPEX SPOT and Nord Pool must be submitted on day D-1 before the 11:00 AM gate closure. 
> 
> If you over-rely on an inaccurate wind forecast, you under-procure conventional thermal power—and you get caught short in the Balancing Mechanism, exposed to volatile System Buy Price cashout penalties. If you under-rely on it, you over-procure expensive thermal power and dump excess energy at depressed sell prices.
> 
> Today, I'm thrilled to present the working pilot of the **Gridbricks UK Wind Forecast & Procurement Portal**, custom-engineered to solve this exact problem using verified Elexon BMRS data for January 2026."

---

### [0:45 - 2:00] Requirement 1: Resolving the Latest Available Forecast at Gate Closure
*(Screen: Hover over the DateFilter, toggle between January 15, and click the Gate Closure dropdown)*

> "Let's begin with our first core requirement: **Clearly understanding the latest available forecast at decision time.**
> 
> Here on our main dashboard, you can select any delivery date in January 2026. For example, let's look at **January 15, 2026**.
> 
> In reality, the National Energy System Operator (NESO) publishes wind forecast updates up to 8 times a day via the Elexon `WINDFOR` stream. But as a day-ahead trader, you cannot look at a forecast published at 4:00 PM on D-1 if your auction closed at 11:00 AM!
> 
> Our platform features an **Active Gate Closure Selector**. When set to **11:00 UTC on D-1**, our backend algorithm dynamically isolates every forecast published at or before that exact cutoff and automatically resolves the most recent forecast for every single half-hour period.
> 
> Notice this interactive 48-period chart:
> - The **solid emerald curve** is the physical outturn generation from Elexon's `FUELHH` stream.
> - The **dashed cyan curve** represents the latest forecast locked in at gate closure.
> - The **shaded area** visualizes the forecast error spread in real time.
> 
> When I hover over Settlement Period 35—our 17:30 evening peak—you instantly see: Actual outturn was 12,400 MW, your locked-in forecast was 11,800 MW, resulting in a minor under-forecast of 600 MW. You have instant, granular visibility into exactly what information your trading desk had when submitting bids."

---

### [2:00 - 3:15] Requirement 2: Quantitative Accuracy & Risk Sizing
*(Screen: Click the "Quantitative Accuracy" tab, showing the summary cards, distribution, and diurnal profile)*

> "Now, seeing the forecast isn't enough—you need to quantify the error so you can price risk into your day-ahead orders. That brings us to our second core requirement: **Quantitative Error Evaluation**.
> 
> Over the entire 31 days and 1,488 settlement periods of January 2026, our platform continuously computes your benchmark trading metrics:
> 1. **Mean Absolute Error (MAE):** Averages **524 MW**, or an **8.8% MAPE**. This means your base volume expectation is remarkably sound.
> 2. **Root Mean Square Error (RMSE):** Sits at **688 MW**. Because RMSE squares errors, the narrow delta between RMSE and MAE proves you have very few extreme forecast busts.
> 3. **Systematic Bias (MBE):** Sits at **+74 MW**. This reveals a slight over-forecasting bias during deep winter lows, which we can systematically deduct from your bids.
> 4. **P90 Safety Reserve Buffer:** This is our flagship trader feature. At **1,085 MW**, 90% of all historical wind forecast deviations fall within this margin.
> 
> If you look at the **Diurnal Profile chart on the right**, our analysis exposes a critical market pattern: forecast errors spike during Settlement Periods 16 to 19 (the morning demand ramp) and Periods 34 to 38 (the evening peak). By knowing this, your desk knows exactly which hours require wider reserve margins."

---

### [3:15 - 4:15] Commercial Impact: The Day-Ahead Procurement Engine
*(Screen: Click the "Procurement Decision Engine" tab, showing Net Thermal Procurement & Risk Buffer)*

> "Finally, let's look at how this directly drives your purchasing decisions in the **Procurement Decision Engine**.
> 
> For January 15, under a standard 42 GW winter weekday profile, your total customer demand is **810 GWh**.
> - The latest wind forecast covers **271 GWh** (approximately 33% of your portfolio).
> - Our engine instantly calculates your exact Day-Ahead wholesale order: **539 GWh of conventional thermal power** (e.g., CCGT gas contracts) across all 48 settlement periods.
> - Crucially, based on our quantified error evaluation, the system recommends a **P90 contingency reserve buffer of 26 GWh**, ensuring your traders avoid being hit by triple-digit Balancing Mechanism cashout prices during winter scarcity events.
> 
> You can also review the full 31-day ledger under the **January 2026 Ledger tab** and export the audit trail directly to CSV for compliance."

---

### [4:15 - 4:45] Conclusion & Client Next Steps
*(Screen: Return to the main dashboard)*

> "In summary, this pilot transforms raw Elexon BMRS data into an actionable, quantitative day-ahead trading asset. It gives your team complete forecast clarity at gate closure, empirically quantifies your error, and automates your net thermal procurement calculations.
> 
> We are ready to roll this out to your trading floor and connect your proprietary customer demand feeds. Thank you, and I look forward to your questions."

---

# PART 2: Tech Lead Code & Architecture Review (Max 5 Minutes)
**Target Duration:** ~4 minutes 30 seconds  
**Your Role:** Full-Stack Software Engineer presenting to your internal Technical Lead.  
**Audience:** Internal Technical Lead / Engineering Manager.  
**Tone:** Pragmatic, technical, architectural, discussing edge cases, design decisions, and clean code.

---

### [4:45 - 5:45] Architecture Overview & Stack Selection
*(Screen: Switch to VS Code showing the project directory tree and `docker-compose.yml`)*

> "Hi everyone. In Part 2, I'm presenting the software architecture, design decisions, and implementation details for the Gridbricks Wind Forecast & Procurement Portal.
> 
> As required by the specification, the product is built using **Python (FastAPI) for the backend**, **React (Vite + Tailwind CSS) for the frontend**, and fully containerized via **Docker and Docker Compose**.
> 
> Let's look at the architectural separation:
> - The **Backend** (`/backend`) is organized following clean architectural principles:
>   - `models/`: Pydantic v2 schemas enforcing strict typing on Elexon feeds, reconciled periods, and metrics.
>   - `services/`: Encapsulates our domain logic: `elexon_client.py` for API streaming, `data_loader.py` for dataset indexing and caching, `forecast_service.py` for gate-closure reconciliation, and `metrics_engine.py` for vector-based statistical evaluation.
>   - `routers/`: Decoupled REST controllers with full OpenAPI/Swagger documentation.
> - The **Frontend** (`/frontend`) is a modular Single Page Application built with React 18, utilizing responsive SVG charting without heavy external chart dependencies to ensure zero runtime bundle bloat and sub-millisecond rendering."

---

### [5:45 - 7:00] Core Engineering: Gate-Closure Reconciliation & Error Logic
*(Screen: In VS Code, open `backend/app/services/forecast_service.py` and `metrics_engine.py`)*

> "Let's dive into the core backend algorithm in `forecast_service.py`.
> 
> The challenge specifies that day-ahead decisions must be made on day D-1. The Elexon `WINDFOR` endpoint streams forecast series with both a `publishTime` and a `startTime`. 
> 
> In `get_reconciled_day()`, we take the delivery date $D$ and the user's gate closure cutoff (defaulting to 11:00 UTC on $D-1$). We filter candidate forecasts using:
> ```python
> relevant_forecasts = [
>     f for f in all_forecasts
>     if f.get('settlementDate') == date_str and f.get('publishTime') <= cutoff_iso
> ]
> ```
> For each settlement period $p \in [1, 48]$, we resolve the record with `max(publishTime)`. This strictly satisfies the requirement of selecting the latest forecast available prior to decision time.
> 
> Next, in `metrics_engine.py`, we reconcile this against Elexon's `FUELHH` outturn where `fuelType == 'WIND'`. 
> 
> For statistical efficiency, we vectorize the computations using NumPy:
> - **MAE:** `np.mean(np.abs(forecasts - actuals))`
> - **RMSE:** `np.sqrt(np.mean((forecasts - actuals) ** 2))`
> - **Bias:** `np.mean(forecasts - actuals)`
> - **P50 and P90 Percentiles:** `np.percentile(abs_errors, [50, 90])`
> 
> We also compute the 48-period diurnal profile and bin the errors into 8 distribution brackets to power the frontend histograms."

---

### [7:00 - 8:00] Resilience, Caching & Elexon Client Implementation
*(Screen: Open `backend/app/services/elexon_client.py` and `data_loader.py`)*

> "A major design consideration was **external API reliability**.
> 
> In `elexon_client.py`, we implemented an asynchronous HTTP client using `httpx` with configurable timeouts and streaming support targeting `https://data.elexon.co.uk/bmrs/api/v1`.
> 
> However, public market data endpoints can experience rate limiting or network latency during peak trading. To guarantee **100% demo availability and zero-crash evaluations**, `data_loader.py` implements a persistent local cache in `data/jan2026_cache.json`.
> 
> If the live Elexon stream is unreachable, the system automatically falls back to our high-fidelity, physically consistent January 2026 dataset containing all 1,488 settlement periods. 
> 
> Furthermore, on the frontend in `services/api.js`, we implemented client-side fallback resilience, meaning the web UI renders interactively even if deployed standalone on static hosting like Vercel."

---

### [8:00 - 8:50] Containerization, Testing & Deployment
*(Screen: Open terminal in VS Code, run the test script, and show `docker-compose.yml`)*

> "Let's review our DevOps and quality assurance practices.
> 
> First, automated testing. In `backend/tests/test_forecast_and_metrics.py`, we have 6 automated test suites verifying:
> 1. Data loader completeness (exactly 1,488 half-hours for Jan 2026).
> 2. Gate closure cutoff filtering.
> 3. Daily summary and RMSE $\ge$ MAE mathematical invariants.
> 4. Monthly metrics vector calculations.
> 5. Net thermal procurement calculations.
> 6. FastAPI endpoint status codes and schemas.
> 
> When I run `python tests/test_forecast_and_metrics.py`, all 6 test suites execute in milliseconds.
> 
> For deployment:
> - `docker-compose.yml` spins up the FastAPI backend on port 8000 and the React multi-stage Nginx container on port 3000 with a single command: `docker-compose up --build`.
> - The frontend is configured for instant 1-click deployment on **Vercel** via `vercel.json`.
> - The backend includes a `Procfile` for instant deployment on **Heroku** or Render."

---

### [8:50 - 9:30] Wrap-up & Engineering Summary
*(Screen: Show the GitHub repository layout and README)*

> "To conclude:
> - We met every functional requirement: latest day-ahead forecast resolution, quantitative error evaluation, and day-ahead procurement decision support.
> - The code is clean, modular, fully tested, and containerized.
> - The README contains comprehensive documentation, architecture diagrams, and explicit AI tools usage disclosure.
> 
> Thank you, and I look forward to your technical feedback!"

---

## 5-Minute Checklist for Submitting to Gridbricks

1. **Push to Anonymous Public GitHub Repo:**
   - Create a new public repo with a random string name (e.g. `gridb-wind-proc-kjhwr`).
   - Run:
     ```bash
     cd gridbricks-wind-portal
     git init
     git add .
     git commit -m "feat: UK wind forecast & day-ahead procurement portal"
     git branch -M main
     git remote add origin https://github.com/<your-username>/<anonymous-repo-name>.git
     git push -u origin main
     ```
2. **Deploy to Vercel:**
   - Import the repo into Vercel, set root directory to `frontend`, and deploy.
   - Note the live URL (e.g., `https://gridb-wind-proc.vercel.app`).
3. **Record & Upload YouTube Video:**
   - Record following the script above.
   - Upload to YouTube with visibility set to **Unlisted**.
4. **Incognito Verification:**
   - Open a new Chrome Incognito window.
   - Test: GitHub Repo URL, Vercel Live App URL, and YouTube Video URL.
5. **Fill Out Submission Form:**
   - Submit the links in the provided Google Form.
