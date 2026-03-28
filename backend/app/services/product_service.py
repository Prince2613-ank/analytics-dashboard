from app.repositories.product_repository import ProductRepository
from app.utils.object_id import serialize_doc, success_response

class ProductService:
    def __init__(self, repository: ProductRepository):
        self.repository = repository
        
    async def get_table_data(self):
        products = await self.repository.get_all()
        clean_products = serialize_doc(products)
        data = {
            "columns": ["name", "category", "sales", "revenue", "margin", "region"],
            "rows": clean_products
        }
        return success_response(data)
        
    async def get_chart_data(self):
        products = await self.repository.get_all()
        clean_products = serialize_doc(products)
        
        if not clean_products:
            data = {"labels": [], "datasets": []}
            return success_response(data)
            
        labels = [p["name"] for p in clean_products]
        sales_data = [p.get("sales", 0) for p in clean_products]
        revenue_data = [p.get("revenue", 0) for p in clean_products]
        
        data = {
            "labels": labels,
            "datasets": [
                {
                    "label": "Sales",
                    "data": sales_data,
                    "borderColor": "rgb(75, 192, 192)",
                    "backgroundColor": "rgba(75, 192, 192, 0.5)"
                },
                {
                    "label": "Revenue",
                    "data": revenue_data,
                    "borderColor": "rgb(255, 99, 132)",
                    "backgroundColor": "rgba(255, 99, 132, 0.5)"
                }
            ]
        }
        return success_response(data)
