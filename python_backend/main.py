
from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import asyncio
import json
import os
from datetime import datetime
from typing import Optional, Dict, Any
import logging

from services.slide_processor import SlideProcessor
from services.script_generator import ScriptGenerator
from services.video_generator import VideoGenerator
from services.ollama_client import OllamaClient
from models.requests import VideoGenerationRequest, AnalysisRequest
from models.responses import VideoGenerationResponse, AnalysisResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Local Video AI", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
slide_processor = SlideProcessor()
script_generator = ScriptGenerator()
video_generator = VideoGenerator()
ollama_client = OllamaClient()

# Store active WebSocket connections
active_connections: Dict[str, WebSocket] = {}

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting Local Video AI service on port 8001...")
    
    # Create necessary directories
    os.makedirs("temp", exist_ok=True)
    os.makedirs("output", exist_ok=True)
    os.makedirs("output/videos", exist_ok=True)
    os.makedirs("output/audio", exist_ok=True)
    os.makedirs("cache", exist_ok=True)
    
    # Check Ollama connection
    await ollama_client.check_connection()
    
    logger.info("Service initialized successfully")

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    active_connections[client_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if client_id in active_connections:
            del active_connections[client_id]

async def send_progress(client_id: str, stage: str, progress: int):
    """Send progress update to client via WebSocket"""
    if client_id in active_connections:
        try:
            await active_connections[client_id].send_text(json.dumps({
                "stage": stage,
                "progress": progress
            }))
        except:
            if client_id in active_connections:
                del active_connections[client_id]

@app.post("/generate-video-from-slides")
async def generate_video_from_slides(request: VideoGenerationRequest):
    """Generate video from slides using local processing"""
    try:
        client_id = f"client_{datetime.now().timestamp()}"
        
        await send_progress(client_id, "Processing slides...", 10)
        
        # Extract slide content
        slide_content = await slide_processor.extract_content(
            request.slideData, 
            request.fileName
        )
        
        await send_progress(client_id, "Generating natural script...", 30)
        
        # Generate natural presentation script using Ollama
        script = await script_generator.generate_natural_script(
            slide_content,
            request.settings,
            ollama_client
        )
        
        await send_progress(client_id, "Creating synchronized video...", 60)
        
        # Generate video with synchronized audio
        video_result = await video_generator.create_synchronized_video(
            script,
            slide_content,
            request.settings,
            progress_callback=lambda p: send_progress(client_id, "Rendering video...", 60 + int(p * 0.3))
        )
        
        await send_progress(client_id, "Video generation complete!", 100)
        
        return VideoGenerationResponse(
            success=True,
            script=script,
            audioUrl=video_result["audio_url"],
            videoUrl=video_result["video_url"],
            duration=video_result["duration"],
            settings=request.settings
        )
        
    except Exception as e:
        logger.error(f"Video generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-video")
async def analyze_video(request: AnalysisRequest):
    """Analyze video content using local models"""
    try:
        client_id = f"client_{datetime.now().timestamp()}"
        
        await send_progress(client_id, "Extracting video content...", 20)
        
        # Extract video frames and audio
        video_content = await slide_processor.extract_video_content(request.videoBase64)
        
        await send_progress(client_id, "Analyzing content with local AI...", 50)
        
        # Generate analysis using Ollama
        analysis = await script_generator.generate_analysis(
            video_content,
            request.settings,
            ollama_client
        )
        
        await send_progress(client_id, "Analysis complete!", 100)
        
        return AnalysisResponse(
            success=True,
            summary=analysis["summary"],
            keyInsights=analysis["key_insights"],
            transcript=analysis["transcript"],
            metadata=analysis["metadata"],
            visualAnalysis=analysis["visual_analysis"],
            audioAnalysis=analysis["audio_analysis"]
        )
        
    except Exception as e:
        logger.error(f"Video analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{file_type}/{filename}")
async def download_file(file_type: str, filename: str):
    """Download generated files"""
    file_path = f"output/{file_type}/{filename}"
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    ollama_status = await ollama_client.check_connection()
    return {
        "status": "healthy",
        "ollama_connected": ollama_status,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
