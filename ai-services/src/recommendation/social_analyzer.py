# ai-services/src/recommendation/social_analyzer.py
import requests
import asyncio
from typing import Dict, List, Any
import cv2
import numpy as np
from PIL import Image
import io
import colorsys

class PinterestAnalyzer:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret

    async def analyze_pinterest_boards(self, access_token: str) -> Dict[str, Any]:
        """
        Analyze user's Pinterest boards to extract reading preferences
        """
        boards = await self.get_user_boards(access_token)
        analysis_results = {
            'color_preferences': [],
            'aesthetic_themes': [],
            'interest_keywords': [],
            'mood_profile': {},
            'genre_indicators': []
        }

        for board in boards:
            board_analysis = await self.analyze_board(board, access_token)

            # Aggregate color preferences
            analysis_results['color_preferences'].extend(board_analysis['colors'])

            # Extract themes
            analysis_results['aesthetic_themes'].extend(board_analysis['themes'])

            # Collect keywords
            analysis_results['interest_keywords'].extend(board_analysis['keywords'])

            # Analyze mood
            mood = board_analysis['mood']
            for mood_type, score in mood.items():
                analysis_results['mood_profile'][mood_type] = (
                    analysis_results['mood_profile'].get(mood_type, 0) + score
                )

        # Normalize mood scores
        total_boards = len(boards)
        if total_boards > 0:
            for mood_type in analysis_results['mood_profile']:
                analysis_results['mood_profile'][mood_type] /= total_boards

        # Map to book genres
        analysis_results['genre_indicators'] = self.map_to_book_genres(analysis_results)

        return analysis_results

    async def get_user_boards(self, access_token: str) -> List[Dict]:
        """
        Fetch user's Pinterest boards
        """
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(
            '<https://api.pinterest.com/v5/boards>',
            headers=headers
        )

        if response.status_code == 200:
            return response.json().get('items', [])
        return []

    async def analyze_board(self, board: Dict, access_token: str) -> Dict[str, Any]:
        """
        Analyze individual Pinterest board
        """
        pins = await self.get_board_pins(board['id'], access_token)

        colors = []
        themes = []
        keywords = []
        mood_scores = {'romantic': 0, 'dark': 0, 'bright': 0, 'minimalist': 0}

        for pin in pins[:20]:  # Analyze first 20 pins
            if pin.get('media', {}).get('images'):
                image_url = pin['media']['images']['original']['url']

                # Analyze image colors
                pin_colors = await self.extract_colors_from_image(image_url)
                colors.extend(pin_colors)

                # Analyze mood from colors and composition
                pin_mood = self.analyze_image_mood(pin_colors)
                for mood_type, score in pin_mood.items():
                    mood_scores[mood_type] += score

            # Extract keywords from description
            description = pin.get('description', '') + ' ' + pin.get('title', '')
            pin_keywords = self.extract_keywords(description)
            keywords.extend(pin_keywords)

        # Normalize mood scores
        total_pins = len(pins)
        if total_pins > 0:
            for mood_type in mood_scores:
                mood_scores[mood_type] /= total_pins

        return {
            'colors': colors,
            'themes': themes,
            'keywords': keywords,
            'mood': mood_scores
        }

    async def extract_colors_from_image(self, image_url: str) -> List[str]:
        """
        Extract dominant colors from Pinterest image
        """
        try:
            response = requests.get(image_url)
            image = Image.open(io.BytesIO(response.content))
            image = image.convert('RGB')

            # Resize for faster processing
            image = image.resize((150, 150))

            # Convert to numpy array
            img_array = np.array(image)

            # Reshape to list of pixels
            pixels = img_array.reshape(-1, 3)

            # Use k-means clustering to find dominant colors
            from sklearn.cluster import KMeans
            kmeans = KMeans(n_clusters=5, random_state=42)
            kmeans.fit(pixels)

            # Convert colors to hex
            dominant_colors = []
            for color in kmeans.cluster_centers_:
                hex_color = '#{:02x}{:02x}{:02x}'.format(
                    int(color[0]), int(color[1]), int(color[2])
                )
                dominant_colors.append(hex_color)

            return dominant_colors

        except Exception as e:
            print(f"Error extracting colors: {e}")
            return []

    def analyze_image_mood(self, colors: List[str]) -> Dict[str, float]:
        """
        Analyze mood based on color palette
        """
        mood_scores = {'romantic': 0, 'dark': 0, 'bright': 0, 'minimalist': 0}

        for hex_color in colors:
            # Convert hex to RGB
            rgb = tuple(int(hex_color[i:i+2], 16) for i in (1, 3, 5))

            # Convert to HSV for better analysis
            hsv = colorsys.rgb_to_hsv(rgb[0]/255, rgb[1]/255, rgb[2]/255)
            hue, saturation, value = hsv

            # Analyze mood based on HSV values
            if saturation < 0.3 and value > 0.8:  # Light, desaturated
                mood_scores['minimalist'] += 1
            elif value < 0.3:  # Dark colors
                mood_scores['dark'] += 1
            elif saturation > 0.7 and value > 0.7:  # Bright, saturated
                mood_scores['bright'] += 1
            elif 0.8 < hue < 1.0 or 0.0 < hue < 0.1:  # Pink/red hues
                mood_scores['romantic'] += 1

        # Normalize scores
        total_colors = len(colors)
        if total_colors > 0:
            for mood in mood_scores:
                mood_scores[mood] /= total_colors

        return mood_scores

    def map_to_book_genres(self, analysis: Dict[str, Any]) -> List[str]:
        """
        Map Pinterest analysis to book genres
        """
        genre_mapping = []

        # Mood-based mapping
        mood_profile = analysis['mood_profile']

        if mood_profile.get('romantic', 0) > 0.3:
            genre_mapping.append('Romance')

        if mood_profile.get('dark', 0) > 0.4:
            genre_mapping.extend(['Horror', 'Mystery', 'Thriller'])

        if mood_profile.get('bright', 0) > 0.4:
            genre_mapping.extend(['Comedy', 'Adventure'])

        if mood_profile.get('minimalist', 0) > 0.3:
            genre_mapping.extend(['Literary Fiction', 'Philosophy'])

        # Keyword-based mapping
        keywords = analysis['interest_keywords']
        keyword_genre_map = {
            'vintage': ['Historical Fiction'],
            'nature': ['Adventure', 'Environmental'],
            'travel': ['Adventure', 'Travel'],
            'art': ['Art', 'Biography'],
            'fashion': ['Contemporary Fiction'],
            'food': ['Cooking', 'Memoir'],
            'quotes': ['Poetry', 'Philosophy']
        }

        for keyword in keywords:
            for key, genres in keyword_genre_map.items():
                if key in keyword.lower():
                    genre_mapping.extend(genres)

        return list(set(genre_mapping))  # Remove duplicates

