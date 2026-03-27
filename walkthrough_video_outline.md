# Walkthrough Video Outline (5–7 minutes)
**Skills for Hire Atlantic | Advanced Data + AI Program**

Use this outline while recording your walkthrough video. The goal is to show the
actual analysis (code + charts) and explain what the results mean.

## 0:00–0:30 — Intro
- State the problem in one sentence.
- Example: “I used CIHI’s 2024–2025 childbirth indicators to benchmark provinces and
  identify which regions show higher-risk delivery profiles.”

## 0:30–3:00 — Walk through what you built
- Open `analysis.py` and show:
  - Data loading (XLSX vs sample CSV fallback).
  - `prepare_data()` reshaping into long + wide tables.
- Show the output folder structure and generated files.
- Mention the tools used: pandas, matplotlib/seaborn, numpy, openpyxl.

## 3:00–5:00 — Key results
- Show `fig1_csection_by_province.png` and explain the national average line.
- Show `fig3_indicator_heatmap.png` and explain the z-score colour scale.
- Open `composite_risk_ranking.csv` and explain how the composite score is built
  from multiple indicators.

## 5:00–6:00 — Limitations & assumptions
- Data is aggregated (not patient-level) → no causal claims.
- Indicators are year-specific; multi-year trends are future work.
- Equal-weight z-scoring is a starting point; clinical weights could change rankings.

## 6:00–7:00 — Wrap up
- Summarize the stakeholder value: quick benchmarking for planners/quality teams.
- Mention next steps (multi-year trends, dashboard, sensitivity analysis).

---

**Tip:** Keep the video under 7 minutes and show actual code + outputs, not just slides.
