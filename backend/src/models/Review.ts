// backend/src/models/Review.ts
import { Pool } from 'pg';

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  title?: string;
  content: string;
  spoilerWarning: boolean;
  helpfulVotes: number;
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    username: string;
    avatar?: string;
  };
}

export class ReviewModel {
  constructor(private db: Pool) {}

  async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpfulVotes' | 'totalVotes'>): Promise<Review> {
    const query = `
      INSERT INTO reviews (user_id, book_id, rating, title, content, spoiler_warning)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      reviewData.userId,
      reviewData.bookId,
      reviewData.rating,
      reviewData.title,
      reviewData.content,
      reviewData.spoilerWarning
    ]);

    return result.rows[0];
  }

  async getBookReviews(bookId: string, page: number = 1, limit: number = 10): Promise<Review[]> {
    const offset = (page - 1) * limit;

    const query = `
      SELECT
        r.*,
        u.username,
        u.avatar_url as avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = $1
      ORDER BY r.helpful_votes DESC, r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await this.db.query(query, [bookId, limit, offset]);

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      bookId: row.book_id,
      rating: row.rating,
      title: row.title,
      content: row.content,
      spoilerWarning: row.spoiler_warning,
      helpfulVotes: row.helpful_votes,
      totalVotes: row.total_votes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        username: row.username,
        avatar: row.avatar
      }
    }));
  }

  async voteOnReview(reviewId: string, userId: string, isHelpful: boolean): Promise<void> {
    // Check if user already voted
    const existingVote = await this.db.query(
      'SELECT * FROM review_votes WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (existingVote.rows.length > 0) {
      // Update existing vote
      await this.db.query(
        'UPDATE review_votes SET is_helpful = $1 WHERE review_id = $2 AND user_id = $3',
        [isHelpful, reviewId, userId]
      );
    } else {
      // Create new vote
      await this.db.query(
        'INSERT INTO review_votes (review_id, user_id, is_helpful) VALUES ($1, $2, $3)',
        [reviewId, userId, isHelpful]
      );
    }

    // Update review vote counts
    await this.updateReviewVoteCounts(reviewId);
  }

  private async updateReviewVoteCounts(reviewId: string): Promise<void> {
    const query = `
      UPDATE reviews
      SET
        helpful_votes = (
          SELECT COUNT(*) FROM review_votes
          WHERE review_id = $1 AND is_helpful = true
        ),
        total_votes = (
          SELECT COUNT(*) FROM review_votes
          WHERE review_id = $1
        )
      WHERE id = $1
    `;

    await this.db.query(query, [reviewId]);
  }

  async getReviewAnalytics(bookId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const query = `
      SELECT
        AVG(rating) as average_rating,
        COUNT(*) as total_reviews,
        rating,
        COUNT(*) as count
      FROM reviews
      WHERE book_id = $1
      GROUP BY rating
    `;

    const result = await this.db.query(query, [bookId]);

    const ratingDistribution: { [key: number]: number } = {};
    let totalReviews = 0;
    let weightedSum = 0;

    result.rows.forEach(row => {
      const rating = parseInt(row.rating);
      const count = parseInt(row.count);
      ratingDistribution[rating] = count;
      totalReviews += count;
      weightedSum += rating * count;
    });

    return {
      averageRating: totalReviews > 0 ? weightedSum / totalReviews : 0,
      totalReviews,
      ratingDistribution
    };
  }
}
