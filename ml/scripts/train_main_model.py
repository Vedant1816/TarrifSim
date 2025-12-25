import sys
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(ROOT_DIR)

import pandas as pd
import joblib
from sklearn.multioutput import MultiOutputRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

from src.config import FEATURE_COLS, TARGET_COLS

DATA_PATH = "data/policy_simulation_dataset.csv"
MODEL_PATH = "models/main_model.joblib"

def time_series_split(df, train_ratio = 0.8):
    split_idx = int(len(df) * train_ratio)
    return df.iloc[:split_idx], df.iloc[split_idx:]

def build_model():
    base_model = XGBRegressor(
        n_estimators = 1000,
        max_depth = 5,
        learning_rate = 0.05,
        subsample = 0.8,
        colsample_bytree = 0.8,
        objective = "reg:squarederror",
        random_state = 42
    )

    return MultiOutputRegressor(base_model)

def main():
    df = pd.read_csv(DATA_PATH)

    train_df, test_df = time_series_split(df)
    X_train = train_df[FEATURE_COLS]
    y_train = train_df[TARGET_COLS]

    model = build_model()
    model.fit(X_train, y_train)

    joblib.dump(model, MODEL_PATH)

    print("\n Model trained successfully and stored....... Now performing testing")

    X_test = test_df[FEATURE_COLS]
    y_test = test_df[TARGET_COLS]

    y_pred = model.predict(X_test)

    print("\n Test Results")

    for i,col in enumerate(TARGET_COLS):
        rmse = np.sqrt(mean_squared_error(y_test.iloc[:, i], y_pred[:, i]))
        r2 = r2_score(y_test.iloc[:, i], y_pred[:, i])

        print(f"{col} :  RMSE : {rmse},  R2 : {r2}")

if __name__ == "__main__":
    main()