import cv2
import numpy as np
import base64
from PIL import Image
import io
import re
from typing import Optional

class BlurDetector:
    def __init__(self, threshold=100.0):
        self.threshold = threshold
        self.nafdac_pattern = re.compile(r'NAFDAC\s*[:.-]?\s*[A-Z0-9-]+', re.IGNORECASE)

    def find_nafdac(self, text: str) -> Optional[str]:
        match = self.nafdac_pattern.search(text)
        return match.group(0) if match else None

    def detect_blur(self, image_np: np.ndarray) -> tuple[bool, float]:
        # Compute the Laplacian of the image and then the variance
        gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
        variance = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        return variance < self.threshold, variance

    def process_base64(self, base64_str: str) -> dict:
        image_data = base64.b64decode(base64_str.split(',')[-1])
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        is_blurry, score = self.detect_blur(img)
        return {
            "is_blurry": is_blurry,
            "blur_score": score,
            "threshold": self.threshold
        }

blur_detector = BlurDetector()
