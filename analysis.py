from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, root_mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

REQUIRED_COLUMNS = {
    "date",
    "province",
    "benchmark_price",
    "sales",
    "new_listings",
    "inventory_months",
    "unemployment_rate",
    "mortgage_rate",
    "population",
}
TARGET_COLUMN = "benchmark_price"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Forecast Canadian housing benchmark prices by province."
    )
    parser.add_argument(
        "--data",
        required=True,
        help="Path to the Kaggle housing market CSV file.",
    )
    parser.add_argument(
        "--output",
        default="output",
        help="Directory to write metrics, predictions, and charts.",
    )
    return parser.parse_args()


def load_data(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    if df["date"].isna().any():
        raise ValueError("Date column contains invalid values.")

    df = df.sort_values(["province", "date"]).reset_index(drop=True)
    return df


def fill_missing(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    numeric_columns = [
        "sales",
        "new_listings",
        "inventory_months",
        "unemployment_rate",
        "mortgage_rate",
        "population",
        TARGET_COLUMN,
    ]
    for column in numeric_columns:
        df[column] = df.groupby("province")[column].transform(
            lambda series: series.fillna(series.median())
        )
    df["province"] = df["province"].fillna("Unknown")
    return df


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["month"] = df["date"].dt.month
    df["year"] = df["date"].dt.year
    df["lag_price"] = df.groupby("province")[TARGET_COLUMN].shift(1)
    df["lag_price"] = df.groupby("province")["lag_price"].transform(
        lambda series: series.fillna(series.median())
    )
    return df


def time_split(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    last_date = df["date"].max()
    cutoff = last_date - pd.DateOffset(months=6)
    train = df[df["date"] <= cutoff]
    test = df[df["date"] > cutoff]
    if train.empty or test.empty:
        split_index = int(len(df) * 0.8)
        train = df.iloc[:split_index]
        test = df.iloc[split_index:]
    return train, test


def build_pipeline(model) -> Pipeline:
    numeric_features = [
        "sales",
        "new_listings",
        "inventory_months",
        "unemployment_rate",
        "mortgage_rate",
        "population",
        "month",
        "year",
        "lag_price",
    ]
    categorical_features = ["province"]

    preprocess = ColumnTransformer(
        transformers=[
            ("numeric", StandardScaler(), numeric_features),
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                categorical_features,
            ),
        ]
    )

    return Pipeline(
        steps=[
            ("preprocess", preprocess),
            ("model", model),
        ]
    )


def evaluate_model(y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, float]:
    mae = mean_absolute_error(y_true, y_pred)
    rmse = root_mean_squared_error(y_true, y_pred)
    denominator = np.where(y_true == 0, np.nan, y_true)
    mape = np.nanmean(np.abs((y_true - y_pred) / denominator)) * 100
    return {"mae": mae, "rmse": rmse, "mape": mape}


def save_predictions(
    output_dir: Path,
    test_df: pd.DataFrame,
    model_name: str,
    predictions: np.ndarray,
) -> None:
    output = test_df[["date", "province", TARGET_COLUMN]].copy()
    output["prediction"] = predictions
    output["model"] = model_name
    output_dir.mkdir(parents=True, exist_ok=True)
    predictions_path = output_dir / f"predictions_{model_name.lower()}.csv"
    output.to_csv(predictions_path, index=False)


def save_plot(
    output_dir: Path,
    test_df: pd.DataFrame,
    model_name: str,
    predictions: np.ndarray,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    plot_df = test_df[[TARGET_COLUMN]].copy()
    plot_df["prediction"] = predictions
    sns.set_theme(style="whitegrid")
    plt.figure(figsize=(7, 5))
    sns.scatterplot(x=plot_df[TARGET_COLUMN], y=plot_df["prediction"])
    max_value = max(plot_df[TARGET_COLUMN].max(), plot_df["prediction"].max())
    plt.plot([0, max_value], [0, max_value], linestyle="--", color="grey")
    plt.title(f"Actual vs Predicted ({model_name})")
    plt.xlabel("Actual Benchmark Price")
    plt.ylabel("Predicted Benchmark Price")
    plt.tight_layout()
    plt.savefig(output_dir / f"actual_vs_predicted_{model_name.lower()}.png")
    plt.close()


def save_feature_importance(
    output_dir: Path, pipeline: Pipeline, model_name: str
) -> None:
    model = pipeline.named_steps["model"]
    if not hasattr(model, "feature_importances_"):
        return
    feature_names = pipeline.named_steps["preprocess"].get_feature_names_out()
    importance_df = (
        pd.DataFrame(
            {
                "feature": feature_names,
                "importance": model.feature_importances_,
            }
        )
        .sort_values("importance", ascending=False)
        .reset_index(drop=True)
    )
    output_dir.mkdir(parents=True, exist_ok=True)
    importance_df.to_csv(
        output_dir / f"feature_importance_{model_name.lower()}.csv", index=False
    )


def main() -> None:
    args = parse_args()
    data_path = Path(args.data)
    output_dir = Path(args.output)

    df = load_data(data_path)
    df = fill_missing(df)
    df = add_features(df)

    train_df, test_df = time_split(df)
    feature_columns = [
        "sales",
        "new_listings",
        "inventory_months",
        "unemployment_rate",
        "mortgage_rate",
        "population",
        "month",
        "year",
        "lag_price",
        "province",
    ]

    X_train = train_df[feature_columns]
    y_train = train_df[TARGET_COLUMN]
    X_test = test_df[feature_columns]
    y_test = test_df[TARGET_COLUMN]

    models = {
        "LinearRegression": LinearRegression(),
        "RandomForest": RandomForestRegressor(
            n_estimators=300, random_state=42, min_samples_leaf=2
        ),
    }

    metrics_records = []
    for model_name, model in models.items():
        pipeline = build_pipeline(model)
        pipeline.fit(X_train, y_train)
        predictions = pipeline.predict(X_test)
        metrics = evaluate_model(y_test.to_numpy(), predictions)
        metrics_records.append({"model": model_name, **metrics})

        save_predictions(output_dir, test_df, model_name, predictions)
        save_plot(output_dir, test_df, model_name, predictions)
        save_feature_importance(output_dir, pipeline, model_name)

    metrics_df = pd.DataFrame(metrics_records)
    output_dir.mkdir(parents=True, exist_ok=True)
    metrics_df.to_csv(output_dir / "metrics.csv", index=False)
    print(metrics_df.to_string(index=False))


if __name__ == "__main__":
    main()
