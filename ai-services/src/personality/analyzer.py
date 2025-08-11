# ai-services/src/personality/analyzer.py
from typing import Dict, List, Any
import numpy as np
from dataclasses import dataclass

@dataclass
class PersonalityProfile:
    openness: float
    conscientiousness: float
    extraversion: float
    agreeableness: float
    neuroticism: float
    reading_preferences: Dict[str, Any]
    book_recommendations: List[str]

class PersonalityAnalyzer:
    def __init__(self):
        self.trait_weights = {
            'openness': {
                'experimental_genres': 0.8,
                'complex_narratives': 0.7,
                'diverse_authors': 0.6,
                'unconventional_formats': 0.5
            },
            'conscientiousness': {
                'non_fiction': 0.7,
                'educational_content': 0.8,
                'structured_narratives': 0.6,
                'goal_oriented_reading': 0.9
            },
            'extraversion': {
                'social_themes': 0.7,
                'dialogue_heavy': 0.6,
                'group_reading': 0.8,
                'popular_titles': 0.5
            },
            'agreeableness': {
                'character_driven': 0.8,
                'emotional_stories': 0.7,
                'positive_endings': 0.6,
                'relationship_focus': 0.9
            },
            'neuroticism': {
                'emotional_intensity': 0.6,
                'psychological_themes': 0.7,
                'cathartic_stories': 0.8,
                'self_help': 0.5
            }
        }

    def analyze_personality(
        self,
        quiz_responses: Dict[int, Any],
        reading_history: List[Dict] = None
    ) -> PersonalityProfile:
        """
        Analyze personality based on quiz responses and reading history
        """
        # Calculate Big Five traits from quiz
        traits = self.calculate_big_five_traits(quiz_responses)

        # Enhance with reading history analysis if available
        if reading_history:
            historical_traits = self.analyze_reading_history(reading_history)
            traits = self.combine_trait_analyses(traits, historical_traits)

        # Generate reading preferences
        reading_preferences = self.generate_reading_preferences(traits)

        # Generate book recommendations
        book_recommendations = self.generate_personality_recommendations(traits)

        return PersonalityProfile(
            openness=traits['openness'],
            conscientiousness=traits['conscientiousness'],
            extraversion=traits['extraversion'],
            agreeableness=traits['agreeableness'],
            neuroticism=traits['neuroticism'],
            reading_preferences=reading_preferences,
            book_recommendations=book_recommendations
        )

    def calculate_big_five_traits(self, quiz_responses: Dict[int, Any]) -> Dict[str, float]:
        """
        Calculate Big Five personality traits from quiz responses
        """
        traits = {
            'openness': [],
            'conscientiousness': [],
            'extraversion': [],
            'agreeableness': [],
            'neuroticism': []
        }

        for question_id, response in quiz_responses.items():
            trait = response.get('trait')
            value = response.get('value', 0) / 5.0  # Normalize to 0-1

            if trait in traits:
                traits[trait].append(value)

        # Calculate average scores
        final_traits = {}
        for trait, values in traits.items():
            if values:
                final_traits[trait] = np.mean(values)
            else:
                final_traits[trait] = 0.5  # Default neutral score

        return final_traits

    def analyze_reading_history(self, reading_history: List[Dict]) -> Dict[str, float]:
        """
        Infer personality traits from reading history
        """
        genre_preferences = {}
        completion_rates = []
        rating_patterns = []

        for book in reading_history:
            genre = book.get('genre', '').lower()
            genre_preferences[genre] = genre_preferences.get(genre, 0) + 1

            if book.get('completion_percentage'):
                completion_rates.append(book['completion_percentage'])

            if book.get('user_rating'):
                rating_patterns.append(book['user_rating'])

        # Infer traits from patterns
        inferred_traits = {
            'openness': self.calculate_openness_from_history(genre_preferences),
            'conscientiousness': self.calculate_conscientiousness_from_completion(completion_rates),
            'extraversion': self.calculate_extraversion_from_genres(genre_preferences),
            'agreeableness': self.calculate_agreeableness_from_ratings(rating_patterns),
            'neuroticism': self.calculate_neuroticism_from_genres(genre_preferences)
        }

        return inferred_traits

    def generate_reading_preferences(self, traits: Dict[str, float]) -> Dict[str, Any]:
        """
        Generate detailed reading preferences based on personality traits
        """
        preferences = {
            'preferred_genres': [],
            'content_complexity': 'medium',
            'narrative_style': 'balanced',
            'book_length': 'medium',
            'reading_pace': 'moderate',
            'social_reading': False,
            'experimental_content': False
        }

        # Genre preferences based on traits
        if traits['openness'] > 0.7:
            preferences['preferred_genres'].extend([
                'Experimental Fiction', 'Science Fiction', 'Philosophy',
                'Magical Realism', 'Avant-garde'
            ])
            preferences['experimental_content'] = True
            preferences['content_complexity'] = 'high'

        if traits['conscientiousness'] > 0.7:
            preferences['preferred_genres'].extend([
                'Non-fiction', 'Biography', 'History', 'Self-help',
                'Educational', 'Technical'
            ])
            preferences['reading_pace'] = 'structured'

        if traits['extraversion'] > 0.7:
            preferences['preferred_genres'].extend([
                'Contemporary Fiction', 'Romance', 'Adventure',
                'Social Commentary'
            ])
            preferences['social_reading'] = True
            preferences['narrative_style'] = 'dialogue-heavy'

        if traits['agreeableness'] > 0.7:
            preferences['preferred_genres'].extend([
                'Romance', 'Family Saga', 'Coming-of-age',
                'Inspirational', 'Feel-good Fiction'
            ])
            preferences['narrative_style'] = 'character-driven'

        if traits['neuroticism'] > 0.6:
            preferences['preferred_genres'].extend([
                'Psychological Fiction', 'Drama', 'Memoir',
                'Self-help', 'Mental Health'
            ])

        # Book length preferences
        if traits['conscientiousness'] > 0.7:
            preferences['book_length'] = 'long'  # Willing to commit to longer books
        elif traits['openness'] < 0.3:
            preferences['book_length'] = 'short'  # Prefers familiar, shorter reads

        return preferences

    def generate_personality_recommendations(self, traits: Dict[str, float]) -> List[str]:
        """
        Generate specific book recommendations based on personality profile
        """
        recommendations = []

        # High Openness recommendations
        if traits['openness'] > 0.7:
            recommendations.extend([
                'Experimental literature and avant-garde fiction',
                'Cross-cultural narratives and diverse perspectives',
                'Genre-blending and unconventional storytelling',
                'Philosophy and abstract concepts in fiction'
            ])

        # High Conscientiousness recommendations
        if traits['conscientiousness'] > 0.7:
            recommendations.extend([
                'Non-fiction and educational content',
                'Biographies of successful individuals',
                'Self-improvement and productivity books',
                'Historical and factual narratives'
            ])

        # High Extraversion recommendations
        if traits['extraversion'] > 0.7:
            recommendations.extend([
                'Books with strong social themes',
                'Dialogue-driven narratives',
                'Popular contemporary fiction',
                'Books that spark discussion and debate'
            ])

        # High Agreeableness recommendations
        if traits['agreeableness'] > 0.7:
            recommendations.extend([
                'Character-driven stories with emotional depth',
                'Books exploring relationships and human connection',
                'Uplifting and inspirational narratives',
                'Stories with positive, hopeful endings'
            ])

        # High Neuroticism recommendations
        if traits['neuroticism'] > 0.6:
            recommendations.extend([
                'Psychological fiction and introspective narratives',
                'Books dealing with mental health and personal growth',
                'Cathartic and emotionally intense stories',
                'Memoirs and personal transformation stories'
            ])

        return recommendations[:10]  # Return top 10 recommendations

