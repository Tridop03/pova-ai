from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.ocr_service import ocr_service
from app.services.blur_detector import blur_detector

router = APIRouter()

class AnalyzeRequest(BaseModel):
    images: List[str]  # Base64 encoded images
    product_id: Optional[str] = None

class AnalyzeResponse(BaseModel):
    nafdac_number: Optional[str]
    batch_number: Optional[str]
    expiry_date: Optional[str]
    verdict: str
    confidence: float
    flags: List[str]
    blur_results: List[dict]

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_images(request: AnalyzeRequest):
    if not request.images:
        raise HTTPException(status_code=400, detail="No images provided")

    nafdac_numbers = []
    batch_numbers = []
    expiry_dates = []
    blur_results = []
    flags = []

    for img_b64 in request.images:
        # Check for blur
        blur_res = blur_detector.process_base64(img_b64)
        blur_results.append(blur_res)
        if blur_res["is_blurry"]:
            flags.append("Warning: Image is blurry")

        # Extract Info
        matches = ocr_service.process_image_base64(img_b64)
        if matches["nafdac"]:
            nafdac_numbers.append(matches["nafdac"])
        if matches["batch_number"]:
            batch_numbers.append(matches["batch_number"])
        if matches["expiry_date"]:
            expiry_dates.append(matches["expiry_date"])

    if not nafdac_numbers:
        return AnalyzeResponse(
            nafdac_number=None,
            batch_number=None,
            expiry_date=None,
            verdict="NAFDAC_NOT_FOUND",
            confidence=0.0,
            flags=flags,
            blur_results=blur_results
        )

    # Resolve primary matches
    primary_nafdac = max(set(nafdac_numbers), key=nafdac_numbers.count)
    primary_batch = max(set(batch_numbers), key=batch_numbers.count) if batch_numbers else None
    primary_expiry = max(set(expiry_dates), key=expiry_dates.count) if expiry_dates else None
    
    return AnalyzeResponse(
        nafdac_number=primary_nafdac,
        batch_number=primary_batch,
        expiry_date=primary_expiry,
        verdict="SUCCESS",
        confidence=0.85, # Placeholder confidence
        flags=flags,
        blur_results=blur_results
    )
