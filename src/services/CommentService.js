// Comment service for Taskify
import { Comment } from '../models/Comment.js';

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

    const commentDataToStore = {
      content: comment.content,
      task_id: comment.taskId,
      author_id: comment.authorId,
      created_at: comment.createdAt,
      updated_at: comment.updatedAt,
      is_active: 1
    };

    const id = await this.db.add('comments', commentDataToStore);
    comment.id = id;
    return comment;
  }

  // Get comment by ID
  async getCommentById(id) {
    const row = await this.db.get('comments', id);
    if (!row) return null;

    return new Comment({
      id: row.id,
      content: row.content,
      taskId: row.task_id,
      authorId: row.author_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: row.is_active === 1
    });
  }

  // Get all comments
  async getAllComments() {
    const rows = await this.db.getAll('comments');
    return rows
      .filter(row => row.is_active === 1)
      .map(row => new Comment({
        id: row.id,
        content: row.content,
        taskId: row.task_id,
        authorId: row.author_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isActive: row.is_active === 1
      }));
  }

  // Get comments by task
  async getCommentsByTask(taskId) {
    const rows = await this.db.getAllByIndex('comments', 'task_id', taskId);
    return rows
      .filter(row => row.is_active === 1)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(row => new Comment({
        id: row.id,
        content: row.content,
        taskId: row.task_id,
        authorId: row.author_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isActive: row.is_active === 1
      }));
  }

  // Get comments by author
  async getCommentsByAuthor(authorId) {
    const rows = await this.db.getAllByIndex('comments', 'author_id', authorId);
    return rows
      .filter(row => row.is_active === 1)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(row => new Comment({
        id: row.id,
        content: row.content,
        taskId: row.task_id,
        authorId: row.author_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isActive: row.is_active === 1
      }));
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

    const commentDataToStore = {
      id: id,
      content: updatedComment.content,
      task_id: updatedComment.taskId,
      author_id: updatedComment.authorId,
      created_at: updatedComment.createdAt,
      updated_at: new Date().toISOString(),
      is_active: updatedComment.isActive ? 1 : 0
    };

    await this.db.update('comments', commentDataToStore);
    return updatedComment;
  }

  // Delete comment (soft delete)
  async deleteComment(id) {
    const comment = await this.getCommentById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const commentDataToStore = {
      id: id,
      content: comment.content,
      task_id: comment.taskId,
      author_id: comment.authorId,
      created_at: comment.createdAt,
      updated_at: new Date().toISOString(),
      is_active: 0
    };

    await this.db.update('comments', commentDataToStore);
    return true;
  }

  // Get comment statistics
  async getCommentStats() {
    const comments = await this.getAllComments();
    const totalComments = comments.length;
    const recentComments = comments.filter(c => {
      const commentDate = new Date(c.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return commentDate > weekAgo;
    }).length;

    return {
      totalComments,
      recentComments,
      averageCommentsPerTask: totalComments > 0 ? totalComments / new Set(comments.map(c => c.taskId)).size : 0
    };
  }

  // Search comments
  async searchComments(query) {
    const comments = await this.getAllComments();
    const lowercaseQuery = query.toLowerCase();

    return comments.filter(comment =>
      comment.content.toLowerCase().includes(lowercaseQuery)
    );
  }
}