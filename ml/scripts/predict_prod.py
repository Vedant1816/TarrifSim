import sys
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(ROOT_DIR)

import json
import joblib
import pandas as pd

SCRIPT_DIR = os.path.abspath(os.path.dirname(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
MODEL_PATH = os.path.join(
    ML_DIR,
    "models",
    "prod_model.joblib"
)

year = int(sys.argv[1])

model = joblib.load(MODEL_PATH)

X = pd.DataFrame({"year" : [year]})
pred = model.predict(X)[0]

print(json.dumps({
    "year": year,
    "domestic_production": round(pred, 2)
}))

