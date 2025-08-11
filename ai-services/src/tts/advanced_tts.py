# ai-services/src/tts/advanced_tts.py
import azure.cognitiveservices.speech as speechsdk
import re
from typing import Dict, List, Optional
from dataclasses import dataclass
import asyncio

@dataclass
class VoiceProfile:
    name: str
    gender: str
    age_range: str
    accent: str
    personality: str
    sample_rate: int = 24000

class AdvancedTTSEngine:
    def __init__(self, speech_key: str, speech_region: str):
        self.speech_config = speechsdk.SpeechConfig(
            subscription=speech_key,
            region=speech_region
        )

        # Available voice profiles
        self.voice_profiles = {
            'jenny_professional': VoiceProfile(
                name='en-US-JennyNeural',
                gender='female',
                age_range='adult',
                accent='american',
                personality='professional'
            ),
            'aria_warm': VoiceProfile(
                name='en-US-AriaNeural',
                gender='female',
                age_range='young_adult',
                accent='american',
                personality='warm'
            ),
            'guy_friendly': VoiceProfile(
                name='en-US-GuyNeural',
                gender='male',
                age_range='adult',
                accent='american',
                personality='friendly'
            ),
            'davis_authoritative': VoiceProfile(
                name='en-US-DavisNeural',
                gender='male',
                age_range='mature',
                accent='american',
                personality='authoritative'
            )
        }

    async def synthesize_with_emotions(
        self,
        text: str,
        voice_profile: str,
        emotion: str = 'neutral',
        speaking_rate: float = 1.0,
        pitch: str = 'medium'
    ) -> bytes:
        """
        Synthesize speech with emotional expression
        """
        voice = self.voice_profiles.get(voice_profile, self.voice_profiles['jenny_professional'])

        # Create enhanced SSML with emotions
        ssml = self.create_emotional_ssml(text, voice, emotion, speaking_rate, pitch)

        # Configure speech synthesizer
        self.speech_config.speech_synthesis_voice_name = voice.name
        self.speech_config.set_speech_synthesis_output_format(
            speechsdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3
        )

        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=self.speech_config,
            audio_config=None
        )

        # Synthesize speech
        result = synthesizer.speak_ssml_async(ssml).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return result.audio_data
        else:
            raise Exception(f"Speech synthesis failed: {result.reason}")

    def create_emotional_ssml(
        self,
        text: str,
        voice: VoiceProfile,
        emotion: str,
        speaking_rate: float,
        pitch: str
    ) -> str:
        """
        Create SSML with emotional expression and natural speech patterns
        """
        # Preprocess text for better speech
        enhanced_text = self.enhance_text_for_speech(text)

        # Map emotions to SSML styles
        emotion_styles = {
            'neutral': '',
            'cheerful': 'style="cheerful"',
            'sad': 'style="sad"',
            'angry': 'style="angry"',
            'fearful': 'style="fearful"',
            'excited': 'style="excited"',
            'friendly': 'style="friendly"',
            'hopeful': 'style="hopeful"',
            'shouting': 'style="shouting"',
            'terrified': 'style="terrified"',
            'unfriendly': 'style="unfriendly"',
            'whispering': 'style="whispering"'
        }

        style_attribute = emotion_styles.get(emotion, '')

        ssml = f"""
        <speak version="1.0" xmlns="<http://www.w3.org/2001/10/synthesis>"
               xmlns:mstts="<https://www.w3.org/2001/mstts>" xml:lang="en-US">
            <voice name="{voice.name}">
                <mstts:express-as {style_attribute}>
                    <prosody rate="{speaking_rate}" pitch="{pitch}">
                        {enhanced_text}
                    </prosody>
                </mstts:express-as>
            </voice>
        </speak>
        """

        return ssml

    def enhance_text_for_speech(self, text: str) -> str:
        """
        Enhance text with natural speech patterns and pauses
        """
        # Add pauses for punctuation
        text = re.sub(r'\\.', '.<break time="600ms"/>', text)
        text = re.sub(r',', ',<break time="300ms"/>', text)
        text = re.sub(r';', ';<break time="400ms"/>', text)
        text = re.sub(r':', ':<break time="300ms"/>', text)
        text = re.sub(r'\\?', '?<break time="700ms"/>', text)
        text = re.sub(r'!', '!<break time="700ms"/>', text)

        # Add emphasis for quoted speech
        text = re.sub(
            r'"([^"]*)"',
            r'<emphasis level="moderate">"\\1"</emphasis>',
            text
        )

        # Add emphasis for italicized text (assuming *text* format)
        text = re.sub(
            r'\\*([^*]*)\\*',
            r'<emphasis level="strong">\\1</emphasis>',
            text
        )

        # Handle chapter breaks
        text = re.sub(
            r'Chapter \\d+',
            r'<break time="2s"/>Chapter <say-as interpret-as="cardinal">\\g<0></say-as><break time="1s"/>',
            text
        )

        # Handle dialogue attribution
        text = re.sub(
            r'," (he|she|they) (said|asked|replied|whispered|shouted)',
            r',<break time="200ms"/> \\1 \\2',
            text
        )

        return text

    async def analyze_text_emotion(self, text: str) -> str:
        """
        Analyze text to determine appropriate emotional tone
        """
        # Simple emotion detection based on keywords and punctuation
        text_lower = text.lower()

        # Excitement indicators
        if '!' in text or any(word in text_lower for word in ['amazing', 'incredible', 'fantastic', 'wonderful']):
            return 'excited'

        # Sadness indicators
        if any(word in text_lower for word in ['sad', 'tragic', 'sorrow', 'grief', 'died', 'death']):
            return 'sad'

        # Fear indicators
        if any(word in text_lower for word in ['scared', 'terrified', 'afraid', 'horror', 'nightmare']):
            return 'fearful'

        # Anger indicators
        if any(word in text_lower for word in ['angry', 'furious', 'rage', 'hate', 'damn']):
            return 'angry'

        # Cheerful indicators
        if any(word in text_lower for word in ['happy', 'joy', 'laugh', 'smile', 'cheerful']):
            return 'cheerful'

        return 'neutral'

    async def create_audiobook_chapter(
        self,
        chapter_text: str,
        voice_profile: str,
        chapter_number: int,
        book_title: str
    ) -> bytes:
        """
        Create a complete audiobook chapter with intro and enhanced narration
        """
        # Add chapter introduction
        intro_text = f"Chapter {chapter_number}."

        # Analyze chapter for emotional tone
        dominant_emotion = await self.analyze_text_emotion(chapter_text)

        # Create full chapter SSML
        full_ssml = self.create_chapter_ssml(
            intro_text,
            chapter_text,
            voice_profile,
            dominant_emotion
        )

        # Synthesize complete chapter
        return await self.synthesize_ssml(full_ssml)

    def create_chapter_ssml(
        self,
        intro_text: str,
        chapter_text: str,
        voice_profile: str,
        emotion: str
    ) -> str:
        """
        Create SSML for a complete chapter with proper pacing
        """
        voice = self.voice_profiles.get(voice_profile, self.voice_profiles['jenny_professional'])

        ssml = f"""
        <speak version="1.0" xmlns="<http://www.w3.org/2001/10/synthesis>"
               xmlns:mstts="<https://www.w3.org/2001/mstts>" xml:lang="en-US">
            <voice name="{voice.name}">
                <!-- Chapter Introduction -->
                <mstts:express-as style="newscast">
                    <prosody rate="0.9" pitch="medium">
                        {intro_text}
                        <break time="2s"/>
                    </prosody>
                </mstts:express-as>

                <!-- Chapter Content -->
                <mstts:express-as style="{emotion if emotion != 'neutral' else 'friendly'}">
                    <prosody rate="1.0" pitch="medium">
                        {self.enhance_text_for_speech(chapter_text)}
                    </prosody>
                </mstts:express-as>

                <!-- Chapter End -->
                <break time="3s"/>
            </voice>
        </speak>
        """

        return ssml

