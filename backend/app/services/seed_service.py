from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
import random

class SeedService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        
    async def seed_all(self):
        # Collections
        products = self.db["products"]
        logs = self.db["logs"]
        locations = self.db["locations"]
        
        # Drop existing
        await products.drop()
        await logs.drop()
        await locations.drop()
        
        # 1. Seed Products
        product_data = [
            {"name": "Product A", "category": "Electronics", "sales": 1500, "revenue": 150000.0, "margin": 0.25, "region": "North America"},
            {"name": "Product B", "category": "Software", "sales": 3200, "revenue": 80000.0, "margin": 0.85, "region": "Europe"},
            {"name": "Product C", "category": "Services", "sales": 800, "revenue": 120000.0, "margin": 0.40, "region": "Asia"},
            {"name": "Product D", "category": "Hardware", "sales": 450, "revenue": 90000.0, "margin": 0.15, "region": "North America"},
            {"name": "Product E", "category": "Subscription", "sales": 5000, "revenue": 50000.0, "margin": 0.90, "region": "Global"}
        ]
        await products.insert_many(product_data)
        
        # 2. Seed Locations
        location_data = [
            {"name": "New York Office", "lat": 40.7128, "lng": -74.0060, "value": 250000.0},
            {"name": "London Office", "lat": 51.5074, "lng": -0.1278, "value": 180000.0},
            {"name": "Tokyo Branch", "lat": 35.6762, "lng": 139.6503, "value": 210000.0},
            {"name": "Sydney Hub", "lat": -33.8688, "lng": 151.2093, "value": 95000.0},
            {"name": "Berlin Office", "lat": 52.5200, "lng": 13.4050, "value": 120000.0}
        ]
        await locations.insert_many(location_data)
        
        # 3. Seed Logs
        log_types = ["INFO", "WARNING", "SUCCESS", "ERROR"]
        actions = ["session_start", "data_sync", "report_generated", "user_login"]
        log_data = []
        now = datetime.now()
        for i in range(20):
            log_data.append({
                "timestamp": (now - timedelta(minutes=i*15)).isoformat(),
                "type": random.choice(log_types),
                "action": random.choice(actions),
                "message": f"Historical system activity record {i+1}"
            })
        await logs.insert_many(log_data)
        
        return {
            "products_inserted": len(product_data),
            "locations_inserted": len(location_data),
            "logs_inserted": len(log_data)
        }
