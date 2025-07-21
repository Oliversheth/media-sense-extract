
import aiohttp
import asyncio
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.session = None
    
    async def get_session(self):
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def check_connection(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            session = await self.get_session()
            async with session.get(f"{self.base_url}/api/tags") as response:
                if response.status == 200:
                    models = await response.json()
                    logger.info(f"Connected to Ollama. Available models: {[m['name'] for m in models.get('models', [])]}")
                    return True
                return False
        except Exception as e:
            logger.error(f"Failed to connect to Ollama: {e}")
            return False
    
    async def generate_text(self, 
                          model: str, 
                          prompt: str, 
                          system_prompt: Optional[str] = None,
                          max_tokens: int = 2000,
                          temperature: float = 0.7) -> str:
        """Generate text using local Ollama model"""
        try:
            session = await self.get_session()
            
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": max_tokens,
                    "temperature": temperature
                }
            }
            
            if system_prompt:
                payload["system"] = system_prompt
            
            async with session.post(f"{self.base_url}/api/generate", json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    return result.get("response", "")
                else:
                    error_text = await response.text()
                    logger.error(f"Ollama API error: {response.status} - {error_text}")
                    raise Exception(f"Ollama API error: {response.status}")
                    
        except Exception as e:
            logger.error(f"Failed to generate text with Ollama: {e}")
            raise
    
    async def close(self):
        if self.session:
            await self.session.close()
