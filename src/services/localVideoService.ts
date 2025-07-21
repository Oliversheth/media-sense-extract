
import { toast } from '@/hooks/use-toast';

export interface LocalVideoSettings {
  intelligenceLevel: number;
  minLength: number;
  maxLength: number;
  voice: string;
  tone: string;
  customInstructions: string;
}

export interface LocalAnalysisSettings {
  intelligenceLevel: number;
  summaryLength: string;
  outputFormat: string;
  focusArea: string;
  analysisType: string;
}

class LocalVideoService {
  private baseUrl = 'http://localhost:8000';
  private wsConnections: Map<string, WebSocket> = new Map();

  async generateVideoFromSlides(
    slideData: string,
    fileName: string,
    settings: LocalVideoSettings,
    onProgress?: (stage: string, progress: number) => void
  ) {
    try {
      // Set up WebSocket for progress updates
      const clientId = `client_${Date.now()}`;
      if (onProgress) {
        this.setupProgressWebSocket(clientId, onProgress);
      }

      const response = await fetch(`${this.baseUrl}/generate-video-from-slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slideData,
          fileName,
          settings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Video generation failed');
      }

      const result = await response.json();
      
      // Close WebSocket connection
      this.closeWebSocket(clientId);
      
      return result;
    } catch (error: any) {
      console.error('Local video generation error:', error);
      throw new Error(error.message || 'Failed to generate video locally');
    }
  }

  async analyzeVideo(
    videoBase64: string,
    settings: LocalAnalysisSettings,
    onProgress?: (stage: string, progress: number) => void
  ) {
    try {
      // Set up WebSocket for progress updates
      const clientId = `client_${Date.now()}`;
      if (onProgress) {
        this.setupProgressWebSocket(clientId, onProgress);
      }

      const response = await fetch(`${this.baseUrl}/analyze-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoBase64,
          settings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Video analysis failed');
      }

      const result = await response.json();
      
      // Close WebSocket connection
      this.closeWebSocket(clientId);
      
      return result;
    } catch (error: any) {
      console.error('Local video analysis error:', error);
      throw new Error(error.message || 'Failed to analyze video locally');
    }
  }

  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const health = await response.json();
      return health;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return { status: 'unhealthy', ollama_connected: false };
    }
  }

  private setupProgressWebSocket(clientId: string, onProgress: (stage: string, progress: number) => void) {
    try {
      const ws = new WebSocket(`ws://localhost:8000/ws/${clientId}`);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onProgress(data.stage, data.progress);
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.wsConnections.set(clientId, ws);
    } catch (error) {
      console.error('WebSocket setup failed:', error);
    }
  }

  private closeWebSocket(clientId: string) {
    const ws = this.wsConnections.get(clientId);
    if (ws) {
      ws.close();
      this.wsConnections.delete(clientId);
    }
  }

  getDownloadUrl(fileType: string, filename: string) {
    return `${this.baseUrl}/download/${fileType}/${filename}`;
  }
}

export const localVideoService = new LocalVideoService();
