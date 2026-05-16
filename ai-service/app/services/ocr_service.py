import pytesseract
from PIL import Image
import re
import io
import base64

class OCRService:
    def __init__(self):
        # NAFDAC numbers usually look like: A1-1234, 01-1234, B4-1234
        self.nafdac_pattern = re.compile(r'[A-Z0-9]{2}-[0-9]{4}')
        # Batch patterns: BN: 1234, Batch No: AB12, B/N 999
        self.batch_pattern = re.compile(r'(?:BN|BATCH|B\.N\.|B/N)[:.\s]+([A-Z0-9-]+)', re.IGNORECASE)
        # Expiry patterns: EXP: 12/2025, Expiry: 10-2024, E.D. 2026/01/01
        self.expiry_pattern = re.compile(r'(?:EXP|EXPIRY|E\.D\.|EXP\.D)[:.\s]+(\d{2}[/-]\d{2,4}|\d{4}[/-]\d{2}[/-]\d{2})', re.IGNORECASE)

    def extract_text(self, image: Image.Image) -> str:
        return pytesseract.image_to_string(image)

    def find_matches(self, text: str) -> dict:
        nafdac = self.nafdac_pattern.search(text)
        batch = self.batch_pattern.search(text)
        expiry = self.expiry_pattern.search(text)
        
        return {
            "nafdac": nafdac.group(0) if nafdac else None,
            "batch_number": batch.group(1) if batch else None,
            "expiry_date": expiry.group(1) if expiry else None
        }

    def process_image_base64(self, base64_str: str) -> dict:
        image_data = base64.b64decode(base64_str.split(',')[-1])
        image = Image.open(io.BytesIO(image_data))
        text = self.extract_text(image)
        return self.find_matches(text)

ocr_service = OCRService()
