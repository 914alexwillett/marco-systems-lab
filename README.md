# Macro Systems Lab

Macro Systems Lab is a **full-stack educational prototype** for studying macroeconomic relationships with transparent statistical workflows.

## Focus

- Understand non-linear behavior between macro variables and market returns.
- Detect historical regimes with K-means clustering.
- Run simple conditional-mean / ANOVA-style hypothesis tests.
- Keep every step readable and auditable.

## Tech Stack

### Backend (`/backend`)
- Node.js + TypeScript
- Express
- Axios
- dotenv

### Frontend (`/frontend`)
- React + TypeScript
- Recharts
- Minimalist analytical interface

## Project Structure

```text
macro-systems-lab/
  backend/
    src/
      analytics/
        hypothesis.ts
        kmeans.ts
      data/
        fredClient.ts
        macroService.ts
        transforms.ts
      routes/
        macroRoutes.ts
      types/
        macro.ts
      utils/
        math.ts
      server.ts
  frontend/
    src/
      api/client.ts
      components/
        DataRegimeView.tsx
        RegimeSummaryPanel.tsx
        HypothesisPanel.tsx
      types/index.ts
      App.tsx
      main.tsx
      styles.css
```

## Backend Endpoints

- `GET /api/macro`
  - Returns monthly aligned macro dataset:
  - `{ date, cpi_yoy, yield_10y, spx_return }[]`
- `GET /api/regimes?k=3`
  - K-means regimes (`k` from 2 to 6)
  - Returns labeled data + regime summary statistics.
- `GET /api/hypothesis?variable=cpi_yoy&operator=%3E&threshold=4`
  - Conditional mean comparison with ANOVA-style F statistic and p-value.

## Data Pipeline

1. Fetch FRED series (monthly):
   - CPI (`CPIAUCSL`)
   - 10Y Treasury yield (`DGS10`)
   - S&P 500 (`SP500`)
2. Compute:
   - CPI YoY %
   - SPX monthly return %
3. Align overlapping monthly observations.
4. Remove missing/non-numeric values.

## Local Run Instructions

### 1) Backend setup

```bash
cd backend
cp .env.example .env
# add your FRED_API_KEY to .env
npm install
npm run dev
```

Backend will run on `http://localhost:4000`.

### 2) Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Educational Notes

- This is **not** a trading app.
- This is **not** a prediction or signal engine.
- It intentionally emphasizes transparent, interpretable mechanics over complexity.
