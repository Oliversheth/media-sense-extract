
# Local Video AI Backend

This Python backend replaces the current Supabase Edge Functions with local processing using your Ollama setup.

## Features

- 🎯 **Local Processing**: No API costs, everything runs on your Mac
- 🤖 **Ollama Integration**: Uses your existing Code Llama and DeepSeek Coder models
- 🎬 **Synchronized Video Generation**: Creates video and audio simultaneously
- 🎭 **Natural Presentation Style**: No robotic "introduction" or "main point" announcements
- 📊 **Real-time Progress**: WebSocket updates during processing
- 🔄 **Drop-in Replacement**: Same API interface as current Edge Functions

## Quick Start

1. **Make sure Ollama is running:**
   ```bash
   ollama serve
   ```

2. **Ensure you have the required models:**
   ```bash
   ollama pull codellama:instruct
   ollama pull deepseek-coder:instruct
   ```

3. **Start the backend:**
   ```bash
   cd python_backend
   python start.py
   ```

4. **Update your React app** to point to `http://localhost:8000` instead of Supabase Edge Functions

## API Endpoints

- `POST /generate-video-from-slides` - Generate video from slides
- `POST /analyze-video` - Analyze video content
- `GET /download/{file_type}/{filename}` - Download generated files
- `WS /ws/{client_id}` - WebSocket for real-time progress
- `GET /health` - Health check and Ollama status

## Installation

The `start.py` script will automatically install all requirements. Manual installation:

```bash
pip install -r requirements.txt
```

## System Requirements

- **Minimum**: 8GB RAM, decent CPU
- **Recommended**: 16GB+ RAM for optimal performance
- **Storage**: ~2GB for dependencies + space for generated videos

## What's Different

- **No API Costs**: Everything runs locally
- **Better Quality**: Direct access to full model capabilities
- **Natural Speech**: Scripts sound like real presentations, not robotic announcements
- **Simultaneous Processing**: Video and audio generated together
- **Privacy**: All processing happens locally

## Troubleshooting

- **Ollama not found**: Make sure Ollama is installed and running (`ollama serve`)
- **Models missing**: Pull required models (`ollama pull codellama:instruct`)
- **TTS issues**: The system falls back to silent video if TTS is unavailable
- **Performance**: Close other applications if processing is slow

## Next Steps

1. Replace Supabase function calls in your React app
2. Optionally install Coqui TTS for better audio quality
3. Add more voice options and customization
4. Implement video analysis features
