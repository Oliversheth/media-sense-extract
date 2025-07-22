
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class VideoGenerationResponse(BaseModel):
    success: bool
    script: str
    audioUrl: str
    videoUrl: str
    duration: str
    settings: Dict[str, Any]

class AnalysisResponse(BaseModel):
    success: bool
    summary: str
    keyInsights: List[str]
    transcript: str
    metadata: Dict[str, Any]
    visualAnalysis: List[Dict[str, Any]]
    audioAnalysis: Dict[str, Any]
