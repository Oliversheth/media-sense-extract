
import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ApiConfiguration } from '@/components/ApiConfiguration';
import { AnalysisOptions } from '@/components/AnalysisOptions';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { useToast } from '@/hooks/use-toast';

export type ProcessingStage = 'upload' | 'metadata' | 'frames' | 'visual' | 'audio' | 'final' | 'complete';
export type StageStatus = 'pending' | 'processing' | 'complete' | 'error';

export interface ProcessingState {
  currentStage: ProcessingStage;
  stages: Record<ProcessingStage, { status: StageStatus; progress: number; message: string }>;
  logs: string[];
}

export interface ApiConfig {
  vision: {
    provider: 'openai' | 'google' | 'azure';
    apiKey: string;
    isValid: boolean;
  };
  audio: {
    provider: 'openai' | 'google' | 'azure';
    apiKey: string;
    isValid: boolean;
  };
}

export interface AnalysisSettings {
  frameCount: number;
  frameQuality: 'low' | 'medium' | 'high';
  samplingStrategy: 'even' | 'smart' | 'custom';
  audioQuality: 'standard' | 'high';
  outputFormat: 'markdown' | 'json' | 'detailed';
}

export interface AnalysisResults {
  summary: {
    duration: string;
    keyInsights: string[];
    mainTopics: string[];
  };
  visualAnalysis: Array<{
    timestamp: string;
    description: string;
    frameUrl?: string;
  }>;
  transcript: {
    fullText: string;
    segments: Array<{
      timestamp: string;
      text: string;
      confidence: number;
    }>;
  };
  metadata: {
    resolution: string;
    codec: string;
    fileSize: string;
    duration: string;
  };
  rawData: any;
}

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    vision: { provider: 'openai', apiKey: '', isValid: false },
    audio: { provider: 'openai', apiKey: '', isValid: false }
  });
  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>({
    frameCount: 10,
    frameQuality: 'medium',
    samplingStrategy: 'even',
    audioQuality: 'standard',
    outputFormat: 'markdown'
  });
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setResults(null);
    toast({
      title: "File uploaded successfully",
      description: `${file.name} is ready for analysis`
    });
  };

  const handleStartAnalysis = () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a video file first",
        variant: "destructive"
      });
      return;
    }

    if (!apiConfig.vision.isValid || !apiConfig.audio.isValid) {
      toast({
        title: "API configuration incomplete",
        description: "Please configure and validate your API keys",
        variant: "destructive"
      });
      return;
    }

    // Initialize processing state
    const initialState: ProcessingState = {
      currentStage: 'upload',
      stages: {
        upload: { status: 'complete', progress: 100, message: 'File uploaded successfully' },
        metadata: { status: 'processing', progress: 0, message: 'Extracting video metadata...' },
        frames: { status: 'pending', progress: 0, message: 'Waiting to extract frames' },
        visual: { status: 'pending', progress: 0, message: 'Waiting for visual analysis' },
        audio: { status: 'pending', progress: 0, message: 'Waiting for audio transcription' },
        final: { status: 'pending', progress: 0, message: 'Waiting for final processing' },
        complete: { status: 'pending', progress: 0, message: 'Analysis complete' }
      },
      logs: ['Analysis started', 'File validated and uploaded', 'Beginning metadata extraction...']
    };

    setProcessingState(initialState);
    simulateProcessing(initialState);
  };

  const simulateProcessing = async (state: ProcessingState) => {
    const stages: ProcessingStage[] = ['metadata', 'frames', 'visual', 'audio', 'final', 'complete'];
    
    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update current stage
      setProcessingState(prev => {
        if (!prev) return null;
        
        const updated = { ...prev };
        updated.currentStage = stage;
        
        // Complete previous stage
        const prevStageIndex = stages.indexOf(stage) - 1;
        if (prevStageIndex >= 0) {
          const prevStage = stages[prevStageIndex];
          updated.stages[prevStage] = {
            status: 'complete',
            progress: 100,
            message: `${prevStage} completed successfully`
          };
        }
        
        // Start current stage
        updated.stages[stage] = {
          status: 'processing',
          progress: 0,
          message: getStageMessage(stage)
        };
        
        updated.logs.push(`Starting ${stage} processing...`);
        
        return updated;
      });

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 25) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProcessingState(prev => {
          if (!prev) return null;
          const updated = { ...prev };
          updated.stages[stage].progress = progress;
          return updated;
        });
      }
    }

    // Generate mock results
    const mockResults: AnalysisResults = {
      summary: {
        duration: "3:42",
        keyInsights: [
          "Video contains primarily talking head content with occasional screen sharing",
          "Speaker maintains consistent eye contact with camera",
          "Professional indoor lighting setup detected"
        ],
        mainTopics: ["Product demonstration", "Technical explanation", "Q&A session"]
      },
      visualAnalysis: [
        { timestamp: "00:00", description: "Speaker introduction in well-lit office environment" },
        { timestamp: "01:15", description: "Transition to screen sharing showing application interface" },
        { timestamp: "02:30", description: "Return to speaker with hands-on demonstration" },
        { timestamp: "03:20", description: "Closing remarks with contact information displayed" }
      ],
      transcript: {
        fullText: "Hello everyone, welcome to today's demonstration. I'm excited to show you our new video analysis tool that combines multiple AI providers for comprehensive video processing...",
        segments: [
          { timestamp: "00:00", text: "Hello everyone, welcome to today's demonstration.", confidence: 0.98 },
          { timestamp: "00:05", text: "I'm excited to show you our new video analysis tool", confidence: 0.95 },
          { timestamp: "00:12", text: "that combines multiple AI providers for comprehensive video processing.", confidence: 0.92 }
        ]
      },
      metadata: {
        resolution: "1920x1080",
        codec: "H.264",
        fileSize: "45.2 MB",
        duration: "3:42"
      },
      rawData: {
        processingTime: "2.3 minutes",
        framesExtracted: analysisSettings.frameCount,
        apiCalls: {
          vision: 10,
          audio: 1
        }
      }
    };

    setResults(mockResults);
    toast({
      title: "Analysis complete!",
      description: "Your video has been successfully analyzed"
    });
  };

  const getStageMessage = (stage: ProcessingStage): string => {
    const messages = {
      upload: 'Uploading file...',
      metadata: 'Extracting video metadata...',
      frames: 'Extracting frames from video...',
      visual: 'Analyzing visual content with AI...',
      audio: 'Transcribing audio content...',
      final: 'Generating final report...',
      complete: 'Analysis complete!'
    };
    return messages[stage];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Video Analysis Tool</h1>
          <p className="text-lg text-slate-600">AI-powered video analysis with multiple provider support</p>
        </header>

        <div className="space-y-6">
          {/* File Upload */}
          <FileUpload onFileUpload={handleFileUpload} uploadedFile={uploadedFile} />
          
          {/* API Configuration */}
          <ApiConfiguration config={apiConfig} onConfigChange={setApiConfig} />
          
          {/* Analysis Options */}
          <AnalysisOptions settings={analysisSettings} onSettingsChange={setAnalysisSettings} />
          
          {/* Start Analysis Button */}
          {uploadedFile && !processingState && !results && (
            <div className="flex justify-center">
              <button
                onClick={handleStartAnalysis}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Start Analysis
              </button>
            </div>
          )}
          
          {/* Processing Status */}
          {processingState && !results && (
            <ProcessingStatus state={processingState} onCancel={() => setProcessingState(null)} />
          )}
          
          {/* Results Display */}
          {results && (
            <ResultsDisplay results={results} fileName={uploadedFile?.name || 'video'} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
