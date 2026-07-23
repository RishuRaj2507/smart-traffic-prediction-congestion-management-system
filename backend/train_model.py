import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

MODEL_FILE = "traffic_rf_model.pkl"
TARGET_ENCODER_FILE = "label_encoder.pkl"
FEATURE_ENCODERS_FILE = "feature_encoders.pkl"


def train_traffic_model():

    print("1. Loading dataset...")

    df = pd.read_csv("data/ml_training_ready.csv")

    print(f"Dataset Shape: {df.shape}")

    print("2. Encoding categorical features...")

    categorical_columns = [
        "event_type",
        "cause",
        "weather_condition",
        "road_type",
        "surface_condition",
        "district"
    ]

    feature_encoders = {}

    for col in categorical_columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        feature_encoders[col] = le

    print("3. Encoding target...")

    target_encoder = LabelEncoder()

    df["target"] = target_encoder.fit_transform(
        df["severity"]
    )

    print("4. Selecting features...")

    feature_columns = [

        # Incident Information
        "event_type",
        "duration_minutes",
        "affected_lanes",
        "response_time_min",
        "casualties",
        "cause",

        # Weather
        "weather_condition",

        # Road Properties
        "road_type",
        "length_km",
        "lanes",
        "speed_limit_kmh",
        "capacity_vehicles_per_hour",

        # Infrastructure
        "has_bus_lane",
        "has_bike_lane",
        "surface_condition",

        # Geography
        "district",

        # Traffic Volume
        "avg_daily_traffic",

        # Economics
        "toll_rate_rp"
    ]

    X = df[feature_columns]
    y = df["target"]

    print("5. Train Test Split...")

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    print("6. Training Random Forest...")

    model = RandomForestClassifier(
        n_estimators=500,
        max_depth=20,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train, y_train)

    print("7. Evaluating...")

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    print(f"\nAccuracy: {accuracy:.4f}")

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            predictions,
            target_names=target_encoder.classes_
        )
    )

    importance_df = pd.DataFrame({
        "feature": feature_columns,
        "importance": model.feature_importances_
    })

    importance_df = importance_df.sort_values(
        by="importance",
        ascending=False
    )

    print("\nTop Features:\n")
    print(importance_df.head(10))

    print("\n8. Saving model files...")

    joblib.dump(model, MODEL_FILE)

    joblib.dump(
        target_encoder,
        TARGET_ENCODER_FILE
    )

    joblib.dump(
        feature_encoders,
        FEATURE_ENCODERS_FILE
    )

    print("\n✅ Model Saved")
    print(f"✅ {MODEL_FILE}")
    print(f"✅ {TARGET_ENCODER_FILE}")
    print(f"✅ {FEATURE_ENCODERS_FILE}")


if __name__ == "__main__":
    train_traffic_model()