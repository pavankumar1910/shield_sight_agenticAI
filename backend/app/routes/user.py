from fastapi import APIRouter, UploadFile, File, HTTPException, Request
import os
import uuid
from datetime import datetime

router = APIRouter(prefix="/user", tags=["User"])

UPLOAD_DIR = "uploads/avatars"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-avatar")
async def upload_avatar(request: Request, file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file locally
    # Note: On Render, the 'uploads' directory needs to be configured as a Persistent Disk
    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")
    
    # Return the dynamic URL using current request base
    base_url = str(request.base_url).rstrip('/')
    avatar_url = f"{base_url}/uploads/avatars/{filename}"
    
    return {
        "url": avatar_url,
        "filename": filename,
        "timestamp": datetime.utcnow().isoformat()
    }
