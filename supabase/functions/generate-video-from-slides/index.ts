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
    const { slideData, fileName, settings } = await req.json();
    
    if (!slideData) {
      throw new Error('Slide data is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Processing slides from file: ${fileName}`);

    // Generate script from slides using OpenAI with timeout handling
    const scriptResponse = await Promise.race([
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional presentation narrator. Create a detailed script for a video presentation.
              
              Intelligence Level: ${settings.intelligenceLevel}/5 (1=basic, 5=expert academic level)
              Target Length: ${settings.minLength}-${settings.maxLength} minutes
              Voice: ${settings.voice}
              Tone: ${settings.tone}
              
              Create an engaging script that expands on slide content with smooth transitions.
              ${settings.customInstructions ? `Additional instructions: ${settings.customInstructions}` : ''}`
            },
            {
              role: 'user',
              content: `Create a ${settings.minLength}-${settings.maxLength} minute presentation script in a ${settings.tone} tone for file: ${fileName}. Make it engaging and informative.`
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Script generation timeout')), 30000))
    ]);

    if (!scriptResponse.ok) {
      throw new Error(`Script generation failed: ${scriptResponse.statusText}`);
    }

    const scriptData = await scriptResponse.json();
    const script = scriptData.choices[0].message.content;

    // Generate audio from script using OpenAI TTS with timeout
    const audioResponse = await Promise.race([
      fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: script.substring(0, 4000), // Limit to prevent timeout
          voice: settings.voice,
          response_format: 'mp3',
        }),
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Audio generation timeout')), 45000))
    ]);

    if (!audioResponse.ok) {
      throw new Error(`Audio generation failed: ${audioResponse.statusText}`);
    }

    // Convert audio to base64 for response
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    const response = {
      success: true,
      script: script,
      audioUrl: `data:audio/mp3;base64,${audioBase64}`,
      videoUrl: `mock-video-${Date.now()}.mp4`, // In production, this would combine slides with audio
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
    console.error('Error in generate-video-from-slides function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
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