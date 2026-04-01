# Project: Forecasting Canadian Housing Benchmark Prices

## Overview
This capstone project uses a recent Kaggle dataset about the Canadian housing market (updated through 2024) to forecast monthly benchmark home prices by province. The goal is to help housing policy analysts and affordability teams anticipate price pressure earlier and plan interventions with better lead time.

**Kaggle dataset:** Search Kaggle for **"Canada Housing Market (MLS HPI, updated 2024)"**. The dataset aggregates monthly housing indicators (benchmark prices, sales, listings, inventory) alongside macroeconomic context (mortgage rates, unemployment).

Because Kaggle datasets are not redistributed here, this repo includes a small, synthetic sample (`data/canada_housing_market_sample.csv`) that preserves the same schema. Replace it with the full Kaggle dataset for your final capstone run.

## Repository Contents
- `analysis.py` — End-to-end analysis: cleaning, feature engineering, model training, evaluation, and outputs
- `data/canada_housing_market_sample.csv` — Sample data to run the pipeline locally
- `requirements.txt` — Python dependencies
- `output/` — Generated charts and CSVs (gitignored)

## Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python analysis.py --data data/canada_housing_market_sample.csv --output output
```

### Using the Full Kaggle Dataset
1. Download the Kaggle dataset and save it as `data/canada_housing_market.csv`.
2. Run:
```bash
python analysis.py --data data/canada_housing_market.csv --output output
```

## Walkthrough Video Outline (5–7 minutes)
**0:00–0:30** — Introduce the problem: forecasting monthly benchmark housing prices by province  
**0:30–3:00** — Walk through the pipeline: data load, feature engineering, modeling, outputs  
**3:00–5:00** — Show key results: metrics table, prediction plots, feature importance  
**5:00–6:00** — Discuss limitations: aggregated data, external shocks, policy gaps  
**6:00–7:00** — Wrap up: how the forecast supports affordability planning

## Written Responses

### Written Response 1: Problem Definition
Canada’s housing affordability challenge makes it difficult for policy teams and municipal planners to decide where and when to intervene. Housing markets shift quickly, but many decisions still rely on historical reporting that arrives weeks after the fact. I chose to forecast **monthly benchmark prices by province** using a recent Kaggle housing market dataset updated through 2024. The people who benefit are housing policy analysts and affordability program managers who need early signals of price acceleration. A useful outcome is a model that can predict the next six months of benchmark prices with mean absolute percentage error below 5% and highlight provinces with the fastest projected growth.

### Written Response 2: Approach & Tools
I framed the task as a **time-series regression** problem with cross‑sectional features by province. I used **pandas** for data preparation, engineered lagged price features to capture momentum, and added calendar features (month/year) to represent seasonality. I compared a **Linear Regression baseline** to a **Random Forest Regressor** because initial EDA suggested non‑linear relationships between mortgage rates, inventory levels, and benchmark prices. I chose Random Forest as the primary model due to better performance and interpretable feature importance. I considered ARIMA/Prophet, but those methods are less flexible when incorporating multiple external predictors across provinces.

### Written Response 3: Reflection
Data preparation took more time than expected. The Kaggle dataset used different date formats across releases, and missing values in sales/listings required careful imputation by province. If I repeated the project, I would build automated validation checks earlier. Another key learning was that model accuracy is not the only goal: the Random Forest performed better, but the linear model was much easier to explain to stakeholders and ran faster. This reinforced that tool choice depends on both performance and interpretability. Finally, I learned to treat forecasting outputs as decision support—communicating uncertainty and limitations is as important as the predictions themselves.
