import sys
import os
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(ROOT_DIR)
import json
import joblib

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)

MODEL_PATH = os.path.join(
    ML_DIR,
    "models",
    "fx_inr_usd_forecaster.joblib"
)

from src.forecaster import iterative_forecast

n_steps = int(sys.argv[1])
artifact = joblib.load(MODEL_PATH)
predictions, last_date = iterative_forecast(artifact, n_steps)

result = {
    "target": artifact["value_col"],
    "start_from": artifact["last_date"],
    "horizon_months": n_steps,
    "predictions": [float(x) for x in predictions],
    "end_date": last_date,
    "metrics": artifact.get("metrics", {})
}

print(json.dumps(result))