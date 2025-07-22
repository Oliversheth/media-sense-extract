import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Video, Download, Play, Settings, Clock, Brain, Volume2, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { localVideoService } from '@/services/localVideoService';
import BackendStatus from '@/components/BackendStatus';

interface SlideToVideoSettings {
  intelligenceLevel: number;
  minLength: number;
  maxLength: number;
  voice: string;
  tone: string;
  customInstructions: string;
}

interface GeneratedResult {
  success: boolean;
  script: string;
  audioUrl: string;
  videoUrl: string;
  duration: string;
  settings: SlideToVideoSettings;
}

const SlideToVideo = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<SlideToVideoSettings>({
    intelligenceLevel: 3,
    minLength: 5,
    maxLength: 15,
    voice: 'default',
    tone: 'professional',
    customInstructions: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [processingStage, setProcessingStage] = useState('');
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/pdf'];
      const validExtensions = ['.pptx', '.ppt', '.pdf'];
      
      if (validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        setUploadedFile(file);
        setGeneratedResult(null);
        toast({
          title: "File uploaded successfully",
          description: `${file.name} is ready for conversion`
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PowerPoint (.pptx, .ppt) or PDF file",
          variant: "destructive"
        });
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const simulateProgress = () => {
    const stages = [
      { name: 'Uploading file...', duration: 1000 },
      { name: 'Extracting slide content...', duration: 2000 },
      { name: 'Generating script...', duration: 3000 },
      { name: 'Creating voiceover...', duration: 4000 },
      { name: 'Finalizing video...', duration: 2000 }
    ];

    let currentProgress = 0;
    let stageIndex = 0;

    const updateProgress = () => {
      if (stageIndex < stages.length) {
        const stage = stages[stageIndex];
        setProcessingStage(stage.name);
        
        const stageProgress = (stageIndex + 1) * (100 / stages.length);
        const interval = setInterval(() => {
          currentProgress += 2;
          setProgress(Math.min(currentProgress, stageProgress));
          
          if (currentProgress >= stageProgress) {
            clearInterval(interval);
            stageIndex++;
            setTimeout(updateProgress, 500);
          }
        }, 100);
      }
    };

    updateProgress();
  };

  const handleGenerateVideo = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a presentation file first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessingStage('Starting video generation...');

    try {
      const fileBase64 = await fileToBase64(uploadedFile);
      
      const result = await localVideoService.generateVideoFromSlides(
        fileBase64,
        uploadedFile.name,
        settings,
        (stage: string, progress: number) => {
          setProcessingStage(stage);
          setProgress(progress);
        }
      );

      if (result && result.success) {
        setGeneratedResult(result);
        setProgress(100);
        setProcessingStage('Video generation complete!');
        toast({
          title: "Video generated successfully!",
          description: "Your presentation video is ready"
        });
      } else {
        throw new Error(result?.error || 'Video generation failed');
      }
    } catch (error: any) {
      console.error('Video generation error:', error);
      setProcessingStage('Error occurred during generation');
      toast({
        title: "Video generation failed",
        description: error.message || 'Please check that the Python backend is running',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadVideo = () => {
    if (generatedResult?.videoUrl) {
      toast({
        title: "Download started",
        description: "Your video is being prepared for download"
      });
      // In a real implementation, this would trigger an actual download
    }
  };

  const handlePlayAudio = () => {
    if (generatedResult?.audioUrl) {
      const audio = new Audio(generatedResult.audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Playback error",
          description: "Unable to play audio preview",
          variant: "destructive"
        });
      });
    }
  };

  const intelligenceLabels = ['Basic', 'Simple', 'Standard', 'Advanced', 'Expert'];
  const voiceOptions = [
    { value: 'default', label: 'Default (Coqui XTTS)' },
    { value: 'professional_male', label: 'Professional Male' },
    { value: 'professional_female', label: 'Professional Female' },
    { value: 'energetic', label: 'Energetic Presenter' },
    { value: 'calm', label: 'Calm & Clear' },
    { value: 'academic', label: 'Academic Tone' },
    { value: 'conversational', label: 'Conversational' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-orange-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Slides to Video Converter
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">Transform your presentations into engaging video content with AI narration</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Backend Status */}
            <BackendStatus />
            
            {/* File Upload */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload Presentation</span>
                </CardTitle>
                <CardDescription>
                  Support for PowerPoint (.pptx, .ppt) and PDF files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pptx,.ppt,.pdf"
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                    </label>
                  </div>
                  {uploadedFile && (
                    <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium truncate flex-1">{uploadedFile.name}</span>
                      <Badge variant="secondary">Ready</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Customization</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Intelligence Level */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span>Intelligence Level: {intelligenceLabels[settings.intelligenceLevel - 1]}</span>
                  </Label>
                  <Slider
                    value={[settings.intelligenceLevel]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, intelligenceLevel: value[0] }))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls how academic and detailed the narration will be
                  </p>
                </div>

                {/* Video Length */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Video Length (minutes)</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Min</Label>
                      <Input
                        type="number"
                        value={settings.minLength}
                        onChange={(e) => setSettings(prev => ({ ...prev, minLength: parseInt(e.target.value) || 5 }))}
                        min={1}
                        max={60}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max</Label>
                      <Input
                        type="number"
                        value={settings.maxLength}
                        onChange={(e) => setSettings(prev => ({ ...prev, maxLength: parseInt(e.target.value) || 15 }))}
                        min={1}
                        max={60}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Voice Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Voice Preset</span>
                  </Label>
                  <Select value={settings.voice} onValueChange={(value) => setSettings(prev => ({ ...prev, voice: value }))}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceOptions.map((voice) => (
                        <SelectItem key={voice.value} value={voice.value}>
                          {voice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone */}
                <div className="space-y-2">
                  <Label>Presentation Tone</Label>
                  <Select value={settings.tone} onValueChange={(value) => setSettings(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Instructions */}
                <div className="space-y-2">
                  <Label>Custom Instructions (Optional)</Label>
                  <Textarea
                    placeholder="Any specific instructions for the AI narrator..."
                    value={settings.customInstructions}
                    onChange={(e) => setSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Generate Button */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Button
                  onClick={handleGenerateVideo}
                  disabled={!uploadedFile || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Generate Video Presentation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Progress */}
            {isProcessing && (
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle>Generating Your Video</CardTitle>
                  <CardDescription>{processingStage}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
                </CardContent>
              </Card>
            )}

            {/* Generated Result */}
            {generatedResult && (
              <div className="space-y-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Video Generated Successfully</span>
                    </CardTitle>
                    <CardDescription>Your presentation has been converted to video with AI narration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Video className="w-12 h-12 text-primary mx-auto" />
                        <p className="text-sm text-muted-foreground">Video preview</p>
                        <p className="text-xs text-muted-foreground">Duration: {generatedResult.duration}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={handlePlayAudio} variant="outline" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Play Audio
                      </Button>
                      <Button onClick={handleDownloadVideo} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Script Preview */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle>Generated Script</CardTitle>
                    <CardDescription>AI-generated narration script for your presentation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-40 overflow-y-auto p-3 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{generatedResult.script}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideToVideo;
