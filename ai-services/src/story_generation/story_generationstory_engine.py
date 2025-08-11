# ai-services/src/story_generation/story_engine.py
import openai
from typing import List, Dict, Any
import json
import asyncio
from dataclasses import dataclass

@dataclass
class StoryChoice:
    id: int
    text: str
    description: str
    consequences: str

@dataclass
class StorySegment:
    content: str
    choices: List[StoryChoice]
    metadata: Dict[str, Any]

class StoryGenerationEngine:
    def __init__(self, api_key: str):
        openai.api_key = api_key
        self.model = "gpt-4-turbo-preview"

    async def generate_initial_story(
        self,
        genre: str,
        characters: str,
        setting: str,
        user_preferences: Dict[str, Any]
    ) -> StorySegment:
        """
        Generate the opening segment of an interactive story
        """
        prompt = self.create_initial_prompt(genre, characters, setting, user_preferences)

        response = await openai.ChatCompletion.acreate(
            model=self.model,
            messages=[
                {"role": "system", "content": self.get_system_prompt()},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=1000
        )

        story_data = self.parse_story_response(response.choices[0].message.content)
        choices = await self.generate_choices(story_data['content'], genre)

        return StorySegment(
            content=story_data['content'],
            choices=choices,
            metadata={
                'genre': genre,
                'mood': story_data.get('mood', 'neutral'),
                'complexity': story_data.get('complexity', 'medium')
            }
        )

    def create_initial_prompt(self, genre: str, characters: str, setting: str, preferences: Dict) -> str:
        return f"""
        Create an engaging opening for a {genre} story with these elements:

        Characters: {characters}
        Setting: {setting}
        Writing Style: {preferences.get('writing_style', 'descriptive')}
        Content Rating: {preferences.get('content_rating', 'PG-13')}

        Requirements:
        - Write 2-3 compelling paragraphs (200-300 words)
        - Establish the main character and conflict
        - Create an immersive atmosphere appropriate for {genre}
        - End with a situation requiring a decision
        - Use vivid, engaging language
        - Maintain appropriate tone for the genre

        Format your response as JSON:
        {{
            "content": "The story text here...",
            "mood": "mysterious/exciting/romantic/etc",
            "complexity": "simple/medium/complex",
            "themes": ["theme1", "theme2"]
        }}
        """

    async def generate_choices(self, story_content: str, genre: str) -> List[StoryChoice]:
        """
        Generate three meaningful choices for story continuation
        """
        prompt = f"""
        Based on this {genre} story segment:

        {story_content}

        Generate exactly 3 distinct choices for how the story could continue.
        Each choice should:
        - Lead to meaningfully different story paths
        - Be appropriate for the {genre} genre
        - Have clear consequences for character development
        - Maintain story momentum

        Format as JSON:
        {{
            "choices": [
                {{
                    "id": 1,
                    "text": "Brief choice description",
                    "description": "Detailed explanation of this choice",
                    "consequences": "What this choice might lead to"
                }},
                // ... 2 more choices
            ]
        }}
        """

        response = await openai.ChatCompletion.acreate(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )

        choices_data = json.loads(response.choices[0].message.content)
        return [StoryChoice(**choice) for choice in choices_data['choices']]

    async def continue_story(
        self,
        previous_content: str,
        chosen_choice: StoryChoice,
        story_context: Dict[str, Any]
    ) -> StorySegment:
        """
        Continue the story based on user's choice
        """
        prompt = f"""
        Previous story content:
        {previous_content}

        User chose: {chosen_choice.text}
        Choice description: {chosen_choice.description}

        Story context:
        - Genre: {story_context.get('genre')}
        - Current mood: {story_context.get('mood')}
        - Themes: {story_context.get('themes', [])}

        Continue the story based on this choice:
        - Write 2-3 paragraphs showing the consequences of the choice
        - Advance the plot meaningfully
        - Maintain character consistency
        - Create new tension or development
        - End with another decision point
        - Keep the same writing style and tone

        Format as JSON with the same structure as before.
        """

        response = await openai.ChatCompletion.acreate(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=800
        )

        story_data = self.parse_story_response(response.choices[0].message.content)
        new_choices = await self.generate_choices(story_data['content'], story_context['genre'])

        return StorySegment(
            content=story_data['content'],
            choices=new_choices,
            metadata=story_context
        )

    def get_system_prompt(self) -> str:
        return """
        You are a master storyteller specializing in interactive fiction. Your role is to:

        1. Create engaging, immersive narratives that draw readers in
        2. Maintain consistency in character development and world-building
        3. Generate meaningful choices that impact story direction
        4. Adapt writing style to match genre conventions
        5. Balance description, dialogue, and action appropriately
        6. Create natural cliffhangers that encourage continued reading

        Always respond in valid JSON format as requested.
        Ensure all content is appropriate for the specified rating.
        Focus on quality storytelling over quantity of text.
        """

    def parse_story_response(self, response: str) -> Dict[str, Any]:
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback parsing if JSON is malformed
            return {
                'content': response,
                'mood': 'neutral',
                'complexity': 'medium',
                'themes': []
            }
