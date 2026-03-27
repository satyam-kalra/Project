# CIHI Childbirth Indicators — Capstone Project
**Skills for Hire Atlantic | Advanced Data + AI Program**

Analyzes Canadian childbirth indicator data from the CIHI DAD/HMDB 2024-2025
data tables to identify which provinces have the highest-risk childbirth profiles
(elevated C-section rates, longer hospital stays, higher 30-day readmissions).

## Data source

Official CIHI release:
https://www.cihi.ca/sites/default/files/document/dad-hmdb-childbirth-2024-2025-data-tables-en.xlsx

Place the downloaded `.xlsx` file in the `data/` directory to use the real data.
A synthetic sample CSV (`data/cihi_childbirth_2024_2025_sample.csv`) is included
so the analysis runs immediately without downloading anything.

## Project structure

```
.
├── analysis.py                                   # Main analysis script
├── capstone_workshop_brief.md                    # Workshop brief + rubrics
├── requirements.txt                              # Python dependencies
├── walkthrough_video_outline.md                  # 5–7 min video outline
├── written_responses.md                          # Capstone written responses 1–3
└── data/
    └── cihi_childbirth_2024_2025_sample.csv      # Synthetic sample dataset
```

## Setup and run

```bash
pip install -r requirements.txt
python analysis.py
```

Outputs are written to `output/` (git-ignored):

| File | Description |
|---|---|
| `fig1_csection_by_province.png` | C-section rate by province vs. national average |
| `fig2_length_of_stay.png` | Hospital length of stay — vaginal vs. C-section |
| `fig3_indicator_heatmap.png` | All 9 indicators × 10 provinces heatmap |
| `fig4_csection_vs_readmission.png` | C-section rate vs. 30-day readmission scatter |
| `composite_risk_ranking.csv` | Provinces ranked by composite risk score |
| `provincial_deviations.csv` | Per-province deviation from national mean |

## Key findings (sample data)

| Rank | Province | Composite Risk Score |
|------|---|---|
| 1 | Newfoundland and Labrador | +1.13 |
| 2 | Manitoba | +0.77 |
| 3 | New Brunswick | +0.61 |
| … | … | … |
| 10 | Quebec | −1.65 |

Provinces with a positive score are above the national average on the composite of
C-section rate, C-section length of stay, and 30-day readmission rate.

## Capstone deliverables

- **Walkthrough video (5–7 min):** screen-record walking through this README, the
  `analysis.py` code, and the output charts. See
  [`walkthrough_video_outline.md`](walkthrough_video_outline.md).
- **Written responses:** see [`written_responses.md`](written_responses.md).
- **Workshop brief + rubric:** see
  [`capstone_workshop_brief.md`](capstone_workshop_brief.md).
