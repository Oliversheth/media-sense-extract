
from pydantic import BaseModel
from typing import Optional, Dict, Any

class VideoSettings(BaseModel):
    intelligenceLevel: int
    minLength: int
    maxLength: int
    voice: str
    tone: str
    customInstructions: Optional[str] = ""

class VideoGenerationRequest(BaseModel):
    slideData: str
    fileName: str
    settings: VideoSettings

class AnalysisSettings(BaseModel):
    intelligenceLevel: int
    summaryLength: str
    outputFormat: str
    focusArea: str
    analysisType: str

class AnalysisRequest(BaseModel):
    videoBase64: str
    settings: AnalysisSettings
