import warnings
import pandas as pd
import numpy as np
import joblib
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime
from sqlalchemy.orm import sessionmaker, Session, declarative_base

# Suppress scikit-learn version warnings for cleaner terminal output
warnings.filterwarnings("ignore")

# --- 1. POSTGRESQL DATABASE SETUP ---
DATABASE_URL = "postgresql://rishu@localhost:5432/trafficvision_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI(title="TrafficVision AI API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows any React port to connect during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. DATABASE MODELS (SQLAlchemy) ---
class DBUser(Base):
    __tablename__ = "users"
    email = Column(String, primary_key=True, index=True)
    password = Column(String)
    full_name = Column(String)
    role = Column(String)
    department = Column(String)

class LiveTrafficDB(Base):
    __tablename__ = "live_traffic"
    road_id = Column(String, primary_key=True, index=True)
    road_name = Column(String)
    vehicle_count = Column(Integer)
    speed_kmh = Column(Float)
    congestion_level = Column(String)
    last_updated = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Seed initial admin/operator users
db = SessionLocal()
if not db.query(DBUser).first():
    db.add_all([
        DBUser(email="admin.traffic@gmail.com", password="admin123", full_name="Chief Admin Officer", role="ADMIN", department="Central Traffic Control"),
        DBUser(email="operator.traffic@gmail.com", password="op123", full_name="Rajesh Kumar", role="OPERATOR", department="North Zone Monitoring"),
        DBUser(email="commuter.traffic@gmail.com", password="user123", full_name="Eena Commuter", role="COMMUTER", department="Public Access")
    ])
    db.commit()
db.close()

# --- 3. LOAD AI MODELS ---
try:
    model = joblib.load("traffic_rf_model.pkl")
    encoder = joblib.load("label_encoder.pkl")
    feature_encoders = joblib.load("feature_encoders.pkl")

    print("✅ AI Models Loaded Successfully")

except FileNotFoundError:
    model = None
    encoder = None
    feature_encoders = None

    print("⚠️ AI model files not found.")

# --- 4. PYDANTIC SCHEMAS ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    full_name: str
    email: str
    role: str
    department: str

# Schema for the Prediction POST request
class PredictionRequest(BaseModel):
    road_id: str
    hour: int

# --- 5. API ENDPOINTS ---

