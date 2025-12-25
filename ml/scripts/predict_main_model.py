import sys
import os
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(ROOT_DIR)

import json
import joblib
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)

MODEL_PATH = os.path.join(
    ML_DIR,
    "models",
    "main_model.joblib"
)

bcd = float(sys.argv[1])
world_price = float(sys.argv[2])
fx = float(sys.argv[3])

model = joblib.load(MODEL_PATH)

X = pd.DataFrame([{
    "bcd_pct": bcd,
    "cpo_world_price_usd_per_t": world_price,
    "fx_inr_per_usd": fx
}])

pred = model.predict(X)[0]

print(json.dumps({
    "imports_mt": int(round(float(pred[0]), 0)),
    "domestic_retail_rs_per_kg": float(round(float(pred[1]), 2)),
    "farmgate_ffb_rs_per_kg": float(round(float(pred[2]), 2))
}))
