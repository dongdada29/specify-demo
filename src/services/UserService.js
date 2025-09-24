// User service for Taskify
import { User, UserRole } from '../models/User.js';

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

    const userDataToStore = {
      name: user.name,
      role: user.role,
      color: user.color,
      created_at: user.createdAt,
      is_active: 1
    };

    const id = await this.db.add('users', userDataToStore);
    user.id = id;
    return user;
  }

  // Get user by ID
  async getUserById(id) {
    const row = await this.db.get('users', id);
    if (!row) return null;

    return new User({
      id: row.id,
      name: row.name,
      role: row.role,
      color: row.color,
      createdAt: row.created_at,
      isActive: row.is_active === 1
    });
  }

  // Get all users
  async getAllUsers() {
    const rows = await this.db.getAll('users');
    return rows
      .filter(row => row.is_active === 1)
      .map(row => new User({
        id: row.id,
        name: row.name,
        role: row.role,
        color: row.color,
        createdAt: row.created_at,
        isActive: row.is_active === 1
      }));
  }

  // Get users by role
  async getUsersByRole(role) {
    const rows = await this.db.getAllByIndex('users', 'role', role);
    return rows
      .filter(row => row.is_active === 1)
      .map(row => new User({
        id: row.id,
        name: row.name,
        role: row.role,
        color: row.color,
        createdAt: row.created_at,
        isActive: row.is_active === 1
      }));
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

    const userDataToStore = {
      id: id,
      name: updatedUser.name,
      role: updatedUser.role,
      color: updatedUser.color,
      created_at: updatedUser.createdAt,
      updated_at: new Date().toISOString(),
      is_active: updatedUser.isActive ? 1 : 0
    };

    await this.db.update('users', userDataToStore);
    return updatedUser;
  }

  // Delete user (soft delete)
  async deleteUser(id) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const userDataToStore = {
      id: id,
      name: user.name,
      role: user.role,
      color: user.color,
      created_at: user.createdAt,
      updated_at: new Date().toISOString(),
      is_active: 0
    };

    await this.db.update('users', userDataToStore);
    return true;
  }

  // Get user statistics
  async getUserStats() {
    const users = await this.getAllUsers();
    const totalUsers = users.length;
    const productManagers = users.filter(u => u.role === UserRole.PRODUCT_MANAGER).length;
    const engineers = users.filter(u => u.role === UserRole.ENGINEER).length;

    return {
      totalUsers,
      productManagers,
      engineers,
      activeUsers: users.filter(u => u.isActive).length
    };
  }

  // Search users
  async searchUsers(query) {
    const users = await this.getAllUsers();
    const lowercaseQuery = query.toLowerCase();

    return users.filter(user =>
      user.name.toLowerCase().includes(lowercaseQuery) ||
      UserRoleNames[user.role].toLowerCase().includes(lowercaseQuery)
    );
  }
}