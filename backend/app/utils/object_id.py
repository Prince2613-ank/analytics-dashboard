from typing import Any, Dict, Optional
from bson import ObjectId

def serialize_doc(doc: Any) -> Any:
    """
    Recursively convert ObjectIds in a MongoDB document to strings.
    
    Args:
        doc (Any): The document or value to serialize.
        
    Returns:
        Any: The serialized document or value.
    """
    if isinstance(doc, list):
        return [serialize_doc(i) for i in doc]
    elif isinstance(doc, dict):
        # Convert _id to str and also provide 'id' for frontend convenience
        res = {k: serialize_doc(v) for k, v in doc.items()}
        if "_id" in res and "id" not in res:
            res["id"] = res["_id"]
        return res
    elif isinstance(doc, ObjectId):
        return str(doc)
    else:
        return doc

def success_response(data: Any = None, message: Optional[str] = None) -> Dict[str, Any]:
    """
    Generate a standard success JSON response.
    
    Args:
        data (Any, optional): The payload to return. Defaults to None.
        message (str, optional): An optional success message. Defaults to None.
        
    Returns:
        Dict[str, Any]: Standardized JSON structure.
    """
    base: Dict[str, Any] = {
        "success": True,
        "data": data,
        "error": None
    }
    if message is not None:
        base["message"] = message
    return base

def error_response(error: str) -> Dict[str, Any]:
    """
    Generate a standard error JSON response.
    
    Args:
        error (str): The error description.
        
    Returns:
        Dict[str, Any]: Standardized error structure.
    """
    return {
        "success": False,
        "data": None,
        "error": error
    }
