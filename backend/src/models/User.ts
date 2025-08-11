// backend/src/models/User.ts
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, CreateUserData, TokenPair } from '../types/index.js';

export class UserModel {
  constructor(private db: Pool) {}

  async createUser(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const query = `
      INSERT INTO users (email, password_hash, username, full_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, username, full_name, created_at
    `;
    const result = await this.db.query(query, [
      userData.email,
      hashedPassword,
      userData.username,
      userData.fullName
    ]);
    return result.rows[0];
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.query(query, [email]);

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name
    };
  }

  generateTokens(userId: string): TokenPair {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    return { accessToken, refreshToken };
  }

  async getUserById(userId: string): Promise<User | null> {
    const query = 'SELECT id, email, username, full_name, created_at FROM users WHERE id = $1';
    const result = await this.db.query(query, [userId]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      createdAt: user.created_at
    };
  }

  async updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.email !== undefined) {
      setClause.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }
    if (updates.username !== undefined) {
      setClause.push(`username = $${paramCount++}`);
      values.push(updates.username);
    }
    if (updates.fullName !== undefined) {
      setClause.push(`full_name = $${paramCount++}`);
      values.push(updates.fullName);
    }

    if (setClause.length === 0) return null;

    setClause.push(`updated_at = NOW()`);

    const query = `
      UPDATE users 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, username, full_name, created_at, updated_at
    `;
    
    values.push(userId);
    
    const result = await this.db.query(query, values);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      createdAt: user.created_at
    };
  }
}
