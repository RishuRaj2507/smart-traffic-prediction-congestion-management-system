# 🚦 TrafficVision AI: Smart Congestion Management System

TrafficVision AI is a full-stack, machine-learning-powered platform designed to monitor, analyze, and predict urban traffic congestion in real-time. By combining a modern React frontend with a high-performance Python FastAPI backend, it processes live telemetry and utilizes a trained Random Forest model to forecast traffic density and flow velocity.

## 🚀 Tech Stack

* **Frontend:** React, Next.js, Tailwind CSS, Lucide Icons
* **Backend:** Python, FastAPI, Uvicorn
* **Database:** PostgreSQL, SQLAlchemy (ORM)
* **Machine Learning:** Scikit-Learn (Random Forest Regressor), Pandas, Joblib
* **Data Source:** Historical Kaggle Urban Traffic Dataset

## ✨ Core Features (Milestones 1 & 2)

* **Live Traffic Monitoring Dashboard:** Real-time monitoring of road utilization, vehicle counts, and average speeds across multiple city junctions.
* **AI Forecasting Engine:** A fully integrated ML pipeline that predicts future vehicle density and calculates expected congestion levels based on target vectors and timeframes.
* **Role-Based Access Control (RBAC):** UI dynamically adapts based on user roles (`ADMIN`, `OPERATOR`, `COMMUTER`) to restrict sensitive forecasting tools and system controls.
* **Persistent Data Storage:** Live traffic metrics and historical AI predictions are securely stored and queried using a local PostgreSQL database.

## 🛠️ Local Development Setup

Follow these steps to get the project running on your local machine.

### Prerequisites
* Node.js (v18+)
* Python (3.10+)
* PostgreSQL (Running on port 5432)

### 1. Database Configuration
1. Open your terminal and access PostgreSQL: `psql postgres`
2. Create the database: `CREATE DATABASE trafficvision_db;`
3. Exit PostgreSQL: `\q`

### 2. Backend & AI Setup
Open a terminal and navigate to the `backend` directory:
```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary pandas scikit-learn joblib

# IMPORTANT: Download the Kaggle traffic dataset and place it in backend/data/traffic.csv
# Train the AI model (Generates traffic_model.pkl)
python train_model.py

# Start the API Server
python app/main.py
