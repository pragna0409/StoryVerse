import { Pool } from 'pg';

export class DatabaseOptimizer {
  constructor(private db: Pool) {}

  async createIndexes() {
    const indexes = [
      // Books table indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_genre ON books(genre)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_author ON books(author)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_title_search ON books USING gin(to_tsvector(\\'english\\', title))',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_created_at ON books(created_at DESC)',

      // Reviews table indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_book_id ON reviews(book_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating ON reviews(rating)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_helpful_votes ON reviews(helpful_votes DESC)',

      // User library indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_library_user_id ON user_library(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_library_status ON user_library(status)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_library_progress ON user_library(progress)',

      // Reading sessions indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_sessions_book_id ON reading_sessions(book_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_sessions_start_time ON reading_sessions(start_time DESC)',

      // Generated stories indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_stories_user_id ON generated_stories(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_stories_genre ON generated_stories(genre)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_generated_stories_created_at ON generated_stories(created_at DESC)'
    ];

    for (const indexQuery of indexes) {
      try {
        await this.db.query(indexQuery);
        console.log(`Created index: ${indexQuery.split(' ')[5]}`);
      } catch (error) {
        console.error(`Failed to create index: ${indexQuery}`, error);
      }
    }
  }

  async optimizeQueries() {
    // Analyze table statistics
    const tables = [
      'books', 'reviews', 'user_library', 'reading_sessions',
      'generated_stories', 'users', 'bookmarks'
    ];

    for (const table of tables) {
      try {
        await this.db.query(`ANALYZE ${table}`);
        console.log(`Analyzed table: ${table}`);
      } catch (error) {
        console.error(`Failed to analyze table: ${table}`, error);
      }
    }
  }

  async getSlowQueries() {
    const query = `
      SELECT
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements
      WHERE mean_time > 100
      ORDER BY mean_time DESC
      LIMIT 10
    `;

    try {
      const result = await this.db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Failed to get slow queries:', error);
      return [];
    }
  }
}