# FastAPI endpoint
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()
personality_analyzer = PersonalityAnalyzer()

class PersonalityAnalysisRequest(BaseModel):
    quiz_responses: Dict[int, Any]
    reading_history: List[Dict] = None

@app.post("/analyze-personality")
async def analyze_personality(request: PersonalityAnalysisRequest):
    try:
        profile = personality_analyzer.analyze_personality(
            request.quiz_responses,
            request.reading_history
        )

        return {
            "personality_profile": {
                "openness": profile.openness,
                "conscientiousness": profile.conscientiousness,
                "extraversion": profile.extraversion,
                "agreeableness": profile.agreeableness,
                "neuroticism": profile.neuroticism
            },
            "reading_preferences": profile.reading_preferences,
            "recommendations": profile.book_recommendations,
            "analysis_summary": generate_personality_summary(profile)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_personality_summary(profile: PersonalityProfile) -> str:
    """
    Generate a human-readable summary of the personality analysis
    """
    dominant_traits = []

    if profile.openness > 0.7:
        dominant_traits.append("highly open to new experiences")
    if profile.conscientiousness > 0.7:
        dominant_traits.append("very organized and goal-oriented")
    if profile.extraversion > 0.7:
        dominant_traits.append("socially engaged")
    if profile.agreeableness > 0.7:
        dominant_traits.append("empathetic and cooperative")
    if profile.neuroticism > 0.6:
        dominant_traits.append("emotionally sensitive")

    if not dominant_traits:
        return "You have a balanced personality profile with moderate scores across all traits."

    summary = f"Your reading personality shows that you are {', '.join(dominant_traits)}. "

    # Add reading-specific insights
    if profile.openness > 0.7:
        summary += "You're likely to enjoy experimental and diverse literature. "
    if profile.conscientiousness > 0.7:
        summary += "You prefer structured, informative content and are likely to finish books you start. "
    if profile.extraversion > 0.7:
        summary += "You enjoy books that you can discuss with others and prefer socially relevant themes. "

    return summary
