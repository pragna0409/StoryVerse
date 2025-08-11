// backend/src/services/readingProgressService.ts
export class ReadingProgressService {
    async updateProgress(userId: string, bookId: string, progressData: ProgressUpdate) {
      const query = `
        INSERT INTO reading_sessions (user_id, book_id, start_time, end_time, pages_read, words_read)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, book_id)
        DO UPDATE SET
          end_time = $4,
          pages_read = reading_sessions.pages_read + $5,
          words_read = reading_sessions.words_read + $6,
          updated_at = NOW()
      `;
  
      await this.db.query(query, [
        userId, bookId, progressData.startTime, progressData.endTime,
        progressData.pagesRead, progressData.wordsRead
      ]);
  
      // Update overall progress in user_library
      await this.updateLibraryProgress(userId, bookId, progressData.percentage);
    }
  
    async getReadingStats(userId: string): Promise<ReadingStats> {
      const query = `
        SELECT
          COUNT(*) as total_books,
          SUM(pages_read) as total_pages,
          SUM(EXTRACT(EPOCH FROM (end_time - start_time))/60) as total_minutes,
          AVG(pages_read / NULLIF(EXTRACT(EPOCH FROM (end_time - start_time))/60, 0)) as avg_reading_speed
        FROM reading_sessions
        WHERE user_id = $1 AND end_time IS NOT NULL
      `;
  
      const result = await this.db.query(query, [userId]);
      return result.rows[0];
    }
  }
  