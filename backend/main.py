from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data
MOCK_CHART_DATA = {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "datasets": [
        {
            "label": "Revenue",
            "data": [12000, 15000, 10000, 18000, 22000, 25000],
            "borderColor": "rgb(75, 192, 192)",
            "backgroundColor": "rgba(75, 192, 192, 0.1)",
        },
        {
            "label": "Expenses",
            "data": [8000, 9000, 7500, 10000, 12000, 13000],
            "borderColor": "rgb(255, 99, 132)",
            "backgroundColor": "rgba(255, 99, 132, 0.1)",
        },
    ],
}

MOCK_TABLE_DATA = [
    {"id": 1, "name": "Product A", "sales": 12500, "revenue": 125000, "margin": "35%"},
    {"id": 2, "name": "Product B", "sales": 8300, "revenue": 83000, "margin": "28%"},
    {"id": 3, "name": "Product C", "sales": 15200, "revenue": 228000, "margin": "42%"},
    {"id": 4, "name": "Product D", "sales": 6800, "revenue": 68000, "margin": "22%"},
    {"id": 5, "name": "Product E", "sales": 11400, "revenue": 171000, "margin": "38%"},
]


def generate_logs(count=20):
    """Generate mock activity logs"""
    log_types = ["INFO", "WARNING", "ERROR", "SUCCESS"]
    messages = [
        "User dashboard accessed",
        "Layout configuration saved",
        "Panel resized",
        "Data sync completed",
        "API request processed",
        "Configuration reset",
        "New panel added",
        "Panel removed",
        "Export initiated",
    ]

    logs = []
    for i in range(count):
        logs.append({
            "id": i + 1,
            "timestamp": (datetime.now() - timedelta(minutes=i*5)).isoformat(),
            "type": random.choice(log_types),
            "message": random.choice(messages),
        })
    return logs


@app.get("/")
def root():
    return {"message": "Analytics Dashboard API"}


@app.get("/data/chart")
def get_chart_data():
    """Endpoint to fetch chart data"""
    return MOCK_CHART_DATA


@app.get("/data/table")
def get_table_data():
    """Endpoint to fetch table data"""
    return {"columns": ["id", "name", "sales", "revenue", "margin"], "rows": MOCK_TABLE_DATA}


@app.get("/logs")
def get_logs(limit: int = 20):
    """Endpoint to fetch activity logs"""
    return {"logs": generate_logs(limit)}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
