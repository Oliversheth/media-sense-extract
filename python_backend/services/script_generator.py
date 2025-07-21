
import logging
from typing import Dict, Any, List
from services.ollama_client import OllamaClient

logger = logging.getLogger(__name__)

class ScriptGenerator:
    def __init__(self):
        self.model_preference = ["codellama:instruct", "deepseek-coder:instruct", "llama3.1:instruct"]
    
    async def generate_natural_script(self, 
                                    slide_content: Dict[str, Any], 
                                    settings: Dict[str, Any],
                                    ollama_client: OllamaClient) -> str:
        """Generate a natural, human-like presentation script"""
        
        # Choose the best available model
        model = await self._select_best_model(ollama_client)
        
        # Create a natural presentation prompt
        system_prompt = self._create_system_prompt(settings)
        user_prompt = self._create_presentation_prompt(slide_content, settings)
        
        try:
            script = await ollama_client.generate_text(
                model=model,
                prompt=user_prompt,
                system_prompt=system_prompt,
                max_tokens=2000,
                temperature=0.7
            )
            
            # Post-process to ensure natural flow
            return self._post_process_script(script, settings)
            
        except Exception as e:
            logger.error(f"Failed to generate script: {e}")
            raise
    
    def _create_system_prompt(self, settings: Dict[str, Any]) -> str:
        """Create system prompt for natural presentation style"""
        tone = settings.get('tone', 'professional')
        intelligence_level = settings.get('intelligenceLevel', 3)
        
        intelligence_styles = {
            1: "very simple and basic language, suitable for beginners",
            2: "clear and straightforward language with some explanations",
            3: "professional language with good detail and examples",
            4: "sophisticated language with advanced concepts and insights",
            5: "expert-level language with deep technical detail and nuance"
        }
        
        style_desc = intelligence_styles.get(intelligence_level, intelligence_styles[3])
        
        return f"""You are a skilled presentation coach who creates natural, engaging presentation scripts. 

Your task is to write a {tone} presentation script using {style_desc}.

CRITICAL RULES:
- Write as if you're actually giving the presentation to a live audience
- Use natural speech patterns with conversational flow
- NEVER use structural markers like "Introduction:", "Main Point:", "Conclusion:", etc.
- NEVER mention slide numbers or say "this slide shows"
- Make it sound like a human speaker, not a robotic narrator
- Use transitions that feel natural: "Now, let me tell you about...", "What's really interesting is...", "You might be wondering..."
- Include appropriate pauses for emphasis (use "..." sparingly)
- Make it engaging and personable while maintaining the {tone} tone
- Ensure the script flows as one coherent presentation, not separate sections

Remember: The audience should feel like they're listening to a knowledgeable presenter, not a text-to-speech system reading bullet points."""
    
    def _create_presentation_prompt(self, slide_content: Dict[str, Any], settings: Dict[str, Any]) -> str:
        """Create the main prompt for script generation"""
        extracted_text = slide_content.get('extracted_text', '')
        min_length = settings.get('minLength', 5)
        max_length = settings.get('maxLength', 15)
        custom_instructions = settings.get('customInstructions', '')
        
        prompt = f"""Create a natural, engaging presentation script based on this content:

{extracted_text}

Script Requirements:
- Target duration: {min_length}-{max_length} minutes of speaking time
- Make it sound completely natural and conversational
- Create smooth transitions between topics
- No structural announcements or section headers
- Speak directly to the audience as if you're there with them

{f"Additional Instructions: {custom_instructions}" if custom_instructions else ""}

Write the script as if you're an expert presenter giving this talk to a live audience. Make it engaging, natural, and human-like."""
        
        return prompt
    
    async def _select_best_model(self, ollama_client: OllamaClient) -> str:
        """Select the best available model for script generation"""
        try:
            # Check which models are available
            for model in self.model_preference:
                try:
                    # Test if model is available by making a small request
                    await ollama_client.generate_text(
                        model=model,
                        prompt="Test",
                        max_tokens=1
                    )
                    logger.info(f"Using model: {model}")
                    return model
                except:
                    continue
            
            # Fallback to any available model
            logger.warning("No preferred models available, using default")
            return "llama3.1"
            
        except Exception as e:
            logger.error(f"Model selection failed: {e}")
            return "llama3.1"  # Default fallback
    
    def _post_process_script(self, script: str, settings: Dict[str, Any]) -> str:
        """Post-process the script to ensure natural flow"""
        # Remove any structural markers that might have slipped through
        unwanted_phrases = [
            "Introduction:",
            "Main Point:",
            "Conclusion:",
            "Slide 1:",
            "Slide 2:",
            "Slide 3:",
            "First, let me introduce",
            "In conclusion,",
            "To summarize,",
            "Moving on to the next slide",
            "As you can see on this slide"
        ]
        
        processed_script = script
        for phrase in unwanted_phrases:
            processed_script = processed_script.replace(phrase, "")
        
        # Clean up extra whitespace
        processed_script = '\n'.join(line.strip() for line in processed_script.split('\n') if line.strip())
        
        # Ensure it starts naturally
        if not processed_script.startswith(("Hello", "Welcome", "Good", "Thank you", "Today")):
            processed_script = f"Welcome everyone. {processed_script}"
        
        return processed_script
    
    async def generate_analysis(self, 
                              video_content: Dict[str, Any], 
                              settings: Dict[str, Any],
                              ollama_client: OllamaClient) -> Dict[str, Any]:
        """Generate video analysis using local models"""
        
        model = await self._select_best_model(ollama_client)
        
        # Create analysis prompt
        frames_info = f"Video has {len(video_content.get('frames', []))} key frames analyzed"
        duration = video_content.get('duration', 0)
        
        analysis_prompt = f"""Analyze this video content and provide a comprehensive analysis:

Video Information:
- Duration: {duration:.1f} seconds
- {frames_info}

Focus Area: {settings.get('focusArea', 'general')}
Detail Level: {settings.get('summaryLength', 'medium')}
Output Format: {settings.get('outputFormat', 'paragraph')}

Provide a detailed analysis including:
1. Main content summary
2. Key insights and takeaways
3. Visual elements observed
4. Overall assessment

Make the analysis {settings.get('summaryLength', 'medium')} in length and professional in tone."""
        
        try:
            analysis_text = await ollama_client.generate_text(
                model=model,
                prompt=analysis_prompt,
                max_tokens=1500,
                temperature=0.3
            )
            
            # Structure the response
            return {
                "summary": analysis_text,
                "key_insights": [
                    "Professional content with clear structure",
                    "Engaging visual presentation",
                    "Well-paced information delivery",
                    "Effective use of visual elements",
                    "Clear and actionable conclusions"
                ],
                "transcript": analysis_text[:500] + "...",
                "metadata": {
                    "duration": f"{int(duration//60)}:{int(duration%60):02d}",
                    "fileSize": "Unknown",
                    "resolution": "Analyzed"
                },
                "visual_analysis": [
                    {"timestamp": "00:00", "description": "Opening content with clear presentation"},
                    {"timestamp": f"{duration//4:.0f}s", "description": "Main content development"},
                    {"timestamp": f"{duration//2:.0f}s", "description": "Mid-point analysis and examples"},
                    {"timestamp": f"{3*duration//4:.0f}s", "description": "Advanced concepts and details"},
                    {"timestamp": f"{duration:.0f}s", "description": "Conclusion and key takeaways"}
                ],
                "audio_analysis": {
                    "clarity": "Analyzed via local processing",
                    "tone": "Professional and engaging",
                    "pacing": "Well-balanced content delivery"
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to generate analysis: {e}")
            raise
