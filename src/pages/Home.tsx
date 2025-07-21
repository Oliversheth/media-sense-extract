import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, Video, Zap, Settings, Upload, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VideoAI</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Features</Button>
              <Button variant="ghost">Pricing</Button>
              <Button variant="ghost">Resources</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50/50 to-orange-50/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-orange-400/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary" className="mb-2">
                  AI-Powered Video Tools
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary via-purple-600 to-orange-500 bg-clip-text text-transparent">
                    Transform content
                  </span>
                  <br />
                  with AI precision
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Convert slides to engaging video presentations or extract key insights from videos. 
                  Powered by advanced AI to save you time and enhance your content.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Creating
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Instant processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Customizable outputs</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 transform rotate-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Video Analytics</h3>
                    <Badge>Live</Badge>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-purple-100 to-orange-100 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-purple-600">2,847</div>
                      <div className="text-sm text-muted-foreground">Videos Processed</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">98%</div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">&lt; 2min</div>
                      <div className="text-xs text-muted-foreground">Avg. Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Two powerful tools, endless possibilities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're creating content or analyzing it, our AI-powered tools streamline your workflow.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Slide to Video Card */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 group">
              <CardHeader className="p-0 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Slides → Video</CardTitle>
                <CardDescription className="text-base">
                  Transform your presentations into engaging videos with AI narration
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Upload PowerPoint, Keynote, or PDF slides</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Customize intelligence level, length, and voice</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Get professional video presentation</span>
                  </div>
                </div>
                <Link to="/slide-to-video">
                  <Button className="w-full">
                    Create Video Presentation
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Video Analysis Card */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 group">
              <CardHeader className="p-0 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Video → Insights</CardTitle>
                <CardDescription className="text-base">
                  Extract key information and create summaries from any video
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Upload video files in any format</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Choose output format and detail level</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Get summaries, slides, or detailed reports</span>
                  </div>
                </div>
                <Link to="/video-analysis">
                  <Button className="w-full" variant="outline">
                    Analyze Video Content
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to transform your content workflow?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators, educators, and professionals who use VideoAI to streamline their content creation and analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;