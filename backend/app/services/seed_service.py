from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta, timezone
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
        
        # 1. Seed Products (Better variety for charts and tables)
        product_data = [
            {"name": "Quantum X1", "category": "Electronics", "sales": 1250, "revenue": 187500.0, "margin": 0.32, "region": "North America"},
            {"name": "SaaS Platform Pro", "category": "Software", "sales": 4800, "revenue": 120000.0, "margin": 0.92, "region": "Europe"},
            {"name": "Consulting Elite", "category": "Services", "sales": 950, "revenue": 285000.0, "margin": 0.45, "region": "Asia"},
            {"name": "Neural Link A2", "category": "Hardware", "sales": 620, "revenue": 93000.0, "margin": 0.18, "region": "North America"},
            {"name": "Cloud Storage Plus", "category": "Subscription", "sales": 12000, "revenue": 60000.0, "margin": 0.88, "region": "Global"},
            {"name": "Titan GPU", "category": "Hardware", "sales": 2100, "revenue": 450000.0, "margin": 0.22, "region": "Asia"},
            {"name": "Vision AI Cam", "category": "Electronics", "sales": 3400, "revenue": 170000.0, "margin": 0.28, "region": "Europe"},
            {"name": "Data Stream API", "category": "Software", "sales": 750, "revenue": 45000.0, "margin": 0.95, "region": "Global"}
        ]
        await products.insert_many(product_data)
        
        # 2. Seed Locations (Strategic global coverage)
        location_data = [
            {"name": "Silicon Valley HQ", "lat": 37.7749, "lng": -122.4194, "value": 1250000.0},
            {"name": "London Tech Hub", "lat": 51.5074, "lng": -0.1278, "value": 880000.0},
            {"name": "Tokyo Innovation Center", "lat": 35.6762, "lng": 139.6503, "value": 920000.0},
            {"name": "Berlin Engineering Lab", "lat": 52.5200, "lng": 13.4050, "value": 620000.0},
            {"name": "Singapore APAC Hub", "lat": 1.3521, "lng": 103.8198, "value": 750000.0},
            {"name": "Sydney Operations", "lat": -33.8688, "lng": 151.2093, "value": 450000.0},
            {"name": "New York Business Center", "lat": 40.7128, "lng": -74.0060, "value": 1100000.0}
        ]
        await locations.insert_many(location_data)
        
        # 3. Seed Logs (Realistic recent system Activity)
        log_types = ["INFO", "WARNING", "SUCCESS", "ERROR"]
        actions = [
            {"action": "user_login", "msg": "User {user} authenticated successfully"},
            {"action": "data_sync", "msg": "Background data synchronization completed for {region}"},
            {"action": "report_gen", "msg": "Quarterly analytics report generated for {dept}"},
            {"action": "system_upd", "msg": "Core engine updated to version 2.4.1"},
            {"action": "db_query", "msg": "Complex aggregation query completed in {time}ms"},
            {"action": "api_call", "msg": "External API connection established to {service}"}
        ]
        
        regions = ["North America", "Europe", "Asia", "Global"]
        users = ["admin_jane", "manager_bob", "analyst_sam"]
        depts = ["Sales", "Finance", "HR", "Logistics"]
        services = ["Stripe", "AWS", "SendGrid", "Twilio"]
        
        # Generate structured logs as requested
        log_data = []
        now = datetime.now(timezone.utc)
        
        # 1. Just now
        log_data.append({
            "timestamp": now.isoformat(),
            "type": "SUCCESS",
            "category": "BUSINESS",
            "action": "system_init",
            "message": "System activity monitoring initialized"
        })
        
        # 2. 5 minutes ago
        log_data.append({
            "timestamp": (now - timedelta(minutes=5)).isoformat(),
            "type": "INFO",
            "category": "BUSINESS",
            "action": "data_sync",
            "message": "Global data synchronization completed"
        })
        
        # 3. 10 minutes ago
        log_data.append({
            "timestamp": (now - timedelta(minutes=10)).isoformat(),
            "type": "WARNING",
            "category": "BUSINESS",
            "action": "db_maint",
            "message": "Database optimization scheduled for tonight"
        })
        
        # Generate 27 more logs with random offsets from the last hour
        for i in range(27):
            template = random.choice(actions)
            msg = template["msg"].format(
                user=random.choice(users),
                region=random.choice(regions),
                dept=random.choice(depts),
                time=random.randint(50, 450),
                service=random.choice(services)
            )
            
            offset_seconds = random.randint(600, 3600) # Beyond 10 mins
            log_time = now - timedelta(seconds=offset_seconds)
            
            log_data.append({
                "timestamp": log_time.isoformat(),
                "type": random.choice(log_types),
                "category": "BUSINESS",
                "action": template["action"],
                "message": msg
            })
            
        # Ensure latest appear at top
        log_data.sort(key=lambda x: x["timestamp"], reverse=True)
        await logs.insert_many(log_data)
        
        return {
            "products_inserted": len(product_data),
            "locations_inserted": len(location_data),
            "logs_inserted": len(log_data)
        }
