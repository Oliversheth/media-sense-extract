
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class VideoGenerationResponse(BaseModel):
    success: bool
    script: str
    audioUrl: str
    videoUrl: str
    duration: str
    settings: Dict[str, Any]

class VisualAnalysisItem(BaseModel):
    timestamp: str
    description: str

class AudioAnalysis(BaseModel):
    clarity: str
    tone: str
    pacing: str

class VideoMetadata(BaseModel):
    duration: str
    fileSize: str
    resolution: str

class AnalysisResponse(BaseModel):
    success: bool
    summary: str
    keyInsights: List[str]
    transcript: str
    metadata: VideoMetadata
    visualAnalysis: List[VisualAnalysisItem]
    audioAnalysis: Optional[AudioAnalysis] = None
