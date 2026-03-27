"""
CIHI Childbirth Indicators 2024-2025 - Capstone Analysis
Skills for Hire Atlantic | Advanced Data + AI Program

Problem:
  Which Canadian provinces have the highest-risk childbirth profiles
  (elevated C-section rates, longer hospital stays, higher 30-day readmissions)
  and how do provincial intervention rates compare to the national average?

Data source:
  Real data - CIHI DAD/HMDB Childbirth 2024-2025 Data Tables:
  https://www.cihi.ca/sites/default/files/document/dad-hmdb-childbirth-2024-2025-data-tables-en.xlsx

  To use the real data, download the .xlsx file and place it in the data/ directory.
  Without it the script falls back to the included synthetic sample CSV.

Usage:
  pip install -r requirements.txt
  python analysis.py
"""

import os
import warnings

import matplotlib
matplotlib.use("Agg")  # non-interactive backend - safe for script execution
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import pandas as pd
import seaborn as sns

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(BASE_DIR, "data")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
XLSX_PATH  = os.path.join(DATA_DIR, "dad-hmdb-childbirth-2024-2025-data-tables-en.xlsx")
CSV_PATH   = os.path.join(DATA_DIR, "cihi_childbirth_2024_2025_sample.csv")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Style
# ---------------------------------------------------------------------------
PALETTE = sns.color_palette("muted", 10)
sns.set_theme(style="whitegrid", palette=PALETTE)


# ===========================================================================
# 1. DATA LOADING & PREPARATION
# ===========================================================================

def load_data() -> pd.DataFrame:
    """
    Load CIHI childbirth data.
    Priority:
      1. Real XLSX (dad-hmdb-childbirth-2024-2025-data-tables-en.xlsx) in data/
      2. Synthetic sample CSV (cihi_childbirth_2024_2025_sample.csv) in data/
    """
    if os.path.exists(XLSX_PATH):
        print(f"[INFO] Loading real CIHI data from {XLSX_PATH}")
        xl = pd.ExcelFile(XLSX_PATH)
        print(f"[INFO] Available sheets: {xl.sheet_names}")
        sheet = xl.sheet_names[0]
        df = xl.parse(sheet, header=2)
        df.columns = df.columns.str.strip()
        df = df.dropna(how="all")
        print(f"[INFO] Loaded {len(df)} rows from sheet '{sheet}'")
        return df

    print(f"[INFO] XLSX not found - using synthetic sample data from {CSV_PATH}")
    return pd.read_csv(CSV_PATH)


def prepare_data(df: pd.DataFrame) -> tuple:
    """
    Normalise raw dataframe into consistent long and wide formats.

    Returns:
      df_long : Province/Territory | Indicator | Rate
      df_wide : provinces (rows) x indicators (columns)
    """
    required = {"Province/Territory", "Indicator", "Rate"}
    if required.issubset(df.columns):
        df_long = df[list(required)].copy()
        df_long["Rate"] = pd.to_numeric(df_long["Rate"], errors="coerce")
        df_long = df_long.dropna(subset=["Rate"])
    else:
        # Generic pivot for alternate XLSX layouts
        df_long = df.melt(
            id_vars=[df.columns[0]],
            var_name="Indicator",
            value_name="Rate",
        ).rename(columns={df.columns[0]: "Province/Territory"})
        df_long["Rate"] = pd.to_numeric(df_long["Rate"], errors="coerce")
        df_long = df_long.dropna(subset=["Rate"])

    df_wide = df_long.pivot_table(
        index="Province/Territory",
        columns="Indicator",
        values="Rate",
        aggfunc="mean",
    )
    return df_long, df_wide


# ===========================================================================
# 2. EXPLORATORY DATA ANALYSIS
# ===========================================================================

def eda_summary(df_long: pd.DataFrame, df_wide: pd.DataFrame) -> None:
    """Print summary statistics to stdout."""
    print("\n" + "=" * 60)
    print("EXPLORATORY DATA ANALYSIS")
    print("=" * 60)

    print(f"\nLong format shape : {df_long.shape}")
    print(f"Wide format shape : {df_wide.shape}")

    print("\nIndicators covered:")
    for ind in sorted(df_long["Indicator"].unique()):
        print(f"  - {ind}")

    print("\nNational averages across all provinces:")
    nat_avg = df_long.groupby("Indicator")["Rate"].mean().sort_values(ascending=False)
    print(nat_avg.to_string())

    csec_cols = [c for c in df_wide.columns if "caesarean section rate" in c.lower()]
    if csec_cols:
        col = csec_cols[0]
        nat_mean = df_wide[col].mean()
        above = df_wide[df_wide[col] > nat_mean][col].sort_values(ascending=False)
        print(f"\nProvinces above national C-section average ({nat_mean:.1f}%):")
        for prov, val in above.items():
            print(f"  {prov}: {val:.1f}%")


