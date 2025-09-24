// Task service for Taskify
import { Task, TaskStatus } from '../models/Task.js';

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

    const taskDataToStore = {
      title: task.title,
      description: task.description,
      status: task.status,
      project_id: task.projectId,
      assigned_user_id: task.assignedUserId,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
      order_index: task.orderIndex,
      is_active: 1
    };

    const id = await this.db.add('tasks', taskDataToStore);
    task.id = id;
    return task;
  }

  // Get task by ID
  async getTaskById(id) {
    const row = await this.db.get('tasks', id);
    if (!row) return null;

    return new Task({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      projectId: row.project_id,
      assignedUserId: row.assigned_user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      orderIndex: row.order_index,
      isActive: row.is_active === 1
    });
  }

  // Get all tasks
  async getAllTasks() {
    const rows = await this.db.getAll('tasks');
    return rows
      .filter(row => row.is_active === 1)
      .map(row => new Task({
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        projectId: row.project_id,
        assignedUserId: row.assigned_user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        orderIndex: row.order_index,
        isActive: row.is_active === 1
      }));
  }

  // Get tasks by project
  async getTasksByProject(projectId) {
    const rows = await this.db.getAllByIndex('tasks', 'project_id', projectId);
    return rows
      .filter(row => row.is_active === 1)
      .map(row => new Task({
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        projectId: row.project_id,
        assignedUserId: row.assigned_user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        orderIndex: row.order_index,
        isActive: row.is_active === 1
      }));
  }

  // Get tasks by status
  async getTasksByStatus(status) {
    const rows = await this.db.getAllByIndex('tasks', 'status', status);
    return rows
      .filter(row => row.is_active === 1)
      .map(row => new Task({
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        projectId: row.project_id,
        assignedUserId: row.assigned_user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        orderIndex: row.order_index,
        isActive: row.is_active === 1
      }));
  }

  // Get tasks by assigned user
  async getTasksByAssignedUser(userId) {
    const rows = await this.db.getAllByIndex('tasks', 'assigned_user_id', userId);
    return rows
      .filter(row => row.is_active === 1)
      .map(row => new Task({
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        projectId: row.project_id,
        assignedUserId: row.assigned_user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        orderIndex: row.order_index,
        isActive: row.is_active === 1
      }));
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

    const taskDataToStore = {
      id: id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      project_id: updatedTask.projectId,
      assigned_user_id: updatedTask.assignedUserId,
      created_at: updatedTask.createdAt,
      updated_at: new Date().toISOString(),
      order_index: updatedTask.orderIndex,
      is_active: updatedTask.isActive ? 1 : 0
    };

    await this.db.update('tasks', taskDataToStore);
    return updatedTask;
  }

  // Update task status
  async updateTaskStatus(id, status) {
    const task = await this.getTaskById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    task.status = status;
    task.updatedAt = new Date().toISOString();

    const taskDataToStore = {
      id: id,
      title: task.title,
      description: task.description,
      status: task.status,
      project_id: task.projectId,
      assigned_user_id: task.assignedUserId,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
      order_index: task.orderIndex,
      is_active: task.isActive ? 1 : 0
    };

    await this.db.update('tasks', taskDataToStore);
    return task;
  }

  // Assign task to user
  async assignTask(id, userId) {
    const task = await this.getTaskById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    task.assignedUserId = userId;
    task.updatedAt = new Date().toISOString();

    const taskDataToStore = {
      id: id,
      title: task.title,
      description: task.description,
      status: task.status,
      project_id: task.projectId,
      assigned_user_id: task.assignedUserId,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
      order_index: task.orderIndex,
      is_active: task.isActive ? 1 : 0
    };

    await this.db.update('tasks', taskDataToStore);
    return task;
  }

  // Reorder tasks within a status
  async reorderTasks(status, taskIds) {
    for (let i = 0; i < taskIds.length; i++) {
      const task = await this.getTaskById(taskIds[i]);
      if (task) {
        task.orderIndex = i;
        task.updatedAt = new Date().toISOString();

        const taskDataToStore = {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          project_id: task.projectId,
          assigned_user_id: task.assignedUserId,
          created_at: task.createdAt,
          updated_at: task.updatedAt,
          order_index: task.orderIndex,
          is_active: task.isActive ? 1 : 0
        };

        await this.db.update('tasks', taskDataToStore);
      }
    }
  }

  // Delete task (soft delete)
  async deleteTask(id) {
    const task = await this.getTaskById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const taskDataToStore = {
      id: id,
      title: task.title,
      description: task.description,
      status: task.status,
      project_id: task.projectId,
      assigned_user_id: task.assignedUserId,
      created_at: task.createdAt,
      updated_at: new Date().toISOString(),
      order_index: task.orderIndex,
      is_active: 0
    };

    await this.db.update('tasks', taskDataToStore);
    return true;
  }

  // Get task statistics
  async getTaskStats() {
    const tasks = await this.getAllTasks();
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.status === TaskStatus.TODO).length;
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const inReviewTasks = tasks.filter(t => t.status === TaskStatus.IN_REVIEW).length;
    const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const assignedTasks = tasks.filter(t => t.assignedUserId).length;

    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      inReviewTasks,
      doneTasks,
      assignedTasks,
      unassignedTasks: totalTasks - assignedTasks
    };
  }

  // Search tasks
  async searchTasks(query) {
    const tasks = await this.getAllTasks();
    const lowercaseQuery = query.toLowerCase();

    return tasks.filter(task =>
      task.title.toLowerCase().includes(lowercaseQuery) ||
      (task.description && task.description.toLowerCase().includes(lowercaseQuery))
    );
  }
}