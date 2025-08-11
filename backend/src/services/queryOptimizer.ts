export class QueryOptimizer {
    constructor(private db: Pool) {}
  
    async getOptimizedBookSearch(searchParams: {
      query?: string;
      genre?: string;
      author?: string;
      rating?: number;
      sortBy?: string;
      limit?: number;
      offset?: number;
    }) {
      const {
        query,
        genre,
        author,
        rating,
        sortBy = 'relevance',
        limit = 20,
        offset = 0
      } = searchParams;
  
      let baseQuery = `
        SELECT
          b.*,
          AVG(r.rating) as average_rating,
          COUNT(r.id) as review_count,
          COUNT(ul.id) as library_count
        FROM books b
        LEFT JOIN reviews r ON b.id = r.book_id
        LEFT JOIN user_library ul ON b.id = ul.book_id
      `;
  
      const conditions: string[] = ['b.is_public = true'];
      const params: any[] = [];
      let paramIndex = 1;
  
      // Full-text search
      if (query) {
        conditions.push(`(
          to_tsvector('english', b.title) @@ plainto_tsquery('english', $${paramIndex}) OR
          to_tsvector('english', b.author) @@ plainto_tsquery('english', $${paramIndex}) OR
          to_tsvector('english', b.description) @@ plainto_tsquery('english', $${paramIndex})
        )`);
        params.push(query);
        paramIndex++;
      }
  
      // Genre filter
      if (genre && genre !== 'all') {
        conditions.push(`b.genre = $${paramIndex}`);
        params.push(genre);
        paramIndex++;
      }
  
      // Author filter
      if (author) {
        conditions.push(`b.author ILIKE $${paramIndex}`);
        params.push(`%${author}%`);
        paramIndex++;
      }
  
      // Rating filter
      if (rating) {
        conditions.push(`AVG(r.rating) >= $${paramIndex}`);
        params.push(rating);
        paramIndex++;
      }
  
      // Add WHERE clause
      if (conditions.length > 0) {
        baseQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
  
      // Add GROUP BY
      baseQuery += ` GROUP BY b.id`;
  
      // Add ORDER BY
      switch (sortBy) {
        case 'rating':
          baseQuery += ` ORDER BY average_rating DESC NULLS LAST, review_count DESC`;
          break;
        case 'popularity':
          baseQuery += ` ORDER BY library_count DESC, review_count DESC`;
          break;
        case 'recent':
          baseQuery += ` ORDER BY b.created_at DESC`;
          break;
        case 'title':
          baseQuery += ` ORDER BY b.title ASC`;
          break;
        default: // relevance
          if (query) {
            baseQuery += ` ORDER BY ts_rank(to_tsvector('english', b.title || ' ' || b.author || ' ' || b.description), plainto_tsquery('english', $1)) DESC`;
          } else {
            baseQuery += ` ORDER BY b.created_at DESC`;
          }
      }
  
      // Add pagination
      baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
  
      try {
        const result = await this.db.query(baseQuery, params);
        return result.rows;
      } catch (error) {
        console.error('Optimized search query failed:', error);
        throw error;
      }
    }
  
    async getPersonalizedRecommendations(userId: string, limit: number = 10) {
      // Optimized query using CTEs and proper indexing
      const query = `
        WITH user_preferences AS (
          SELECT
            genre,
            COUNT(*) as genre_count,
            AVG(rating) as avg_rating
          FROM user_library ul
          JOIN books b ON ul.book_id = b.id
          WHERE ul.user_id = $1 AND ul.rating IS NOT NULL
          GROUP BY genre
        ),
        similar_users AS (
          SELECT
            ul2.user_id,
            COUNT(*) as common_books
          FROM user_library ul1
          JOIN user_library ul2 ON ul1.book_id = ul2.book_id
          WHERE ul1.user_id = $1
            AND ul2.user_id != $1
            AND ul1.rating >= 4
            AND ul2.rating >= 4
          GROUP BY ul2.user_id
          HAVING COUNT(*) >= 3
          ORDER BY common_books DESC
          LIMIT 50
        )
        SELECT DISTINCT
          b.*,
          AVG(r.rating) as average_rating,
          COUNT(r.id) as review_count,
          up.avg_rating as genre_preference_score
        FROM books b
        JOIN reviews r ON b.id = r.book_id
        JOIN user_preferences up ON b.genre = up.genre
        JOIN user_library ul ON b.id = ul.book_id
        JOIN similar_users su ON ul.user_id = su.user_id
        WHERE b.id NOT IN (
          SELECT book_id FROM user_library WHERE user_id = $1
        )
        AND ul.rating >= 4
        GROUP BY b.id, up.avg_rating
        HAVING AVG(r.rating) >= 4.0
        ORDER BY
          up.avg_rating DESC,
          AVG(r.rating) DESC,
          COUNT(r.id) DESC
        LIMIT $2
      `;
  
      try {
        const result = await this.db.query(query, [userId, limit]);
        return result.rows;
      } catch (error) {
        console.error('Personalized recommendations query failed:', error);
        throw error;
      }
    }
  }
  