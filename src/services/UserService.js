// User service for Taskify
import { User, UserRole } from '../models/User.js';
import { DatabaseService } from './DatabaseService.js';

export class UserService {
  constructor(databaseService) {
    this.db = databaseService;
  }

  // Create user
  async createUser(userData) {
    const user = new User(userData);
    const errors = user.validate();

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const result = await this.db.run(
      'INSERT INTO users (name, role, color, created_at) VALUES (?, ?, ?, ?)',
      [user.name, user.role, user.color, user.createdAt]
    );

    user.id = result.id;
    return user;
  }

  // Get user by ID
  async getUserById(id) {
    const row = await this.db.get(
      'SELECT * FROM users WHERE id = ? AND is_active = 1',
      [id]
    );

    if (!row) {
      return null;
    }

    return this.mapRowToUser(row);
  }

  // Get user by name
  async getUserByName(name) {
    const row = await this.db.get(
      'SELECT * FROM users WHERE name = ? AND is_active = 1',
      [name]
    );

    if (!row) {
      return null;
    }

    return this.mapRowToUser(row);
  }

  // Get all users
  async getAllUsers() {
    const rows = await this.db.all(
      'SELECT * FROM users WHERE is_active = 1 ORDER BY name'
    );

    return rows.map(row => this.mapRowToUser(row));
  }

  // Get users by role
  async getUsersByRole(role) {
    const rows = await this.db.all(
      'SELECT * FROM users WHERE role = ? AND is_active = 1 ORDER BY name',
      [role]
    );

    return rows.map(row => this.mapRowToUser(row));
  }

  // Update user
  async updateUser(id, userData) {
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser = new User({ ...existingUser, ...userData });
    const errors = updatedUser.validate();

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    await this.db.run(
      'UPDATE users SET name = ?, role = ?, color = ? WHERE id = ?',
      [updatedUser.name, updatedUser.role, updatedUser.color, id]
    );

    return updatedUser;
  }

  // Delete user (soft delete)
  async deleteUser(id) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.db.run('UPDATE users SET is_active = 0 WHERE id = ?', [id]);

    return true;
  }

  // Hard delete user
  async hardDeleteUser(id) {
    await this.db.run('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }

  // Check if user exists
  async userExists(id) {
    const user = await this.getUserById(id);
    return user !== null;
  }

  // Get user count
  async getUserCount() {
    const result = await this.db.get(
      'SELECT COUNT(*) as count FROM users WHERE is_active = 1'
    );
    return result.count;
  }

  // Search users
  async searchUsers(query) {
    const rows = await this.db.all(
      'SELECT * FROM users WHERE name LIKE ? AND is_active = 1 ORDER BY name',
      [`%${query}%`]
    );

    return rows.map(row => this.mapRowToUser(row));
  }

  // Get users with task counts
  async getUsersWithTaskCounts() {
    const rows = await this.db.all(`
      SELECT 
        u.*,
        COUNT(t.id) as task_count,
        COUNT(CASE WHEN t.status = 1 THEN 1 END) as todo_count,
        COUNT(CASE WHEN t.status = 2 THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN t.status = 3 THEN 1 END) as in_review_count,
        COUNT(CASE WHEN t.status = 4 THEN 1 END) as done_count
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_user_id AND t.is_active = 1
      WHERE u.is_active = 1
      GROUP BY u.id
      ORDER BY u.name
    `);

    return rows.map(row => ({
      ...this.mapRowToUser(row),
      taskCount: row.task_count,
      todoCount: row.todo_count,
      inProgressCount: row.in_progress_count,
      inReviewCount: row.in_review_count,
      doneCount: row.done_count,
    }));
  }

  // Get user statistics
  async getUserStatistics() {
    const totalUsers = await this.getUserCount();
    const productManagers = await this.db.get(
      'SELECT COUNT(*) as count FROM users WHERE role = ? AND is_active = 1',
      [UserRole.ProductManager]
    );
    const engineers = await this.db.get(
      'SELECT COUNT(*) as count FROM users WHERE role = ? AND is_active = 1',
      [UserRole.Engineer]
    );

    return {
      totalUsers,
      productManagers: productManagers.count,
      engineers: engineers.count,
    };
  }

  // Helper method to map database row to User object
  mapRowToUser(row) {
    return new User({
      id: row.id,
      name: row.name,
      role: row.role,
      color: row.color,
      createdAt: row.created_at,
      isActive: row.is_active === 1,
    });
  }

  // Validation helpers
  validateUserData(userData) {
    const user = new User(userData);
    return user.validate();
  }

  // Utility methods
  async getActiveUsers() {
    return this.getAllUsers();
  }

  async getInactiveUsers() {
    const rows = await this.db.all(
      'SELECT * FROM users WHERE is_active = 0 ORDER BY name'
    );

    return rows.map(row => this.mapRowToUser(row));
  }

  async restoreUser(id) {
    await this.db.run('UPDATE users SET is_active = 1 WHERE id = ?', [id]);

    return this.getUserById(id);
  }
}
