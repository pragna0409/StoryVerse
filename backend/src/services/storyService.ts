// backend/src/services/storyService.ts
import { Pool } from 'pg';
import { Story, StoryGenerationRequest, Choice, StoryMetadata } from '../types/index.js';

export class StoryService {
  constructor(private db: Pool) {}

  async createStory(storyData: {
    userId: string;
    title: string;
    genre: string;
    characters: string[];
    setting: string;
    content: string;
    choices: Choice[];
    metadata: StoryMetadata;
  }): Promise<Story> {
    const query = `
      INSERT INTO stories (
        user_id, title, genre, characters, setting, content, 
        choices, current_choices, metadata, is_public, is_completed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      storyData.userId,
      storyData.title,
      storyData.genre,
      JSON.stringify(storyData.characters),
      storyData.setting,
      storyData.content,
      JSON.stringify(storyData.choices),
      JSON.stringify(storyData.choices),
      JSON.stringify(storyData.metadata),
      false,
      false
    ]);

    return this.mapDatabaseRowToStory(result.rows[0]);
  }

  async getStory(storyId: string, userId: string): Promise<Story | null> {
    const query = `
      SELECT * FROM stories 
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await this.db.query(query, [storyId, userId]);
    
    if (result.rows.length === 0) return null;
    
    return this.mapDatabaseRowToStory(result.rows[0]);
  }

  async updateStory(storyId: string, updates: Partial<Story>): Promise<Story> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      setClause.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      setClause.push(`content = $${paramCount++}`);
      values.push(updates.content);
    }
    if (updates.choices !== undefined) {
      setClause.push(`choices = $${paramCount++}`);
      values.push(JSON.stringify(updates.choices));
    }
    if (updates.currentChoices !== undefined) {
      setClause.push(`current_choices = $${paramCount++}`);
      values.push(JSON.stringify(updates.currentChoices));
    }
    if (updates.choicesMade !== undefined) {
      setClause.push(`choices_made = $${paramCount++}`);
      values.push(JSON.stringify(updates.choicesMade));
    }
    if (updates.isPublic !== undefined) {
      setClause.push(`is_public = $${paramCount++}`);
      values.push(updates.isPublic);
    }
    if (updates.isCompleted !== undefined) {
      setClause.push(`is_completed = $${paramCount++}`);
      values.push(updates.isCompleted);
    }

    setClause.push(`updated_at = NOW()`);

    const query = `
      UPDATE stories 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    values.push(storyId);
    
    const result = await this.db.query(query, values);
    return this.mapDatabaseRowToStory(result.rows[0]);
  }

  async getUserStories(userId: string, page: number = 1, limit: number = 10): Promise<Story[]> {
    const offset = (page - 1) * limit;
    const query = `
      SELECT * FROM stories 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await this.db.query(query, [userId, limit, offset]);
    
    return result.rows.map(row => this.mapDatabaseRowToStory(row));
  }

  async getPublicStories(page: number = 1, limit: number = 10): Promise<Story[]> {
    const offset = (page - 1) * limit;
    const query = `
      SELECT s.*, u.username as author_name 
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.is_public = true 
      ORDER BY s.created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const result = await this.db.query(query, [limit, offset]);
    
    return result.rows.map(row => this.mapDatabaseRowToStory(row));
  }

  private mapDatabaseRowToStory(row: any): Story {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      genre: row.genre,
      characters: JSON.parse(row.characters || '[]'),
      setting: row.setting,
      content: row.content,
      choices: JSON.parse(row.choices || '[]'),
      currentChoices: JSON.parse(row.current_choices || '[]'),
      choicesMade: JSON.parse(row.choices_made || '[]'),
      metadata: JSON.parse(row.metadata || '{}'),
      isPublic: row.is_public,
      isCompleted: row.is_completed,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
} 