class SpotifyAnalyzer:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret

    async def analyze_spotify_preferences(self, access_token: str) -> Dict[str, Any]:
        """
        Analyze Spotify listening habits for book recommendations
        """
        playlists = await self.get_user_playlists(access_token)
        top_tracks = await self.get_user_top_tracks(access_token)

        analysis = {
            'genre_preferences': {},
            'mood_profile': {},
            'energy_level': 0,
            'complexity_preference': 0,
            'book_genre_mapping': []
        }

        all_tracks = []

        # Analyze playlists
        for playlist in playlists:
            tracks = await self.get_playlist_tracks(playlist['id'], access_token)
            all_tracks.extend(tracks)

        # Add top tracks
        all_tracks.extend(top_tracks)

        # Analyze audio features
        for track in all_tracks:
            audio_features = await self.get_audio_features(track['id'], access_token)
            if audio_features:
                self.update_analysis_with_track(analysis, track, audio_features)

        # Normalize scores
        total_tracks = len(all_tracks)
        if total_tracks > 0:
            analysis['energy_level'] /= total_tracks
            analysis['complexity_preference'] /= total_tracks

            for mood in analysis['mood_profile']:
                analysis['mood_profile'][mood] /= total_tracks

        # Map to book genres
        analysis['book_genre_mapping'] = self.map_music_to_book_genres(analysis)

        return analysis

    def update_analysis_with_track(
        self,
        analysis: Dict,
        track: Dict,
        audio_features: Dict
    ):
        """
        Update analysis with individual track data
        """
        # Energy level
        analysis['energy_level'] += audio_features.get('energy', 0)

        # Complexity (based on instrumentalness and acousticness)
        complexity = (
            audio_features.get('instrumentalness', 0) * 0.6 +
            audio_features.get('acousticness', 0) * 0.4
        )
        analysis['complexity_preference'] += complexity

        # Mood analysis
        valence = audio_features.get('valence', 0)
        energy = audio_features.get('energy', 0)

        if valence > 0.7:
            analysis['mood_profile']['happy'] = analysis['mood_profile'].get('happy', 0) + 1
        elif valence < 0.3:
            analysis['mood_profile']['melancholy'] = analysis['mood_profile'].get('melancholy', 0) + 1

        if energy > 0.7:
            analysis['mood_profile']['energetic'] = analysis['mood_profile'].get('energetic', 0) + 1
        elif energy < 0.3:
            analysis['mood_profile']['calm'] = analysis['mood_profile'].get('calm', 0) + 1

        # Genre preferences
        for artist in track.get('artists', []):
            genres = artist.get('genres', [])
            for genre in genres:
                analysis['genre_preferences'][genre] = (
                    analysis['genre_preferences'].get(genre, 0) + 1
                )

    def map_music_to_book_genres(self, analysis: Dict) -> List[str]:
        """
        Map music preferences to book genres
        """
        book_genres = []

        # Energy-based mapping
        energy = analysis['energy_level']
        if energy > 0.7:
            book_genres.extend(['Action', 'Adventure', 'Thriller'])
        elif energy < 0.3:
            book_genres.extend(['Literary Fiction', 'Poetry', 'Philosophy'])

        # Mood-based mapping
        mood_profile = analysis['mood_profile']

        if mood_profile.get('happy', 0) > 0.4:
            book_genres.extend(['Comedy', 'Romance', 'Feel-good Fiction'])

        if mood_profile.get('melancholy', 0) > 0.4:
            book_genres.extend(['Drama', 'Literary Fiction', 'Memoir'])

        if mood_profile.get('calm', 0) > 0.4:
            book_genres.extend(['Meditation', 'Nature Writing', 'Poetry'])

        # Music genre to book genre mapping
        music_genres = analysis['genre_preferences']

        genre_mapping = {
            'classical': ['Classical Literature', 'Philosophy', 'History'],
            'jazz': ['Beat Literature', 'Biography', 'Music'],
            'rock': ['Counterculture', 'Biography', 'Music'],
            'electronic': ['Science Fiction', 'Cyberpunk', 'Futurism'],
            'folk': ['Historical Fiction', 'Nature Writing', 'Americana'],
            'hip-hop': ['Urban Fiction', 'Social Commentary', 'Biography'],
            'country': ['Southern Fiction', 'Americana', 'Rural Life'],
            'indie': ['Independent Literature', 'Alternative Fiction']
        }

        for music_genre, count in music_genres.items():
            for key, book_genre_list in genre_mapping.items():
                if key in music_genre.lower():
                    book_genres.extend(book_genre_list)

        return list(set(book_genres))