# ===========================================================================
# 3. VISUALISATIONS
# ===========================================================================

def plot_csection_by_province(df_long: pd.DataFrame) -> None:
    """Fig 1 - Horizontal bar: C-section rate by province."""
    csec = df_long[
        df_long["Indicator"].str.contains("Caesarean section rate", case=False)
    ].copy()
    if csec.empty:
        print("[WARN] No C-section data found - skipping Fig 1.")
        return

    csec = csec.sort_values("Rate", ascending=False)
    nat_mean = csec["Rate"].mean()

    fig, ax = plt.subplots(figsize=(11, 5))
    colors = [PALETTE[1] if r > nat_mean else PALETTE[0] for r in csec["Rate"]]
    bars = ax.barh(
        csec["Province/Territory"], csec["Rate"],
        color=colors, edgecolor="white", height=0.7,
    )
    ax.axvline(nat_mean, color="crimson", linestyle="--", linewidth=1.5,
               label=f"National avg: {nat_mean:.1f}%")
    ax.bar_label(bars, fmt="%.1f%%", padding=4, fontsize=9)
    ax.set_xlabel("Rate (%)", fontsize=11)
    ax.set_title(
        "Caesarean Section Rate by Province/Territory - 2024-2025",
        fontsize=13, fontweight="bold",
    )
    ax.legend(fontsize=10)
    ax.xaxis.set_major_formatter(mticker.PercentFormatter())
    ax.invert_yaxis()
    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "fig1_csection_by_province.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"[SAVED] {path}")


def plot_los_comparison(df_long: pd.DataFrame) -> None:
    """Fig 2 - Grouped bar: length of stay (vaginal vs C-section)."""
    los_keywords = ["length of stay"]
    los = df_long[
        df_long["Indicator"].str.lower().str.contains("|".join(los_keywords))
    ].copy()
    if los.empty:
        print("[WARN] No length-of-stay data found - skipping Fig 2.")
        return

    first_col = list(los["Indicator"].unique())[0]
    pivot = los.pivot_table(
        index="Province/Territory", columns="Indicator", values="Rate"
    ).sort_values(first_col, ascending=False)

    cols = list(pivot.columns)
    x = np.arange(len(pivot))
    width = 0.38

    fig, ax = plt.subplots(figsize=(11, 5))
    ax.bar(x - width / 2, pivot[cols[0]], width,
           label=cols[0], color=PALETTE[2], edgecolor="white")
    if len(cols) > 1:
        ax.bar(x + width / 2, pivot[cols[1]], width,
               label=cols[1], color=PALETTE[4], edgecolor="white")

    ax.set_xticks(x)
    ax.set_xticklabels(pivot.index, rotation=35, ha="right", fontsize=9)
    ax.set_ylabel("Days", fontsize=11)
    ax.set_title(
        "Average Length of Hospital Stay by Province/Territory - 2024-2025",
        fontsize=13, fontweight="bold",
    )
    ax.legend(fontsize=9)
    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "fig2_length_of_stay.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"[SAVED] {path}")


def plot_indicator_heatmap(df_wide: pd.DataFrame) -> None:
    """Fig 3 - Heatmap of all indicators across provinces (z-scored colours)."""
    if df_wide.empty:
        return

    short = {c: c.split("(")[0].strip()[:38] for c in df_wide.columns}
    display = df_wide.rename(columns=short)

    norm = (display - display.mean()) / display.std()

    fig, ax = plt.subplots(figsize=(14, 6))
    sns.heatmap(
        norm,
        annot=df_wide.round(1),
        fmt="g",
        cmap="RdYlGn_r",
        linewidths=0.5,
        ax=ax,
        cbar_kws={"label": "Z-score (deviation from national mean)"},
        annot_kws={"size": 8},
    )
    ax.set_title(
        "Childbirth Indicator Heatmap by Province - 2024-2025\n"
        "(colour = deviation from national mean; numbers = actual values)",
        fontsize=12, fontweight="bold",
    )
    ax.set_xlabel("")
    ax.set_ylabel("")
    ax.tick_params(axis="x", rotation=35, labelsize=9)
    ax.tick_params(axis="y", rotation=0, labelsize=9)
    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "fig3_indicator_heatmap.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"[SAVED] {path}")


