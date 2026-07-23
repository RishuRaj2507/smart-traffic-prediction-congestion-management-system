import pandas as pd
import os

def debug_pipeline():
    # 1. Check if files exist
    files = ['data/road_network.csv', 'data/traffic_events.csv', 'data/weather_conditions.csv']
    for f in files:
        if os.path.exists(f):
            print(f"✅ Found: {f}")
        else:
            print(f"❌ MISSING: {f} - Please move your files into the /data folder!")
            return

    # 2. Try to load them
    try:
        print("Loading data...")
        roads = pd.read_csv('data/road_network.csv')
        events = pd.read_csv('data/traffic_events.csv')
        weather = pd.read_csv('data/weather_conditions.csv')
        print("✅ All files loaded into memory.")
    except Exception as e:
        print(f"❌ Failed to load CSVs: {e}")
        return

    # 3. Test a merge
    try:
        print("Testing merge...")
        merged = pd.merge(events, roads, on='road_id', how='left')
        print(f"✅ Merge successful! Rows: {len(merged)}")
        
        # 4. Try to save
        merged.to_csv('data/ml_training_ready.csv', index=False)
        print("✅ SUCCESS: ml_training_ready.csv was created in your /data folder!")
    except Exception as e:
        print(f"❌ Failed during merge/save: {e}")

if __name__ == "__main__":
    debug_pipeline()