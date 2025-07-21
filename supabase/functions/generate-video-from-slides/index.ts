import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlideToVideoRequest {
  slides: Array<{
    content: string;
    duration: number;
    notes?: string;
  }>;
  settings: {
    voiceType: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    speed: number;
    backgroundMusic?: boolean;
    resolution: '720p' | '1080p' | '4k';
    style: 'professional' | 'casual' | 'educational' | 'creative';
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slides, settings }: SlideToVideoRequest = await req.json();
    
    if (!slides || slides.length === 0) {
      throw new Error('Slides data is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Processing ${slides.length} slides with ${settings.style} style`);

    // Generate script for each slide
    const slideScripts = await Promise.all(
      slides.map(slide => generateSlideScript(slide, settings, openaiApiKey))
    );

    // Generate voice narration for each slide
    const audioTracks = await Promise.all(
      slideScripts.map(script => generateVoiceNarration(script, settings, openaiApiKey))
    );

    // Generate visual enhancements
    const visualEnhancements = await Promise.all(
      slides.map(slide => generateVisualEnhancements(slide, settings, openaiApiKey))
    );

    // Compile final video data
    const videoData = {
      slides: slides.map((slide, index) => ({
        ...slide,
        script: slideScripts[index],
        audioUrl: audioTracks[index],
        visualEnhancements: visualEnhancements[index]
      })),
      metadata: {
        totalDuration: slides.reduce((sum, slide) => sum + slide.duration, 0),
        resolution: settings.resolution,
        style: settings.style,
        voiceType: settings.voiceType,
        createdAt: new Date().toISOString()
      },
      downloadUrl: `https://example.com/video/${Date.now()}.mp4` // Mock URL
    };

    return new Response(JSON.stringify(videoData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Slide to video error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateSlideScript(slide: any, settings: any, apiKey: string): Promise<string> {
  const scriptPrompt = `Convert this slide content into a natural, engaging voiceover script.
  
Style: ${settings.style}
Content: ${slide.content}
Speaker Notes: ${slide.notes || 'None'}
Duration: ${slide.duration} seconds

Requirements:
- Natural, conversational tone
- Appropriate pacing for ${slide.duration} second duration
- ${settings.style} style delivery
- Clear pronunciation guides for complex terms
- Engaging and informative`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional scriptwriter specializing in presentation voiceovers. Create scripts that are natural, engaging, and perfectly timed.'
          },
          {
            role: 'user',
            content: scriptPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`Script generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;

  } catch (error) {
    console.error('Script generation error:', error);
    return slide.content; // Fallback to original content
  }
}

async function generateVoiceNarration(script: string, settings: any, apiKey: string): Promise<string> {
  console.log(`Generating voice narration with ${settings.voiceType} voice`);

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: script,
        voice: settings.voiceType,
        speed: settings.speed,
        response_format: 'mp3'
      }),
    });

    if (!response.ok) {
      throw new Error(`Voice generation failed: ${response.statusText}`);
    }

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    // Return data URL for audio
    return `data:audio/mp3;base64,${base64Audio}`;

  } catch (error) {
    console.error('Voice generation error:', error);
    return ''; // Return empty string on error
  }
}

async function generateVisualEnhancements(slide: any, settings: any, apiKey: string): Promise<any> {
  const enhancementPrompt = `Suggest visual enhancements for this slide to make it more engaging:

Content: ${slide.content}
Style: ${settings.style}
Resolution: ${settings.resolution}

Provide suggestions for:
1. Animation timing and effects
2. Color scheme optimization
3. Typography improvements
4. Visual elements to add
5. Transition effects`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a visual design expert specializing in presentation enhancement. Provide practical, implementable suggestions.'
          },
          {
            role: 'user',
            content: enhancementPrompt
          }
        ],
        max_tokens: 400,
        temperature: 0.6
      }),
    });

    const result = await response.json();
    
    return {
      suggestions: result.choices[0].message.content,
      animations: ['fadeIn', 'slideUp'],
      colorScheme: settings.style === 'professional' ? 'blue-gradient' : 'warm-gradient',
      transitions: ['smooth-fade']
    };

  } catch (error) {
    console.error('Visual enhancement error:', error);
    return {
      suggestions: 'Standard visual enhancements applied',
      animations: ['fadeIn'],
      colorScheme: 'default',
      transitions: ['fade']
    };
  }
}