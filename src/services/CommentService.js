// Comment service for Taskify
import { Comment } from '../models/Comment.js';
import { DatabaseService } from './DatabaseService.js';

export class CommentService {
  constructor(databaseService) {
    this.db = databaseService;
  }

  // Create comment
  async createComment(commentData) {
    const comment = new Comment(commentData);
    const errors = comment.validate();

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const result = await this.db.run(
      'INSERT INTO comments (content, task_id, author_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [
        comment.content,
        comment.taskId,
        comment.authorId,
        comment.createdAt,
        comment.updatedAt,
      ]
    );

    comment.id = result.id;
    return comment;
  }

  // Get comment by ID
  async getCommentById(id) {
    const row = await this.db.get(
      `
      SELECT c.*, u.name as author_name, u.color as author_color
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = ? AND c.is_active = 1
    `,
      [id]
    );

    if (!row) {
      return null;
    }

    return this.mapRowToComment(row);
  }

  // Get comments by task
  async getCommentsByTask(taskId) {
    const rows = await this.db.all(
      `
      SELECT c.*, u.name as author_name, u.color as author_color
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.task_id = ? AND c.is_active = 1
      ORDER BY c.created_at ASC
    `,
      [taskId]
    );

    return rows.map(row => this.mapRowToComment(row));
  }

  // Get comments by author
  async getCommentsByAuthor(authorId) {
    const rows = await this.db.all(
      `
      SELECT c.*, u.name as author_name, u.color as author_color
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.author_id = ? AND c.is_active = 1
      ORDER BY c.created_at DESC
    `,
      [authorId]
    );

    return rows.map(row => this.mapRowToComment(row));
  }

  // Get all comments
  async getAllComments() {
    const rows = await this.db.all(`
      SELECT c.*, u.name as author_name, u.color as author_color
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.is_active = 1
      ORDER BY c.created_at DESC
    `);

    return rows.map(row => this.mapRowToComment(row));
  }

  // Update comment
  async updateComment(id, commentData) {
    const existingComment = await this.getCommentById(id);
    if (!existingComment) {
      throw new Error('Comment not found');
    }

    const updatedComment = new Comment({ ...existingComment, ...commentData });
    const errors = updatedComment.validate();

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    updatedComment.updatedAt = new Date().toISOString();

    await this.db.run(
      'UPDATE comments SET content = ?, updated_at = ? WHERE id = ?',
      [updatedComment.content, updatedComment.updatedAt, id]
    );

    return updatedComment;
  }

  // Delete comment (soft delete)
  async deleteComment(id) {
    const comment = await this.getCommentById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }

    await this.db.run('UPDATE comments SET is_active = 0 WHERE id = ?', [id]);

    return true;
  }

  // Hard delete comment
  async hardDeleteComment(id) {
    await this.db.run('DELETE FROM comments WHERE id = ?', [id]);
    return true;
  }

  // Check if comment exists
  async commentExists(id) {
    const comment = await this.getCommentById(id);
    return comment !== null;
  }

  // Get comment count by task
  async getCommentCountByTask(taskId) {
    const result = await this.db.get(
      'SELECT COUNT(*) as count FROM comments WHERE task_id = ? AND is_active = 1',
      [taskId]
    );

    return result.count;
  }

  // Get comment count by author
  async getCommentCountByAuthor(authorId) {
    const result = await this.db.get(
      'SELECT COUNT(*) as count FROM comments WHERE author_id = ? AND is_active = 1',
      [authorId]
    );

    return result.count;
  }

  // Search comments
  async searchComments(query) {
    const rows = await this.db.all(
      `
      SELECT c.*, u.name as author_name, u.color as author_color
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.content LIKE ? AND c.is_active = 1
      ORDER BY c.created_at DESC
    `,
      [`%${query}%`]
    );

    return rows.map(row => this.mapRowToComment(row));
  }

  // Get recent comments
  async getRecentComments(limit = 10) {
    const rows = await this.db.all(
      `
      SELECT c.*, u.name as author_name, u.color as author_color
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.is_active = 1
      ORDER BY c.created_at DESC
      LIMIT ?
    `,
      [limit]
    );

    return rows.map(row => this.mapRowToComment(row));
  }

  // Get comments by date range
  async getCommentsByDateRange(startDate, endDate) {
    const rows = await this.db.all(
      `
      SELECT c.*, u.name as author_name, u.color as author_color
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.created_at BETWEEN ? AND ? AND c.is_active = 1
      ORDER BY c.created_at DESC
    `,
      [startDate, endDate]
    );

    return rows.map(row => this.mapRowToComment(row));
  }

  // Get comment statistics
  async getCommentStatistics() {
    const totalComments = await this.db.get(
      'SELECT COUNT(*) as count FROM comments WHERE is_active = 1'
    );

    const commentsToday = await this.db.get(`
      SELECT COUNT(*) as count 
      FROM comments 
      WHERE DATE(created_at) = DATE('now') AND is_active = 1
    `);

    const commentsThisWeek = await this.db.get(`
      SELECT COUNT(*) as count 
      FROM comments 
      WHERE created_at >= DATE('now', '-7 days') AND is_active = 1
    `);

    return {
      totalComments: totalComments.count,
      commentsToday: commentsToday.count,
      commentsThisWeek: commentsThisWeek.count,
    };
  }

  // Helper method to map database row to Comment object
  mapRowToComment(row) {
    return new Comment({
      id: row.id,
      content: row.content,
      taskId: row.task_id,
      authorId: row.author_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: row.is_active === 1,
      authorName: row.author_name,
      authorColor: row.author_color,
    });
  }

  // Validation helpers
  validateCommentData(commentData) {
    const comment = new Comment(commentData);
    return comment.validate();
  }

  // Utility methods
  async getActiveComments() {
    return this.getAllComments();
  }

  async getInactiveComments() {
    const rows = await this.db.all(`
      SELECT c.*, u.name as author_name, u.color as author_color
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.is_active = 0
      ORDER BY c.created_at DESC
    `);

    return rows.map(row => this.mapRowToComment(row));
  }

  async restoreComment(id) {
    await this.db.run('UPDATE comments SET is_active = 1 WHERE id = ?', [id]);

    return this.getCommentById(id);
  }

  // Get comments with pagination
  async getCommentsWithPagination(taskId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const rows = await this.db.all(
      `
      SELECT c.*, u.name as author_name, u.color as author_color
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.task_id = ? AND c.is_active = 1
      ORDER BY c.created_at ASC
      LIMIT ? OFFSET ?
    `,
      [taskId, limit, offset]
    );

    const totalCount = await this.getCommentCountByTask(taskId);

    return {
      comments: rows.map(row => this.mapRowToComment(row)),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    };
  }
}