# FastAPI endpoints for advanced TTS
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uuid

app = FastAPI()
tts_engine = AdvancedTTSEngine(
    speech_key=os.getenv('AZURE_SPEECH_KEY'),
    speech_region=os.getenv('AZURE_SPEECH_REGION')
)

class TTSRequest(BaseModel):
    text: str
    voice_profile: str = 'jenny_professional'
    emotion: str = 'neutral'
    speaking_rate: float = 1.0
    pitch: str = 'medium'

class AudiobookRequest(BaseModel):
    chapter_text: str
    voice_profile: str
    chapter_number: int
    book_title: str

@app.post("/synthesize-advanced")
async def synthesize_advanced_speech(request: TTSRequest):
    try:
        audio_data = await tts_engine.synthesize_with_emotions(
            request.text,
            request.voice_profile,
            request.emotion,
            request.speaking_rate,
            request.pitch
        )

        return {
            "audio_data": audio_data.hex(),
            "content_type": "audio/mpeg",
            "voice_profile": request.voice_profile,
            "emotion": request.emotion
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-audiobook-chapter")
async def create_audiobook_chapter(request: AudiobookRequest, background_tasks: BackgroundTasks):
    try:
        # Generate unique job ID
        job_id = str(uuid.uuid4())

        # Start background processing
        background_tasks.add_task(
            process_audiobook_chapter,
            job_id,
            request.chapter_text,
            request.voice_profile,
            request.chapter_number,
            request.book_title
        )

        return {
            "job_id": job_id,
            "status": "processing",
            "message": "Audiobook chapter generation started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_audiobook_chapter(
    job_id: str,
    chapter_text: str,
    voice_profile: str,
    chapter_number: int,
    book_title: str
):
    try:
        audio_data = await tts_engine.create_audiobook_chapter(
            chapter_text,
            voice_profile,
            chapter_number,
            book_title
        )

        # Save audio file
        file_path = f"audiobooks/{job_id}_chapter_{chapter_number}.mp3"
        with open(file_path, 'wb') as f:
            f.write(audio_data)

        # Update job status in database
        # await update_job_status(job_id, 'completed', file_path)

    except Exception as e:
        # await update_job_status(job_id, 'failed', str(e))
        print(f"Audiobook generation failed: {e}")
