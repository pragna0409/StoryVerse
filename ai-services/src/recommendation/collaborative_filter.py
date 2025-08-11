# ai-services/src/recommendation/collaborative_filter.py
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from typing import List, Dict, Tuple
import asyncio

class CollaborativeFilter:
    def __init__(self, n_components: int = 50):
        self.n_components = n_components
        self.svd = TruncatedSVD(n_components=n_components, random_state=42)
        self.user_item_matrix = None
        self.user_similarity = None
        self.item_similarity = None

    async def train(self, ratings_data: pd.DataFrame):
        """
        Train the collaborative filtering model
        ratings_data: DataFrame with columns [user_id, book_id, rating]
        """
        # Create user-item matrix
        self.user_item_matrix = ratings_data.pivot(
            index='user_id',
            columns='book_id',
            values='rating'
        ).fillna(0)

        # Apply SVD for dimensionality reduction
        user_factors = self.svd.fit_transform(self.user_item_matrix)
        item_factors = self.svd.components_.T

        # Calculate similarities
        self.user_similarity = cosine_similarity(user_factors)
        self.item_similarity = cosine_similarity(item_factors)

    async def get_user_recommendations(
        self,
        user_id: str,
        n_recommendations: int = 10
    ) -> List[Dict]:
        """
        Get book recommendations for a specific user
        """
        if self.user_item_matrix is None:
            raise ValueError("Model not trained yet")

        user_idx = self.user_item_matrix.index.get_loc(user_id)
        user_ratings = self.user_item_matrix.iloc[user_idx]

        # Find similar users
        similar_users = self.get_similar_users(user_idx, top_k=50)

        # Get recommendations based on similar users' preferences
        recommendations = []
        for book_id in self.user_item_matrix.columns:
            if user_ratings[book_id] == 0:  # User hasn't rated this book
                predicted_rating = self.predict_rating(user_idx, book_id, similar_users)
                recommendations.append({
                    'book_id': book_id,
                    'predicted_rating': predicted_rating,
                    'recommendation_type': 'collaborative'
                })

        # Sort by predicted rating and return top N
        recommendations.sort(key=lambda x: x['predicted_rating'], reverse=True)
        return recommendations[:n_recommendations]

    def get_similar_users(self, user_idx: int, top_k: int = 50) -> List[Tuple[int, float]]:
        """
        Find users similar to the given user
        """
        similarities = self.user_similarity[user_idx]
        similar_indices = np.argsort(similarities)[::-1][1:top_k+1]  # Exclude self
        return [(idx, similarities[idx]) for idx in similar_indices]

    def predict_rating(
        self,
        user_idx: int,
        book_id: str,
        similar_users: List[Tuple[int, float]]
    ) -> float:
        """
        Predict rating for a book based on similar users
        """
        weighted_sum = 0
        similarity_sum = 0

        for similar_user_idx, similarity in similar_users:
            rating = self.user_item_matrix.iloc[similar_user_idx][book_id]
            if rating > 0:  # User has rated this book
                weighted_sum += similarity * rating
                similarity_sum += abs(similarity)

        if similarity_sum == 0:
            return 0

        return weighted_sum / similarity_sum

