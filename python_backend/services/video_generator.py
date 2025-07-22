
import asyncio
import base64
import os
import tempfile
import logging
from typing import Dict, Any, Callable, Optional
import subprocess
from PIL import Image, ImageDraw, ImageFont
import moviepy.editor as mp
from moviepy.video.fx import resize
import numpy as np
try:
    from TTS.api import TTS
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False

logger = logging.getLogger(__name__)

class VideoGenerator:
    def __init__(self):
        self.output_dir = "output"
        self.temp_dir = "temp"
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(f"{self.output_dir}/videos", exist_ok=True)
        os.makedirs(f"{self.output_dir}/audio", exist_ok=True)
        os.makedirs(self.temp_dir, exist_ok=True)
        
        # Initialize TTS model if available
        self.tts_model = None
        if TTS_AVAILABLE:
            try:
                # Use a fast, multilingual model
                self.tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
                logger.info("Coqui TTS initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Coqui TTS: {e}")
                self.tts_model = None
    
    async def create_synchronized_video(self, 
                                      script: str, 
                                      slide_content: Dict[str, Any], 
                                      settings: Dict[str, Any],
                                      progress_callback: Optional[Callable] = None) -> Dict[str, Any]:
        """Create synchronized video with audio narration"""
        
        try:
            if progress_callback:
                await progress_callback(10)
            
            # Generate audio from script
            audio_path = await self._generate_audio(script, settings)
            
            if progress_callback:
                await progress_callback(40)
            
            # Create visual slides
            slide_images = await self._create_slide_visuals(slide_content, settings)
            
            if progress_callback:
                await progress_callback(70)
            
            # Combine audio and visuals
            video_path = await self._combine_audio_video(audio_path, slide_images, settings)
            
            if progress_callback:
                await progress_callback(100)
            
            # Get audio duration for metadata
            audio_clip = mp.AudioFileClip(audio_path)
            duration = f"{int(audio_clip.duration//60)}:{int(audio_clip.duration%60):02d}"
            audio_clip.close()
            
            return {
                "video_url": f"/download/videos/{os.path.basename(video_path)}",
                "audio_url": f"/download/audio/{os.path.basename(audio_path)}",
                "duration": duration
            }
            
        except Exception as e:
            logger.error(f"Video generation failed: {e}")
            raise
    
    async def _generate_audio(self, script: str, settings: Dict[str, Any]) -> str:
        """Generate audio using Coqui TTS"""
        try:
            timestamp = int(asyncio.get_event_loop().time())
            audio_path = f"{self.output_dir}/audio/audio_{timestamp}.wav"
            
            # Get voice settings
            voice_preset = settings.get('voice', 'default')
            language = settings.get('language', 'en')
            
            # Clean script for TTS
            clean_script = script.replace('\n', ' ').strip()
            
            if self.tts_model and TTS_AVAILABLE:
                try:
                    # Use Coqui TTS with voice presets
                    speaker_wav = self._get_voice_sample(voice_preset)
                    
                    # Generate audio with Coqui TTS
                    self.tts_model.tts_to_file(
                        text=clean_script,
                        file_path=audio_path,
                        speaker_wav=speaker_wav,
                        language=language
                    )
                    logger.info(f"Generated audio with Coqui TTS using voice: {voice_preset}")
                    
                except Exception as e:
                    logger.warning(f"Coqui TTS failed: {e}, falling back to espeak")
                    return await self._fallback_tts(clean_script, audio_path)
            else:
                # Fallback to espeak
                return await self._fallback_tts(clean_script, audio_path)
            
            return audio_path
            
        except Exception as e:
            logger.error(f"Audio generation failed: {e}")
            raise
    
    def _get_voice_sample(self, voice_preset: str) -> str:
        """Get voice sample for voice cloning"""
        # Built-in voice samples for different presets
        voice_samples = {
            'professional_male': 'path_to_male_sample.wav',
            'professional_female': 'path_to_female_sample.wav',
            'energetic': 'path_to_energetic_sample.wav',
            'calm': 'path_to_calm_sample.wav',
            'default': None  # Use default XTTS voice
        }
        
        # For now, return None to use default voice
        # In production, you'd have actual voice sample files
        return voice_samples.get(voice_preset, None)
    
    async def _fallback_tts(self, script: str, audio_path: str) -> str:
        """Fallback TTS using espeak or silent audio"""
        try:
            # Try espeak first
            cmd = ['espeak', '-s', '150', '-w', audio_path, script]
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info("Generated audio with espeak fallback")
            return audio_path
        except (subprocess.CalledProcessError, FileNotFoundError):
            # Create silent audio as last resort
            logger.warning("No TTS available, creating silent audio")
            duration = len(script.split()) / 2.5  # Rough estimate: 2.5 words per second
            
            from moviepy.audio.AudioClip import AudioClip
            silent_audio = AudioClip(lambda t: 0, duration=duration)
            silent_audio.write_audiofile(audio_path, verbose=False, logger=None)
            silent_audio.close()
            return audio_path
    
    async def _create_slide_visuals(self, slide_content: Dict[str, Any], settings: Dict[str, Any]) -> list:
        """Create visual slides from content"""
        slides = slide_content.get('slides', [])
        slide_images = []
        
        # Standard video dimensions
        width, height = 1920, 1080
        
        for i, slide in enumerate(slides):
            # Create slide image
            img = Image.new('RGB', (width, height), color='white')
            draw = ImageDraw.Draw(img)
            
            # Try to load a better font, fallback to default
            try:
                font_title = ImageFont.truetype("arial.ttf", 72)
                font_body = ImageFont.truetype("arial.ttf", 48)
            except:
                font_title = ImageFont.load_default()
                font_body = ImageFont.load_default()
            
            # Add slide content
            slide_text = slide.get('text', '')
            lines = slide_text.split('\n')
            
            y_position = 200
            for j, line in enumerate(lines[:10]):  # Limit to 10 lines per slide
                if j == 0 and len(line) < 50:  # Likely a title
                    draw.text((100, y_position), line, fill='black', font=font_title)
                    y_position += 100
                else:
                    # Wrap long lines
                    if len(line) > 80:
                        words = line.split()
                        current_line = ""
                        for word in words:
                            if len(current_line + word) < 80:
                                current_line += word + " "
                            else:
                                draw.text((100, y_position), current_line.strip(), fill='black', font=font_body)
                                y_position += 60
                                current_line = word + " "
                        if current_line:
                            draw.text((100, y_position), current_line.strip(), fill='black', font=font_body)
                            y_position += 60
                    else:
                        draw.text((100, y_position), line, fill='black', font=font_body)
                        y_position += 60
                
                if y_position > height - 100:  # Don't overflow
                    break
            
            # Add slide number
            draw.text((width - 200, height - 100), f"Slide {i + 1}", fill='gray', font=font_body)
            
            # Save slide image
            slide_path = f"{self.temp_dir}/slide_{i+1}.png"
            img.save(slide_path)
            slide_images.append(slide_path)
        
        return slide_images
    
    async def _combine_audio_video(self, audio_path: str, slide_images: list, settings: Dict[str, Any]) -> str:
        """Combine audio and slide images into final video"""
        try:
            timestamp = int(asyncio.get_event_loop().time())
            video_path = f"{self.output_dir}/videos/video_{timestamp}.mp4"
            
            # Load audio to get duration
            audio_clip = mp.AudioFileClip(audio_path)
            total_duration = audio_clip.duration
            
            # Calculate duration per slide
            slides_per_duration = total_duration / len(slide_images) if slide_images else 5
            
            # Create video clips for each slide
            video_clips = []
            for slide_path in slide_images:
                img_clip = mp.ImageClip(slide_path, duration=slides_per_duration)
                img_clip = img_clip.resize((1920, 1080))
                video_clips.append(img_clip)
            
            # If no slides, create a simple text slide
            if not video_clips:
                # Create a simple slide
                img = Image.new('RGB', (1920, 1080), color='white')
                draw = ImageDraw.Draw(img)
                draw.text((960, 540), "Generated Presentation", fill='black', anchor="mm")
                
                temp_slide = f"{self.temp_dir}/default_slide.png"
                img.save(temp_slide)
                img_clip = mp.ImageClip(temp_slide, duration=total_duration)
                video_clips = [img_clip]
            
            # Concatenate all slides
            final_video = mp.concatenate_videoclips(video_clips)
            
            # Ensure video duration matches audio
            if final_video.duration != total_duration:
                final_video = final_video.set_duration(total_duration)
            
            # Add audio
            final_video = final_video.set_audio(audio_clip)
            
            # Write final video
            final_video.write_videofile(
                video_path,
                fps=24,
                codec='libx264',
                audio_codec='aac',
                verbose=False,
                logger=None
            )
            
            # Clean up
            final_video.close()
            audio_clip.close()
            
            return video_path
            
        except Exception as e:
            logger.error(f"Video composition failed: {e}")
            raise
