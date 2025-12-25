import sys
import os

# Add project root (ml/) to Python path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(ROOT_DIR)

import pandas as pd

from src.forecaster import train_forecaster

DATA_PATH = "data/palm_oil_training_dataset.csv"

df = pd.read_csv(DATA_PATH)

# Inspect columns
print("Columns in dataset:")
print(df.columns.tolist())

# Preview first few rows
print("\nSample data:")
print(df.head())

# Model output paths
CPO_MODEL_PATH = "models/cpo_world_price_forecaster.joblib"
FX_MODEL_PATH  = "models/fx_inr_usd_forecaster.joblib"

print("\nTraining CPO world price forecaster...")

cpo_artifact = train_forecaster(
    df=df,
    date_col="date",
    value_col="cpo_world_price_usd_per_t",
    model_out_path=CPO_MODEL_PATH,
    n_lags=12,
    rolls=(3, 6)
)

print("CPO forecaster metrics:", cpo_artifact["metrics"])

print("\nTraining FX INR/USD forecaster...")

fx_artifact = train_forecaster(
    df=df,
    date_col="date",
    value_col="fx_inr_per_usd",
    model_out_path=FX_MODEL_PATH,
    n_lags=12,
    rolls=(3, 6)
)

print("FX forecaster metrics:", fx_artifact["metrics"])