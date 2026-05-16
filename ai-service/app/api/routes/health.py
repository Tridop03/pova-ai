from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def health_check():
    return {
        "status": "healthy",
        "service": "POVA AI Service",
        "ocr_engine": "pytesseract",
        "image_engine": "opencv"
    }
