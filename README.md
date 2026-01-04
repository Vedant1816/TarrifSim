# 🚀 Tariff Sim

Tariff Sim is a full-stack web application designed to **simulate, analyze, and visualize tariff and economic data** using real-world APIs and machine learning models.  
The project combines a modern frontend, a robust backend, and an ML pipeline to provide meaningful insights into tariffs, currencies, and economic indicators.

---

## ✨ Features

- 📊 Interactive tariff and economic data visualization
- 🔐 User authentication using Supabase
- 🌍 Real-world economic data via FRED & Currency APIs
- 🤖 Machine Learning–based predictions
- 🧠 AI-powered insights using Gemini API
- ⚡ Modern React (Vite) + Tailwind CSS frontend
- 🛠️ Modular Node.js + Express backend

---

## 🧱 Project Structure

- ├── client/  React (Vite) frontend 
- ├── server/  Node.js + Express backend
- ├── ml/  Machine Learning models & scripts
- ├── venv/  Python virtual environment (local)
- ├── node_modules/
- ├── package.json
- ├── package-lock.json
- └── .gitignore

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Supabase Authentication
- Deployment: Vercel

### Backend
- Node.js
- Express
- JWT Authentication
- Supabase (Database & Admin access)
- Deployment: Render

### Machine Learning
Implemented in Python and integrated with the backend for predictions.

> Training scripts are included.  
> Training datasets are intentionally excluded.

---

## 🔐 Environment Variables

### 📁 `client/.env`


Create a `.env` file inside the `client` folder:

```env
VITE_API_URL=your_backend_api_url
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
### 📁 `server/.env`


Create a `.env` file inside the `client` folder:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret
FRED_API_KEY=your_fred_api_key
CURRENCY_API_KEY=your_currencyfreaks_api_key
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

---
## 🔗 API Providers

The project relies on the following external APIs for data and AI-powered features:

- **FRED (Federal Reserve Economic Data)**  
  Used for macroeconomic and financial indicators  
  https://fred.stlouisfed.org/

- **Currency Freaks API**  
  Used for real-time and historical currency exchange rates  
  https://currencyfreaks.com/

- **Google Gemini API**  
  Used for AI-powered insights and analysis  
  https://aistudio.google.com/

Make sure to generate your own API keys from the respective platforms and add them to the appropriate `.env` files before running the project.


## 🗄️ Supabase Setup

Each contributor should create **their own Supabase project**.

### Required Table: `users`

Create a table named `users` with the following schema:

| Column | Type | Constraints |
|------|------|-------------|
| id | uuid | Primary Key |
| email | text | Not null |

Supabase Auth is used for authentication.  
This table is used for application-level user handling.

---

## 🤖 Machine Learning Setup

The ML pipeline lives in the `ml/` folder.

- Training scripts are included
- Prediction scripts are consumed by the backend
- Training datasets are intentionally excluded

### Python Libraries Used
- pandas
- numpy
- scikit-learn
- xgboost
- joblib
- matplotlib
- fastapi
- uvicorn
- pydantic
- shap

---

## 🐍 Python Virtual Environment Setup

### Windows
```bash
cd ml
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### macOS/Linux
```bash
cd ml
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
## ▶️ Running the Project Locally

Make sure all environment variables are set correctly before starting.

### Frontend (Client)
```bash
cd client
npm install
npm run dev
```
The frontend will start on the default Vite development port.

---

### Backend (Server)
```bash
cd server
npm install
nodemon index.js
```
The backend runs on:
http://localhost:3000

The backend uses ML prediction scripts ao ensure the Python virtual environment is active.

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

Please ensure no sensitive data (API keys or secrets) is committed.

---

## 🙌 Acknowledgements

Supabase  
FRED Economic Data  
Currency Freaks  
Google Gemini API  
Open-source Machine Learning ecosystem

