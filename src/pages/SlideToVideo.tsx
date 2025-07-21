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
import { ArrowLeft, Upload, Video, Download, Play, Settings, Clock, Brain, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SlideToVideoSettings {
  intelligenceLevel: number;
  minLength: number;
  maxLength: number;
  voice: string;
  tone: string;
  customInstructions: string;
}

const SlideToVideo = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<SlideToVideoSettings>({
    intelligenceLevel: 3,
    minLength: 5,
    maxLength: 15,
    voice: 'alloy',
    tone: 'professional',
    customInstructions: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/pdf'];
      if (validTypes.includes(file.type) || file.name.endsWith('.pptx') || file.name.endsWith('.ppt') || file.name.endsWith('.pdf')) {
        setUploadedFile(file);
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

    try {
      const fileBase64 = await fileToBase64(uploadedFile);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      const response = await fetch('https://bciaqupkkahyfaoxalyd.functions.supabase.co/generate-video-from-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slideData: fileBase64,
          fileName: uploadedFile.name,
          settings: {
            intelligenceLevel: settings.intelligenceLevel,
            minLength: settings.minLength,
            maxLength: settings.maxLength,
            voice: settings.voice,
            tone: settings.tone,
            customInstructions: settings.customInstructions
          }
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`Video generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      setGeneratedVideo(result.videoUrl || 'mock-video-url');
      
      toast({
        title: "Video generated successfully!",
        description: "Your presentation video is ready"
      });
    } catch (error: any) {
      console.error('Video generation error:', error);
      toast({
        title: "Video generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const intelligenceLabels = ['Basic', 'Simple', 'Standard', 'Advanced', 'Expert'];
  const voiceOptions = [
    { value: 'alloy', label: 'Alloy (Neutral)' },
    { value: 'echo', label: 'Echo (Clear)' },
    { value: 'fable', label: 'Fable (Warm)' },
    { value: 'onyx', label: 'Onyx (Deep)' },
    { value: 'nova', label: 'Nova (Bright)' },
    { value: 'shimmer', label: 'Shimmer (Smooth)' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Slides to Video Converter</h1>
          <p className="text-muted-foreground">Transform your presentations into engaging video content with AI narration</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload Presentation</span>
                </CardTitle>
                <CardDescription>
                  Support for PowerPoint (.pptx, .ppt) and PDF files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pptx,.ppt,.pdf"
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                    </label>
                  </div>
                  {uploadedFile && (
                    <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                      <Video className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium truncate">{uploadedFile.name}</span>
                      <Badge variant="secondary">Ready</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Customization</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Intelligence Level */}
                <div className="space-y-3">
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
                <div className="space-y-3">
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
                      />
                    </div>
                  </div>
                </div>

                {/* Voice Selection */}
                <div className="space-y-3">
                  <Label className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Voice Preset</span>
                  </Label>
                  <Select value={settings.voice} onValueChange={(value) => setSettings(prev => ({ ...prev, voice: value }))}>
                    <SelectTrigger>
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
                <div className="space-y-3">
                  <Label>Presentation Tone</Label>
                  <Select value={settings.tone} onValueChange={(value) => setSettings(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger>
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
                <div className="space-y-3">
                  <Label>Custom Instructions (Optional)</Label>
                  <Textarea
                    placeholder="Any specific instructions for the AI narrator..."
                    value={settings.customInstructions}
                    onChange={(e) => setSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generate Button */}
            <Card>
              <CardContent className="p-6">
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
              <Card>
                <CardHeader>
                  <CardTitle>Generating Your Video</CardTitle>
                  <CardDescription>This may take a few minutes depending on the size of your presentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
                </CardContent>
              </Card>
            )}

            {/* Generated Video */}
            {generatedVideo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span>Generated Video</span>
                  </CardTitle>
                  <CardDescription>Your presentation has been converted to video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Video className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Video preview would appear here</p>
                      <p className="text-xs text-muted-foreground">Mock video: {generatedVideo}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Play Video
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideToVideo;