# Written Responses — CIHI Childbirth Capstone Project
**Skills for Hire Atlantic | Advanced Data + AI Program**

---

## Written Response 1: Problem Definition

**Question:** Describe the problem you chose to work on and why it is worth solving.

---

Canadian provinces vary substantially in how childbirth care is delivered, yet
provincial health systems rarely benchmark their outcomes against each other in a
format accessible to planners. Specifically, C-section rates in some provinces are
up to 20% higher than in others, and 30-day maternal readmissions — a marker of
post-discharge complications — can be nearly double the national average in certain
regions. Obstetric care accounts for the single largest category of acute-care
hospital admissions in Canada, making even modest inefficiencies or outcome
disparities high-impact.

**Problem:** Provincial health planners and hospital administrators lack a fast,
reproducible way to identify which provinces have above-average high-risk childbirth
profiles (high surgical delivery rates, elevated readmissions, extended hospital
stays) using publicly available CIHI data.

**Context:** The Canadian Institute for Health Information (CIHI) publishes annual
Discharge Abstract Database (DAD) and Hospital Morbidity Database (HMDB) childbirth
indicator tables covering all provinces. The data is public, annual, and granular,
yet it sits in Excel spreadsheets that are not pre-analysed. Planners must
re-tabulate the data manually each release cycle. No composite, ranked view of
provincial risk exists in the published materials.

**Who has this problem?** Provincial Chief Medical Officers, hospital quality teams,
and health-policy researchers who need to prioritise intervention budgets.

**Useful outcome:** A script that reproducibly reads the CIHI annual release,
computes a composite risk score for each province, and generates ranked charts and a
deviation table — so planners can immediately see which provinces are outliers and on
which specific indicators, with total processing time under 30 seconds on a laptop.

---

## Written Response 2: Approach & Tool Selection

**Question:** Explain how you decided to approach the problem and which tools or
techniques you selected.

---

**High-level approach:**
I treated this as a multi-indicator benchmarking and ranking problem rather than a
predictive modelling problem. The goal was descriptive and comparative: compute
national averages, identify provincial deviations, and produce a composite risk score
that integrates multiple indicators into a single ranked view.

**Specific tools and techniques used:**

| Tool / Technique | Role |
|---|---|
| `pandas` | Data ingestion (CSV / XLSX), reshaping (pivot, melt), group aggregation |
| `matplotlib` / `seaborn` | Four publication-quality charts |
| `numpy` | Z-score normalisation for composite scoring |
| `openpyxl` | Parsing the real CIHI Excel workbook when available |
| Z-score composite ranking | Averaging z-scores across three risk indicators to rank provinces |

**Why these choices were appropriate:**
- The dataset is tabular and small (< 1,000 rows), so `pandas` is more than
  sufficient — no big-data tooling needed.
- Z-score normalisation is correct for compositing indicators measured on different
  scales (percentages vs. days vs. rates per 1,000). It avoids unit-bias without
  requiring domain-specific weightings.
- Heatmaps are the standard visual for multi-indicator, multi-entity comparison in
  public health: they let a reader immediately identify pockets of above-average risk
  without reading through a table.

**Why not machine learning?**
With 10 provinces and 9 indicators (90 data points), there is not enough data to
train a meaningful model. Descriptive statistics and z-score ranking are both more
interpretable and statistically appropriate at this scale. Clustering (k-means on
the wide-format matrix) was considered but rejected: with only 10 entities the
cluster assignments are highly sensitive to initialisation and would produce
misleading confidence in groupings. Explicit z-score ranking is fully auditable.

**Alternatives considered:**
- **ARIMA / time-series:** CIHI releases one table per year; multi-year trend
  modelling would require stacking 5+ annual releases — beyond this project's scope.
- **Interactive dashboard (Dash / Streamlit):** Would improve usability but adds a
  server dependency. Static PNG outputs are more portable for a first-pass analysis.
- **Weighted composite score:** Domain experts might assign different weights to
  readmission vs. C-section rate. Equal-weight z-scoring is a defensible starting
  point; sensitivity analysis on weights is a natural next step.

---

## Written Response 3: Reflection

**Question:** Write a reflection on what you learned by completing this project.

---

**What worked better than expected:**
The `pandas` pivot/melt workflow for reshaping the CIHI data was cleaner than
anticipated. Writing a single `prepare_data()` function that handles both the real
XLSX and the synthetic CSV meant every piece of analysis logic could be tested
offline — a pattern I will reuse in future data projects. The heatmap immediately
highlighted Quebec as a consistent low-risk outlier, which was a finding I did not
expect and would not have spotted without the z-score colour encoding.

**What was harder than expected:**
The CIHI Excel workbook uses non-standard headers (merged cells, multi-row headers,
footnotes) common in government publications. The initial loader read `header=0`,
which produced garbage column names. Switching to `header=2` and stripping
whitespace fixed it, but this kind of offset issue is invisible until runtime. I now
build column-name inspection (`xl.sheet_names`, `print(df.columns[:5])`) into every
XLSX loader by default. Data cleaning took roughly 40% of total project time — far
more than the visualisation and analysis combined.

**What I would change next time:**
1. **Add multi-year trend analysis.** Stacking 3–5 annual CIHI releases would allow
   a simple linear trend line per province, showing whether high-risk provinces are
   improving or deteriorating over time.
2. **Build input validation early.** A short schema validation step at the top of
   `prepare_data()` — checking that expected columns exist before proceeding —
   would have saved multiple debugging cycles caused by column-name mismatches.
3. **Separate outputs by audience.** The current script writes everything to one
   `output/` folder. For a stakeholder delivery I would produce a concise "summary"
   PDF (key chart + ranking table) alongside the full technical CSV outputs.

**Bigger-picture learning:**
This project reinforced that government open data is rich but messy. The real skill
in applied data work is not modelling — it is building robust, documented ingestion
pipelines that any team member can run a year later on a new data release without
touching the analysis code. I structured `analysis.py` so that updating to the
2025-2026 CIHI release only requires dropping the new XLSX file into `data/` and
re-running; no code changes needed.