# Content-based filtering
class ContentBasedFilter:
    def __init__(self):
        self.book_features = None
        self.tfidf_vectorizer = None
        self.content_similarity = None

    async def train(self, books_data: pd.DataFrame):
        """
        Train content-based model using book features
        books_data: DataFrame with columns [book_id, title, author, genre, description]
        """
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.preprocessing import MultiLabelBinarizer

        # Combine text features
        books_data['combined_features'] = (
            books_data['title'].fillna('') + ' ' +
            books_data['author'].fillna('') + ' ' +
            books_data['genre'].fillna('') + ' ' +
            books_data['description'].fillna('')
        )

        # Create TF-IDF vectors
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )

        tfidf_matrix = self.tfidf_vectorizer.fit_transform(books_data['combined_features'])

        # Calculate content similarity
        self.content_similarity = cosine_similarity(tfidf_matrix)
        self.book_features = books_data.set_index('book_id')

    async def get_content_recommendations(
        self,
        user_profile: Dict,
        n_recommendations: int = 10
    ) -> List[Dict]:
        """
        Get recommendations based on user's content preferences
        """
        # Analyze user's reading history to build preference profile
        preferred_genres = user_profile.get('preferred_genres', [])
        favorite_authors = user_profile.get('favorite_authors', [])
        reading_history = user_profile.get('reading_history', [])

        # Score books based on content similarity to user preferences
        recommendations = []

        for book_id, book_data in self.book_features.iterrows():
            if book_id not in reading_history:
                score = self.calculate_content_score(book_data, user_profile)
                recommendations.append({
                    'book_id': book_id,
                    'content_score': score,
                    'recommendation_type': 'content_based'
                })

        recommendations.sort(key=lambda x: x['content_score'], reverse=True)
        return recommendations[:n_recommendations]

    def calculate_content_score(self, book_data: pd.Series, user_profile: Dict) -> float:
        """
        Calculate content-based score for a book
        """
        score = 0

        # Genre preference
        if book_data['genre'] in user_profile.get('preferred_genres', []):
            score += 0.4

        # Author preference
        if book_data['author'] in user_profile.get('favorite_authors', []):
            score += 0.3

        # Similarity to previously liked books
        reading_history = user_profile.get('reading_history', [])
        if reading_history:
            book_idx = self.book_features.index.get_loc(book_data.name)
            max_similarity = 0

            for read_book_id in reading_history:
                if read_book_id in self.book_features.index:
                    read_book_idx = self.book_features.index.get_loc(read_book_id)
                    similarity = self.content_similarity[book_idx][read_book_idx]
                    max_similarity = max(max_similarity, similarity)

            score += 0.3 * max_similarity

        return score

# Hybrid recommendation system
class HybridRecommendationEngine:
    def __init__(self):
        self.collaborative_filter = CollaborativeFilter()
        self.content_filter = ContentBasedFilter()
        self.social_analyzer = SocialMediaAnalyzer()

    async def get_recommendations(
        self,
        user_id: str,
        user_profile: Dict,
        n_recommendations: int = 10
    ) -> List[Dict]:
        """
        Combine multiple recommendation approaches
        """
        # Get recommendations from different algorithms
        collab_recs = await self.collaborative_filter.get_user_recommendations(
            user_id, n_recommendations * 2
        )

        content_recs = await self.content_filter.get_content_recommendations(
            user_profile, n_recommendations * 2
        )

        social_recs = await self.social_analyzer.get_social_recommendations(
            user_profile, n_recommendations * 2
        )

        # Combine and weight recommendations
        combined_recs = self.combine_recommendations(
            collab_recs, content_recs, social_recs
        )

        return combined_recs[:n_recommendations]

    def combine_recommendations(
        self,
        collab_recs: List[Dict],
        content_recs: List[Dict],
        social_recs: List[Dict]
    ) -> List[Dict]:
        """
        Combine recommendations using weighted scoring
        """
        book_scores = {}

        # Weight collaborative filtering (40%)
        for rec in collab_recs:
            book_id = rec['book_id']
            book_scores[book_id] = book_scores.get(book_id, 0) + 0.4 * rec['predicted_rating']

        # Weight content-based (35%)
        for rec in content_recs:
            book_id = rec['book_id']
            book_scores[book_id] = book_scores.get(book_id, 0) + 0.35 * rec['content_score']

        # Weight social recommendations (25%)
        for rec in social_recs:
            book_id = rec['book_id']
            book_scores[book_id] = book_scores.get(book_id, 0) + 0.25 * rec['social_score']

        # Convert to list and sort
        final_recommendations = [
            {
                'book_id': book_id,
                'combined_score': score,
                'recommendation_type': 'hybrid'
            }
            for book_id, score in book_scores.items()
        ]

        final_recommendations.sort(key=lambda x: x['combined_score'], reverse=True)
        return final_recommendations
