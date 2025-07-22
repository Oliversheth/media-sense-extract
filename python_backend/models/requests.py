
from pydantic import BaseModel
from typing import Dict, Any, Optional

class VideoGenerationRequest(BaseModel):
    slideData: str
    fileName: str
    settings: Dict[str, Any]

class AnalysisRequest(BaseModel):
    videoBase64: str
    settings: Dict[str, Any]