def plot_csection_vs_readmission(df_wide: pd.DataFrame) -> None:
    """Fig 4 - Scatter: C-section rate vs 30-day readmission rate."""
    csec_col  = next((c for c in df_wide.columns if "caesarean section rate" in c.lower()), None)
    readm_col = next((c for c in df_wide.columns if "readmission" in c.lower()), None)
    if not csec_col or not readm_col:
        print("[WARN] Missing C-section or readmission column - skipping Fig 4.")
        return

    sub  = df_wide[[csec_col, readm_col]].dropna()
    corr = sub[csec_col].corr(sub[readm_col])

    fig, ax = plt.subplots(figsize=(8, 6))
    ax.scatter(sub[csec_col], sub[readm_col],
               s=90, color=PALETTE[3], edgecolors="white", zorder=3)

    for prov, row in sub.iterrows():
        ax.annotate(
            prov.split(" ")[0],
            (row[csec_col], row[readm_col]),
            textcoords="offset points", xytext=(6, 4), fontsize=8,
        )

    m, b = np.polyfit(sub[csec_col], sub[readm_col], 1)
    x_line = np.linspace(sub[csec_col].min(), sub[csec_col].max(), 50)
    ax.plot(x_line, m * x_line + b, "--", color="grey", linewidth=1.2)

    ax.set_xlabel("Caesarean Section Rate (%)", fontsize=11)
    ax.set_ylabel("30-Day Readmission Rate (per 1,000 deliveries)", fontsize=11)
    ax.set_title(
        f"C-Section Rate vs. 30-Day Readmission Rate  (r = {corr:.2f})",
        fontsize=13, fontweight="bold",
    )
    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "fig4_csection_vs_readmission.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"[SAVED] {path}")


# ===========================================================================
# 4. STATISTICAL ANALYSIS
# ===========================================================================

def rank_provinces(df_wide: pd.DataFrame) -> pd.DataFrame:
    """
    Composite risk score = mean z-score of:
      C-section rate  +  C-section LOS  +  30-day readmission rate
    Higher score -> higher-risk childbirth profile.
    """
    # Two LOS patterns handle different dash characters used across CIHI releases
    risk_keywords = ["caesarean section rate", "readmission",
                     "caesarean section (days)", "caesarean section - days"]
    risk_cols = [
        c for c in df_wide.columns
        if any(kw in c.lower() for kw in risk_keywords)
    ]
    if not risk_cols:
        print("[WARN] No risk columns found for composite score.")
        return pd.DataFrame()

    sub  = df_wide[risk_cols].copy()
    z    = (sub - sub.mean()) / sub.std()
    comp = z.mean(axis=1).rename("Composite Risk Score")
    ranked = comp.sort_values(ascending=False).reset_index()
    ranked.insert(0, "Rank", range(1, len(ranked) + 1))

    print("\nProvincial Composite Risk Ranking:")
    print(ranked.to_string(index=False))
    return ranked


def deviation_table(df_long: pd.DataFrame) -> pd.DataFrame:
    """Per-province absolute and relative deviation from national mean per indicator."""
    nat = df_long.groupby("Indicator")["Rate"].mean().rename("National Mean")
    merged = df_long.join(nat, on="Indicator")
    merged["Abs Deviation"]     = (merged["Rate"] - merged["National Mean"]).round(2)
    merged["Rel Deviation (%)"] = (
        (merged["Abs Deviation"] / merged["National Mean"]) * 100
    ).round(1)
    return merged.sort_values(["Indicator", "Abs Deviation"], ascending=[True, False])


# ===========================================================================
# 5. MAIN
# ===========================================================================

def main() -> None:
    print("=" * 60)
    print("CIHI Childbirth Indicators 2024-2025 - Capstone Analysis")
    print("=" * 60)

    raw = load_data()
    df_long, df_wide = prepare_data(raw)

    eda_summary(df_long, df_wide)

    print("\n[INFO] Generating charts ...")
    plot_csection_by_province(df_long)
    plot_los_comparison(df_long)
    plot_indicator_heatmap(df_wide)
    plot_csection_vs_readmission(df_wide)

    ranked = rank_provinces(df_wide)
    dev    = deviation_table(df_long)

    dev_path = os.path.join(OUTPUT_DIR, "provincial_deviations.csv")
    dev.to_csv(dev_path, index=False)
    print(f"\n[SAVED] {dev_path}")

    if not ranked.empty:
        rank_path = os.path.join(OUTPUT_DIR, "composite_risk_ranking.csv")
        ranked.to_csv(rank_path, index=False)
        print(f"[SAVED] {rank_path}")

    print(f"\n[DONE] All outputs written to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
