import os
import joblib
from datetime import timedelta, datetime
from collections import deque

import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error

def make_lag_features(df, date_col, value_col, n_lags=12, rolls=(3,6)):
    """
    Build monthly lag + rolling features for a single series.
    Assumptions:
      - df has one row per month, sorted by date (oldest -> newest).
      - date_col is a date-like column (string or datetime).
      - value_col is the numeric series to forecast.

    Parameters:
      - df: DataFrame containing date_col and value_col
      - date_col: name of date column (e.g. 'timeline')
      - value_col: name of series column (e.g. 'cpo_world_price')
      - n_lags: how many lag columns to create (default 12)
      - rolls: tuple of integers for rolling-mean windows (e.g. (3,6))

    Returns:
      - X: DataFrame of features (lag_1..lag_n, roll_mean_*, month)
      - y: Series target (value_col at time t)
      - last_window: collections.deque of last n_lags observed values (most recent on the right)
      - last_date: Timestamp of last observed date (most recent historical date)
      - feature_cols: list of column names produced in X (ordered)
    """
    # shallow copy, parse dates and sort
    df2 = df[[date_col, value_col]].copy()
    df2[date_col] = pd.to_datetime(df2[date_col])
    df2 = df2.sort_values(date_col).reset_index(drop=True)

    # sanity check: need more rows than n_lags to produce training rows
    if df2.shape[0] <= n_lags:
        raise ValueError(f"Not enough rows ({df2.shape[0]}) to create {n_lags} lags. Add more history or reduce n_lags.")

    # create lag columns: lag_1 is t-1, lag_n is t-n
    for lag in range(1, n_lags + 1):
        df2[f"lag_{lag}"] = df2[value_col].shift(lag)

    # create rolling mean features using past values only (shifted)
    for r in rolls:
        df2[f"roll_mean_{r}"] = df2[value_col].shift(1).rolling(window=r, min_periods=1).mean()

    # month feature for seasonality
    df2["month"] = df2[date_col].dt.month

    # drop rows with NaNs created by lagging (top n_lags rows)
    df_feats = df2.dropna().reset_index(drop=True)

    # feature column order (consistent)
    feature_cols = [c for c in df_feats.columns if c not in (date_col, value_col)]

    X = df_feats[feature_cols].copy()
    y = df_feats[value_col].copy()

    # last window: the most recent n_lags observed values (for iterative forecasting)
    last_window_values = df2[value_col].iloc[-n_lags:].tolist()
    from collections import deque
    last_window = deque(last_window_values, maxlen=n_lags)

    last_date = df2[date_col].iloc[-1]

    return X, y, last_window, last_date, feature_cols

def train_forecaster(
    df,
    date_col,
    value_col,
    model_out_path,
    n_lags=12,
    rolls=(3, 6),
    test_size=0.2,
    random_state=42
):
    """
    Train a monthly time-series forecaster using XGBoost.

    Parameters:
    - df : DataFrame with date_col and value_col
    - date_col : timeline column name
    - value_col : column to forecast
    - model_out_path : where to save the trained model (.joblib)
    - n_lags : number of lag features
    - rolls : rolling mean windows
    - test_size : fraction of data for validation (last portion)
    """

    # 1. Create lag features
    X, y, last_window, last_date, feature_cols = make_lag_features(
        df,
        date_col=date_col,
        value_col=value_col,
        n_lags=n_lags,
        rolls=rolls
    )

    # 2. Time-respecting train/validation split
    split_idx = int((1 - test_size) * len(X))

    X_train = X.iloc[:split_idx]
    X_val   = X.iloc[split_idx:]

    y_train = y.iloc[:split_idx]
    y_val   = y.iloc[split_idx:]

    # 3. Initialize XGBoost regressor
    model = XGBRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.05,
        objective="reg:squarederror",
        random_state=random_state,
        verbosity=0
    )

    # 4. Train model
    model.fit(X_train, y_train)

    # 5. Evaluate
    y_pred = model.predict(X_val)
    mae = mean_absolute_error(y_val, y_pred)
    rmse = np.sqrt(mean_squared_error(y_val, y_pred))

    metrics = {
        "MAE": float(mae),
        "RMSE": float(rmse)
    }

    # 6. Save model + metadata
    os.makedirs(os.path.dirname(model_out_path), exist_ok=True)

    artifact = {
        "model": model,
        "n_lags": n_lags,
        "rolls": rolls,
        "feature_cols": feature_cols,
        "date_col": date_col,
        "value_col": value_col,
        "last_window": list(last_window),
        "last_date": last_date.strftime("%Y-%m-%d"),
        "metrics": metrics
    }

    joblib.dump(artifact, model_out_path)

    return artifact

def iterative_forecast(saved_artifact, n_steps):
    model = saved_artifact["model"]
    n_lags = saved_artifact["n_lags"]
    rolls = saved_artifact["rolls"]
    feature_cols = saved_artifact["feature_cols"]

    from collections import deque
    buffer = deque(saved_artifact["last_window"], maxlen=n_lags)

    current_date = pd.to_datetime(saved_artifact["last_date"])
    predictions = []

    for _ in range(n_steps):
        features = {}

        for i in range(1, n_lags + 1):
            features[f"lag_{i}"] = buffer[-i]

        for r in rolls:
            recent_vals = list(buffer)[-r:]
            features[f"roll_mean_{r}"] = float(np.mean(recent_vals))

        next_date = current_date + pd.DateOffset(months=1)
        features["month"] = next_date.month

        X_next = pd.DataFrame([{col: features[col] for col in feature_cols}])

        y_pred = float(model.predict(X_next)[0])
        predictions.append(y_pred)

        buffer.append(y_pred)
        current_date = next_date

    return predictions, current_date.strftime("%Y-%m-%d")

