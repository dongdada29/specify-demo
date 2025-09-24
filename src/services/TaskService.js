// Task service for Taskify
import { Task, TaskStatus } from '../models/Task.js';
import { DatabaseService } from './DatabaseService.js';

export class TaskService {
  constructor(databaseService) {
    this.db = databaseService;
  }

  // Create task
  async createTask(taskData) {
    const task = new Task(taskData);
    const errors = task.validate();

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Get next order for the status
    const nextOrder = await this.getNextOrderForStatus(task.status);

    const result = await this.db.run(
      'INSERT INTO tasks (title, description, status, project_id, assigned_user_id, created_at, updated_at, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        task.title,
        task.description,
        task.status,
        task.projectId,
        task.assignedUserId,
        task.createdAt,
        task.updatedAt,
        nextOrder,
      ]
    );

    task.id = result.id;
    task.order = nextOrder;
    return task;
  }

  // Get task by ID
  async getTaskById(id) {
    const row = await this.db.get(
      `
      SELECT t.*, u.name as assigned_user_name, u.color as assigned_user_color
      FROM tasks t
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE t.id = ? AND t.is_active = 1
    `,
      [id]
    );

    if (!row) {
      return null;
    }

    return this.mapRowToTask(row);
  }

  // Get all tasks
  async getAllTasks() {
    const rows = await this.db.all(`
      SELECT t.*, u.name as assigned_user_name, u.color as assigned_user_color
      FROM tasks t
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE t.is_active = 1
      ORDER BY t.status, t.order_index
    `);

    return rows.map(row => this.mapRowToTask(row));
  }

  // Get tasks by project
  async getTasksByProject(projectId) {
    const rows = await this.db.all(
      `
      SELECT t.*, u.name as assigned_user_name, u.color as assigned_user_color
      FROM tasks t
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE t.project_id = ? AND t.is_active = 1
      ORDER BY t.status, t.order_index
    `,
      [projectId]
    );

    return rows.map(row => this.mapRowToTask(row));
  }

  // Get tasks by status
  async getTasksByStatus(status) {
    const rows = await this.db.all(
      `
      SELECT t.*, u.name as assigned_user_name, u.color as assigned_user_color
      FROM tasks t
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE t.status = ? AND t.is_active = 1
      ORDER BY t.order_index
    `,
      [status]
    );

    return rows.map(row => this.mapRowToTask(row));
  }

  // Get tasks by assigned user
  async getTasksByAssignedUser(userId) {
    const rows = await this.db.all(
      `
      SELECT t.*, u.name as assigned_user_name, u.color as assigned_user_color
      FROM tasks t
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE t.assigned_user_id = ? AND t.is_active = 1
      ORDER BY t.status, t.order_index
    `,
      [userId]
    );

    return rows.map(row => this.mapRowToTask(row));
  }

  // Get tasks by project and status
  async getTasksByProjectAndStatus(projectId, status) {
    const rows = await this.db.all(
      `
      SELECT t.*, u.name as assigned_user_name, u.color as assigned_user_color
      FROM tasks t
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE t.project_id = ? AND t.status = ? AND t.is_active = 1
      ORDER BY t.order_index
    `,
      [projectId, status]
    );

    return rows.map(row => this.mapRowToTask(row));
  }

  // Update task
  async updateTask(id, taskData) {
    const existingTask = await this.getTaskById(id);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    const updatedTask = new Task({ ...existingTask, ...taskData });
    const errors = updatedTask.validate();

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    updatedTask.updatedAt = new Date().toISOString();

    await this.db.run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, assigned_user_id = ?, updated_at = ? WHERE id = ?',
      [
        updatedTask.title,
        updatedTask.description,
        updatedTask.status,
        updatedTask.assignedUserId,
        updatedTask.updatedAt,
        id,
      ]
    );

    return updatedTask;
  }

  // Update task status
  async updateTaskStatus(id, newStatus) {
    const task = await this.getTaskById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (!task.canTransitionTo(newStatus)) {
      throw new Error('Invalid status transition');
    }

    await this.db.run(
      'UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?',
      [newStatus, new Date().toISOString(), id]
    );

    return this.getTaskById(id);
  }

  // Assign task to user
  async assignTask(id, userId) {
    const task = await this.getTaskById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    await this.db.run(
      'UPDATE tasks SET assigned_user_id = ?, updated_at = ? WHERE id = ?',
      [userId, new Date().toISOString(), id]
    );

    return this.getTaskById(id);
  }

  // Unassign task
  async unassignTask(id) {
    const task = await this.getTaskById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    await this.db.run(
      'UPDATE tasks SET assigned_user_id = NULL, updated_at = ? WHERE id = ?',
      [new Date().toISOString(), id]
    );

    return this.getTaskById(id);
  }

  // Reorder tasks within status
  async reorderTasks(status, taskIds) {
    await this.db.transaction(async () => {
      for (let i = 0; i < taskIds.length; i++) {
        await this.db.run(
          'UPDATE tasks SET order_index = ? WHERE id = ? AND status = ?',
          [i, taskIds[i], status]
        );
      }
    });

    return this.getTasksByStatus(status);
  }

  // Move task to different status
  async moveTaskToStatus(id, newStatus, newOrder = null) {
    const task = await this.getTaskById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (!task.canTransitionTo(newStatus)) {
      throw new Error('Invalid status transition');
    }

    await this.db.transaction(async () => {
      // Update task status
      await this.db.run(
        'UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?',
        [newStatus, new Date().toISOString(), id]
      );

      // Set order if provided
      if (newOrder !== null) {
        await this.db.run('UPDATE tasks SET order_index = ? WHERE id = ?', [
          newOrder,
          id,
        ]);
      } else {
        // Get next order for the new status
        const nextOrder = await this.getNextOrderForStatus(newStatus);
        await this.db.run('UPDATE tasks SET order_index = ? WHERE id = ?', [
          nextOrder,
          id,
        ]);
      }
    });

    return this.getTaskById(id);
  }

  // Delete task (soft delete)
  async deleteTask(id) {
    const task = await this.getTaskById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    await this.db.run('UPDATE tasks SET is_active = 0 WHERE id = ?', [id]);

    return true;
  }

  // Hard delete task
  async hardDeleteTask(id) {
    await this.db.run('DELETE FROM tasks WHERE id = ?', [id]);
    return true;
  }

  // Get next order for status
  async getNextOrderForStatus(status) {
    const result = await this.db.get(
      'SELECT MAX(order_index) as max_order FROM tasks WHERE status = ? AND is_active = 1',
      [status]
    );

    return (result.max_order || -1) + 1;
  }

  // Get task count by status
  async getTaskCountByStatus(status) {
    const result = await this.db.get(
      'SELECT COUNT(*) as count FROM tasks WHERE status = ? AND is_active = 1',
      [status]
    );

    return result.count;
  }

  // Get task count by project
  async getTaskCountByProject(projectId) {
    const result = await this.db.get(
      'SELECT COUNT(*) as count FROM tasks WHERE project_id = ? AND is_active = 1',
      [projectId]
    );

    return result.count;
  }

  // Get task count by assigned user
  async getTaskCountByAssignedUser(userId) {
    const result = await this.db.get(
      'SELECT COUNT(*) as count FROM tasks WHERE assigned_user_id = ? AND is_active = 1',
      [userId]
    );

    return result.count;
  }

  // Search tasks
  async searchTasks(query) {
    const rows = await this.db.all(
      `
      SELECT t.*, u.name as assigned_user_name, u.color as assigned_user_color
      FROM tasks t
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE (t.title LIKE ? OR t.description LIKE ?) AND t.is_active = 1
      ORDER BY t.status, t.order_index
    `,
      [`%${query}%`, `%${query}%`]
    );

    return rows.map(row => this.mapRowToTask(row));
  }

  // Helper method to map database row to Task object
  mapRowToTask(row) {
    return new Task({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      projectId: row.project_id,
      assignedUserId: row.assigned_user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      order: row.order_index,
      isActive: row.is_active === 1,
      assignedUserName: row.assigned_user_name,
      assignedUserColor: row.assigned_user_color,
    });
  }

  // Validation helpers
  validateTaskData(taskData) {
    const task = new Task(taskData);
    return task.validate();
  }

  // Utility methods
  async getActiveTasks() {
    return this.getAllTasks();
  }

  async getInactiveTasks() {
    const rows = await this.db.all(`
      SELECT t.*, u.name as assigned_user_name, u.color as assigned_user_color
      FROM tasks t
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE t.is_active = 0
      ORDER BY t.status, t.order_index
    `);

    return rows.map(row => this.mapRowToTask(row));
  }

  async restoreTask(id) {
    await this.db.run('UPDATE tasks SET is_active = 1 WHERE id = ?', [id]);

    return this.getTaskById(id);
  }
}
