import sys
import os
import joblib
import pandas as pd

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(ROOT_DIR)

from src.forecaster import iterative_forecast

CPO_MODEL_PATH = "models/fx_inr_usd_forecaster.joblib"
artifact = joblib.load(CPO_MODEL_PATH)

print("loaded model for : ", artifact["value_col"])
print("Last known date : ", artifact["last_date"])
print("Metrics : ", artifact["metrics"])

N_STEPS = 6 #6 months ahead

predictions, final_date = iterative_forecast(artifact, N_STEPS)

print("\nPredictions for fx: ")
for i,val in enumerate(predictions, start = 1):
    print(f"Month + {i} : {val:.2f}")

print("\nFinal Date : ", final_date)    
