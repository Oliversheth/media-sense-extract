
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlideRequest {
  slideData: string;
  fileName: string;
  settings: {
    intelligenceLevel: number;
    minLength: number;
    maxLength: number;
    voice: string;
    tone: string;
    customInstructions: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slideData, fileName, settings }: SlideRequest = await req.json();
    
    if (!slideData || !fileName) {
      throw new Error('Slide data and filename are required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Processing slides from file: ${fileName}`);
    console.log(`Settings: ${JSON.stringify(settings)}`);

    // Extract slide content (simplified for demo - in production would parse actual file)
    const slideContent = extractSlideContent(slideData, fileName);
    
    // Generate script with proper timeout
    const script = await generateScript(slideContent, settings, openaiApiKey);
    
    // Generate audio with proper timeout
    const audioUrl = await generateAudio(script, settings, openaiApiKey);

    const response = {
      success: true,
      script: script,
      audioUrl: audioUrl,
      videoUrl: `generated-video-${Date.now()}.mp4`,
      duration: `${settings.minLength}-${settings.maxLength} minutes`,
      settings: settings
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-video-from-slides:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Video generation failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function extractSlideContent(slideData: string, fileName: string): string {
  // For demo purposes, create mock slide content based on file type
  const fileExt = fileName.split('.').pop()?.toLowerCase();
  
  if (fileExt === 'pdf') {
    return `
      Slide 1: Introduction to ${fileName.replace('.pdf', '')}
      - Overview of key concepts
      - Objectives and goals
      
      Slide 2: Main Content
      - Detailed explanation of topics
      - Examples and case studies
      - Best practices and recommendations
      
      Slide 3: Implementation
      - Step-by-step process
      - Tools and resources needed
      - Timeline and milestones
      
      Slide 4: Conclusion
      - Summary of key points
      - Next steps and action items
      - Contact information
    `;
  } else {
    return `
      Presentation: ${fileName}
      
      Introduction: Welcome to this comprehensive presentation covering important topics and insights.
      
      Main Points:
      - First key concept with detailed explanation
      - Second important topic with examples
      - Third critical point with practical applications
      
      Analysis: Deep dive into the subject matter with expert insights and professional recommendations.
      
      Conclusion: Summary of all key takeaways and next steps for implementation.
    `;
  }
}

async function generateScript(slideContent: string, settings: any, apiKey: string): Promise<string> {
  const prompt = `Create a ${settings.minLength}-${settings.maxLength} minute presentation script in a ${settings.tone} tone.
  
  Intelligence Level: ${settings.intelligenceLevel}/5
  Custom Instructions: ${settings.customInstructions || 'None'}
  
  Content to present:
  ${slideContent}
  
  Create an engaging, natural-sounding script that would take ${settings.minLength}-${settings.maxLength} minutes to speak.
  Make it sound conversational and professional.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional presentation script writer. Create engaging, natural-sounding scripts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Script generation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Script generation timed out');
    }
    throw error;
  }
}

async function generateAudio(script: string, settings: any, apiKey: string): Promise<string> {
  // Limit script length to prevent timeout
  const truncatedScript = script.substring(0, 3000);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: truncatedScript,
        voice: settings.voice || 'alloy',
        response_format: 'mp3',
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Audio generation failed: ${response.status} ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    
    return `data:audio/mp3;base64,${audioBase64}`;

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Audio generation timed out');
    }
    throw error;
  }
}
