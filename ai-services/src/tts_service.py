# ai-services/src/tts_service.py
from azure.cognitiveservices.speech import SpeechConfig, SpeechSynthesizer, AudioConfig
from azure.cognitiveservices.speech.audio import AudioOutputConfig
import os
import asyncio
from typing import Optional

class TextToSpeechService:
    def __init__(self):
        self.speech_config = SpeechConfig(
            subscription=os.getenv('AZURE_SPEECH_KEY'),
            region=os.getenv('AZURE_SPEECH_REGION')
        )

    async def synthesize_text(
        self,
        text: str,
        voice_name: str = "en-US-JennyNeural",
        speaking_rate: float = 1.0,
        output_format: str = "audio-16khz-32kbitrate-mono-mp3"
    ) -> bytes:
        """
        Convert text to speech using Azure Cognitive Services
        """
        self.speech_config.speech_synthesis_voice_name = voice_name
        self.speech_config.set_speech_synthesis_output_format_by_name(output_format)

        # Create SSML for better control
        ssml = self.create_ssml(text, voice_name, speaking_rate)

        # Configure audio output to memory
        audio_config = AudioOutputConfig(use_default_speaker=False)
        synthesizer = SpeechSynthesizer(
            speech_config=self.speech_config,
            audio_config=audio_config
        )

        # Synthesize speech
        result = synthesizer.speak_ssml_async(ssml).get()

        if result.reason == result.reason.SynthesizingAudioCompleted:
            return result.audio_data
        else:
            raise Exception(f"Speech synthesis failed: {result.reason}")

    def create_ssml(self, text: str, voice_name: str, speaking_rate: float) -> str:
        """
        Create SSML markup for enhanced speech synthesis
        """
        # Add natural pauses and emphasis
        enhanced_text = self.enhance_text_for_speech(text)

        ssml = f"""
        <speak version="1.0" xmlns="<http://www.w3.org/2001/10/synthesis>" xml:lang="en-US">
            <voice name="{voice_name}">
                <prosody rate="{speaking_rate}">
                    {enhanced_text}
                </prosody>
            </voice>
        </speak>
        """
        return ssml

    def enhance_text_for_speech(self, text: str) -> str:
        """
        Add pauses and emphasis for natural speech
        """
        import re

        # Add pauses at punctuation
        text = re.sub(r'\\.', '.<break time="500ms"/>', text)
        text = re.sub(r',', ',<break time="200ms"/>', text)
        text = re.sub(r';', ';<break time="300ms"/>', text)
        text = re.sub(r':', ':<break time="250ms"/>', text)

        # Add emphasis to quoted text
        text = re.sub(r'"([^"]*)"', r'<emphasis level="moderate">"\\1"</emphasis>', text)

        return text

# FastAPI endpoint
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()
tts_service = TextToSpeechService()

class TTSRequest(BaseModel):
    text: str
    voice_name: str = "en-US-JennyNeural"
    speaking_rate: float = 1.0

@app.post("/synthesize")
async def synthesize_speech(request: TTSRequest):
    try:
        audio_data = await tts_service.synthesize_text(
            request.text,
            request.voice_name,
            request.speaking_rate
        )

        return {
            "audio_data": audio_data.hex(),  # Convert to hex for JSON transport
            "content_type": "audio/mpeg"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
