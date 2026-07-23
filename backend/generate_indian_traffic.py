import pandas as pd
import random
import string
from datetime import datetime, timedelta

# 1. The exact dictionary from your React Frontend
location_hierarchy = {
    "Mumbai": {"areas": ["Bandra Kurla Complex (BKC)", "Andheri East", "Dadar", "Lower Parel", "Navi Mumbai"], "plate": "MH"},
    "Delhi": {"areas": ["Connaught Place", "Hauz Khas", "Karol Bagh", "Chandni Chowk", "Gurugram Cyber City"], "plate": "DL"},
    "Bengaluru": {"areas": ["Electronic City", "Whitefield", "Koramangala", "Indiranagar", "Silk Board Junction"], "plate": "KA"},
    "Chennai": {"areas": ["T Nagar", "Anna Nagar", "Velachery", "Adyar", "OMR IT Expressway"], "plate": "TN"},
    "Hyderabad": {"areas": ["HITEC City", "Gachibowli", "Banjara Hills", "Jubilee Hills", "Secunderabad"], "plate": "TS"},
    "Kolkata": {"areas": ["Park Street", "Salt Lake Sector V", "Howrah Bridge", "New Town", "Esplanade"], "plate": "WB"},
    "Pune": {"areas": ["Hinjewadi IT Park", "Koregaon Park", "Viman Nagar", "Shivajinagar", "Wakad"], "plate": "MH"}
}

weather_conditions = ["Clear", "Rainy", "Foggy", "Overcast"]

def generate_vehicle_id(state_code):
    """Generates a random Indian license plate (e.g., MH-01-AB-1234)"""
    district = str(random.randint(1, 14)).zfill(2)
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    numbers = ''.join(random.choices(string.digits, k=4))
    return f"{state_code}-{district}-{letters}-{numbers}"

def determine_congestion(count, speed):
    """Determines congestion status based on density and velocity"""
    if count > 100 or speed < 25:
        return "HIGH"
    elif count > 60 or speed < 45:
        return "MODERATE"
    return "LOW"

print("🚦 Booting up TrafficVision Synthetic Data Engine...")

# Generate 5,000 rows of realistic traffic data
data = []
start_time = datetime.now() - timedelta(days=30) # 30 days of historical data

for i in range(5000):
    city = random.choice(list(location_hierarchy.keys()))
    area = random.choice(location_hierarchy[city]["areas"])
    state_code = location_hierarchy[city]["plate"]
    
    # Simulate rush hour logic (more vehicles, slower speeds)
    is_rush_hour = random.choice([True, False, False]) 
    vehicle_count = random.randint(80, 150) if is_rush_hour else random.randint(10, 70)
    speed_kmh = random.randint(10, 30) if is_rush_hour else random.randint(35, 70)
    
    record = {
        "timestamp": (start_time + timedelta(minutes=i*15)).strftime("%Y-%m-%d %H:%M:%S"),
        "vehicle_id": generate_vehicle_id(state_code),
        "city": city,
        "area": area,
        "weather": random.choice(weather_conditions),
        "vehicle_count": vehicle_count,
        "speed_kmh": speed_kmh,
        "congestion_level": determine_congestion(vehicle_count, speed_kmh)
    }
    data.append(record)

# 3. Export to CSV
df = pd.DataFrame(data)
df.to_csv("data/indian_metro_traffic.csv", index=False)

print("✅ Success! Generated 'data/indian_metro_traffic.csv' with 5,000 realistic records.")
print("📊 Included Features: Timestamp, Vehicle ID, City, Area, Weather, Count, Speed, Congestion")