# Authentication Endpoint
@app.post("/api/auth/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    clean_email = user.email.lower().strip()
    db_user = db.query(DBUser).filter(DBUser.email == clean_email).first()
    
    if db_user and db_user.password == user.password:
        return {
            "access_token": f"jwt-token-{db_user.email}",
            "role": db_user.role,
            "user": {"full_name": db_user.full_name, "email": db_user.email, "role": db_user.role, "department": db_user.department}
        }
    
    if clean_email.endswith("@gmail.com") and len(user.password) >= 3:
        name_prefix = clean_email.split("@")[0].capitalize()
        assigned_role = "ADMIN" if "admin" in clean_email else ("OPERATOR" if "op" in clean_email else "COMMUTER")
        
        new_user = DBUser(
            email=clean_email,
            password=user.password,
            full_name=f"{name_prefix} ({assigned_role})",
            role=assigned_role,
            department="Dynamic Access User"
        )
        db.add(new_user)
        db.commit()

        return {
            "access_token": f"jwt-token-{clean_email}",
            "role": assigned_role,
            "user": {"full_name": new_user.full_name, "email": new_user.email, "role": new_user.role, "department": new_user.department}
        }
        
    raise HTTPException(status_code=400, detail="Invalid credentials.")

# Health Check Endpoint
@app.get("/api/health")
async def health():

    return {
        "status": "online",
        "model_loaded": model is not None,
        "database": "connected"
    }


# Analytics Endpoint
@app.get("/api/analytics")
async def analytics():

    try:

        df = pd.read_csv("data/ml_training_ready.csv")

        return {
            "total_roads": int(df["road_id"].nunique()),
            "total_events": int(len(df)),
            "avg_speed_limit": round(
                float(df["speed_limit_kmh"].mean()), 2
            ),
            "avg_daily_traffic": round(
                float(df["avg_daily_traffic"].mean()), 2
            ),
            "critical_events": int(
                len(df[df["severity"] == "Critical"])
            ),
            "major_events": int(
                len(df[df["severity"] == "Major"])
            ),
            "moderate_events": int(
                len(df[df["severity"] == "Moderate"])
            ),
            "minor_events": int(
                len(df[df["severity"] == "Minor"])
            )
        }

    except Exception as e:

        return {
            "error": str(e)
        }

# Dashboard Live Data Endpoint (Reads from CSV)
@app.get("/api/traffic/live")
async def get_live_traffic(city: str = None, area: str = None):
    """
    Reads the processed ML data and sends it to the frontend dashboard.
    """
    try:
        df = pd.read_csv('data/ml_training_ready.csv')
        
        # Rename the CSV columns to perfectly match what React expects
        rename_map = {
            'severity': 'congestion_level',
            'speed_limit_kmh': 'speed_kmh',
            'avg_daily_traffic': 'vehicle_count',
            'capacity_vehicles_per_hour': 'vehicle_count' 
        }
        df = df.rename(columns=rename_map)
        
        # --- 🚨 FIX: TRANSLATE STATUSES FOR THE FRONTEND ---
        # Convert Kaggle dataset terminology to our Dashboard terminology
        if 'congestion_level' in df.columns:
            df['congestion_level'] = df['congestion_level'].replace({
                'Major': 'HIGH',
                'Critical': 'HIGH',
                'Moderate': 'MODERATE',
                'Minor': 'LOW',
                'Low': 'LOW'
            })
            # Force everything to UPPERCASE to guarantee the frontend colors trigger correctly
            df['congestion_level'] = df['congestion_level'].astype(str).str.upper()
        # ---------------------------------------------------

        # Ensure we have realistic live vehicle counts
        if 'vehicle_count' in df.columns:
            df['vehicle_count'] = (df['vehicle_count'] / 24).fillna(45).astype(int)
        else:
            df['vehicle_count'] = np.random.randint(20, 150, size=len(df))
            
        # Ensure road names exist
        if 'road_name' not in df.columns:
            df['road_name'] = "Corridor " + df['road_id'].astype(str)

        # Ensure speed exists
        if 'speed_kmh' not in df.columns:
             df['speed_kmh'] = 45.0

        required_cols = ['road_id', 'road_name', 'vehicle_count', 'speed_kmh', 'congestion_level']
        
        # Filter out rows missing the congestion status
        df = df.dropna(subset=['congestion_level'])
        
        # Take the top 100 rows to prevent the browser table from lagging
        final_df = df[required_cols].head(100)
        
        return final_df.to_dict(orient='records')
        
    except Exception as e:
        print(f"Failed to read CSV: {e}")
        return []
    
# --- AI Forecasting Endpoint ---
@app.post("/api/traffic/predict")
async def run_prediction(request: PredictionRequest):

    if model is None:
        return {
            "error": "AI model not loaded"
        }

    try:

        df = pd.read_csv("data/ml_training_ready.csv")

        road_data = df[df["road_id"] == request.road_id]

        if road_data.empty:
            raise HTTPException(
                status_code=404,
                detail="Road not found"
            )

        row = road_data.iloc[0]

        # Encode categorical features
        encoded_event = feature_encoders["event_type"].transform(
            [str(row["event_type"])]
        )[0]

        encoded_cause = feature_encoders["cause"].transform(
            [str(row["cause"])]
        )[0]

        encoded_weather = feature_encoders["weather_condition"].transform(
            [str(row["weather_condition"])]
        )[0]

        encoded_road_type = feature_encoders["road_type"].transform(
            [str(row["road_type"])]
        )[0]

        encoded_surface = feature_encoders["surface_condition"].transform(
            [str(row["surface_condition"])]
        )[0]

        encoded_district = feature_encoders["district"].transform(
            [str(row["district"])]
        )[0]

        # Model Input
        input_data = np.array([[
            encoded_event,
            row["duration_minutes"],
            row["affected_lanes"],
            row["response_time_min"],
            row["casualties"],
            encoded_cause,
            encoded_weather,
            encoded_road_type,
            row["length_km"],
            row["lanes"],
            row["speed_limit_kmh"],
            row["capacity_vehicles_per_hour"],
            int(row["has_bus_lane"]),
            int(row["has_bike_lane"]),
            encoded_surface,
            encoded_district,
            row["avg_daily_traffic"],
            row["toll_rate_rp"]
        ]])

        # Prediction
        prediction = model.predict(input_data)

        probabilities = model.predict_proba(input_data)

        confidence = round(
            float(np.max(probabilities)) * 100,
            2
        )

        # Convert ML output to dashboard format
        raw_prediction = str(
            encoder.inverse_transform(
                prediction
            )[0]
        )

        severity_map = {
            "Critical": "HIGH",
            "Major": "HIGH",
            "Moderate": "MODERATE",
            "Minor": "LOW"
        }

        predicted_label = severity_map.get(
            raw_prediction,
            "MODERATE"
        )

        # Weather Translation
        weather_map = {
            "Hujan Lebat": "Heavy Rain",
            "Hujan Sedang": "Moderate Rain",
            "Hujan Ringan": "Light Rain",
            "Berawan": "Cloudy",
            "Cerah": "Clear Sky"
        }

        english_weather = weather_map.get(
            str(row["weather_condition"]),
            str(row["weather_condition"])
        )

        # Weather Metrics
        temperature_c = {
            "Heavy Rain": 24,
            "Moderate Rain": 26,
            "Light Rain": 28,
            "Cloudy": 29,
            "Clear Sky": 32
        }.get(english_weather, 30)

        precipitation_mm = {
            "Heavy Rain": 25,
            "Moderate Rain": 10,
            "Light Rain": 3,
            "Cloudy": 0,
            "Clear Sky": 0
        }.get(english_weather, 0)

        # Events
        events = []

        if int(row["affected_lanes"]) >= 2:
            events.append(
                "Multiple Lane Impact"
            )

        if int(row["response_time_min"]) > 20:
            events.append(
                "Slow Emergency Response"
            )

        if english_weather:
            events.append(
                f"Weather: {english_weather}"
            )

        if predicted_label == "HIGH":
            events.append(
                "Heavy Traffic Density"
            )

        elif predicted_label == "MODERATE":
            events.append(
                "Regular Peak Hour Flow"
            )

        else:
            events.append(
                "Free Flowing Traffic"
            )

        # Final Response
        return {
            "road_id": str(request.road_id),

            "predicted_congestion": str(
                predicted_label
            ),

            "confidence": float(
                confidence
            ),

            "district": str(
                row["district"]
            ),

            "road_type": str(
                row["road_type"]
            ),

            "weather_condition": str(
                english_weather
            ),

            "temperature_c": float(
                temperature_c
            ),

            "precipitation_mm": float(
                precipitation_mm
            ),

            "speed_limit_kmh": float(
                row["speed_limit_kmh"]
            ),

            "avg_daily_traffic": int(
                row["avg_daily_traffic"]
            ),

            "events": [
                str(event)
                for event in events
            ]
        }

    except Exception as e:

        return {
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)