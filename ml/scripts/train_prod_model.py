import sys
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(ROOT_DIR)

import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression

DATA_PATH = "data/prod_yearly.csv"
MODEL_PATH = "models/prod_model.joblib"

YEAR = "year"
TARGET = "prod"

def main():
    df = pd.read_csv(DATA_PATH)

    X = df[[YEAR]]
    y = df[TARGET]
    
    model = LinearRegression()
    model.fit(X,y)

    joblib.dump(model, MODEL_PATH)

    print("\n Model trained successfully")

    last_year = df[YEAR].max()
    next_year = last_year + 1

    next_year_df = pd.DataFrame({YEAR : [next_year]})
    next_year_pred = model.predict(next_year_df)[0]

    print("\n Prediction for next year : ", next_year_pred)

if __name__ == "__main__":
    main()