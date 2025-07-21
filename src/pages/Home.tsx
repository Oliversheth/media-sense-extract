
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, Video, Zap, Settings, Upload, Download, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 to-orange-50/30">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-gradient-to-r from-primary to-accent rounded-md flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                VideoAI
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">Features</Button>
              <Button variant="ghost" size="sm">Pricing</Button>
              <Link to="/slide-to-video">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Vibrant gradient background inspired by Stripe */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-transparent to-yellow-400/20"></div>
        
        {/* Animated geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Video Tools
            </Badge>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black leading-none tracking-tight">
              <span className="text-white drop-shadow-2xl">
                Transform content
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-white bg-clip-text text-transparent drop-shadow-lg">
                with AI precision
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-lg">
              Convert slides to engaging video presentations or extract key insights from videos. 
              Powered by advanced AI to save you time and enhance your content.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link to="/slide-to-video">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 text-lg w-full sm:w-auto shadow-2xl">
                  Start Creating
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/video-analysis">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg w-full sm:w-auto">
                  Analyze Videos
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-12 pt-8 text-white/80">
              <div className="flex items-center space-x-3">
                <Zap className="w-6 h-6 text-yellow-300" />
                <span className="text-lg font-medium">Instant processing</span>
              </div>
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-yellow-300" />
                <span className="text-lg font-medium">Customizable outputs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Two powerful tools, endless possibilities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're creating content or analyzing it, our AI-powered tools streamline your workflow.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Slide to Video Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Slides → Video</CardTitle>
                <CardDescription>
                  Transform your presentations into engaging videos with AI narration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Upload PowerPoint, Keynote, or PDF slides</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Customize voice, length, and intelligence level</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Get professional video presentation</span>
                  </div>
                </div>
                <Link to="/slide-to-video" className="block">
                  <Button className="w-full group-hover:bg-primary/90">
                    Create Video Presentation
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Video Analysis Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Video → Insights</CardTitle>
                <CardDescription>
                  Extract key information and create summaries from any video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Upload video files in any format</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Choose output format and detail level</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Get summaries, slides, or detailed reports</span>
                  </div>
                </div>
                <Link to="/video-analysis" className="block">
                  <Button className="w-full group-hover:bg-muted" variant="outline">
                    Analyze Video Content
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">See it in action</h2>
            <p className="text-lg text-muted-foreground">
              Experience the power of AI-driven video processing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Video Generation Demo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center space-y-2">
                    <Video className="w-12 h-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Video generation preview</p>
                  </div>
                </div>
                <Link to="/slide-to-video">
                  <Button className="w-full">
                    Try Video Generation
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Analysis Results Demo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center space-y-2">
                    <FileText className="w-12 h-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Analysis results preview</p>
                  </div>
                </div>
                <Link to="/video-analysis">
                  <Button className="w-full" variant="outline">
                    Try Video Analysis
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to transform your content workflow?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators, educators, and professionals who use VideoAI to streamline their content creation and analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/slide-to-video">
              <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
