// Project service for Taskify
import { Project } from '../models/Project.js';
import { DatabaseService } from './DatabaseService.js';

export class ProjectService {
  constructor(databaseService) {
    this.db = databaseService;
  }

  // Create project
  async createProject(projectData) {
    const project = new Project(projectData);
    const errors = project.validate();

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const result = await this.db.run(
      'INSERT INTO projects (name, description, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [project.name, project.description, project.createdAt, project.updatedAt]
    );

    project.id = result.id;
    return project;
  }

  // Get project by ID
  async getProjectById(id) {
    const row = await this.db.get(
      'SELECT * FROM projects WHERE id = ? AND is_active = 1',
      [id]
    );

    if (!row) {
      return null;
    }

    return this.mapRowToProject(row);
  }

  // Get project by name
  async getProjectByName(name) {
    const row = await this.db.get(
      'SELECT * FROM projects WHERE name = ? AND is_active = 1',
      [name]
    );

    if (!row) {
      return null;
    }

    return this.mapRowToProject(row);
  }

  // Get all projects
  async getAllProjects() {
    const rows = await this.db.all(
      'SELECT * FROM projects WHERE is_active = 1 ORDER BY name'
    );

    return rows.map(row => this.mapRowToProject(row));
  }

  // Get projects with task counts
  async getProjectsWithTaskCounts() {
    const rows = await this.db.all(`
      SELECT 
        p.*,
        COUNT(t.id) as task_count,
        COUNT(CASE WHEN t.status = 1 THEN 1 END) as todo_count,
        COUNT(CASE WHEN t.status = 2 THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN t.status = 3 THEN 1 END) as in_review_count,
        COUNT(CASE WHEN t.status = 4 THEN 1 END) as done_count
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id AND t.is_active = 1
      WHERE p.is_active = 1
      GROUP BY p.id
      ORDER BY p.name
    `);

    return rows.map(row => ({
      ...this.mapRowToProject(row),
      taskCount: row.task_count,
      todoCount: row.todo_count,
      inProgressCount: row.in_progress_count,
      inReviewCount: row.in_review_count,
      doneCount: row.done_count,
    }));
  }

  // Update project
  async updateProject(id, projectData) {
    const existingProject = await this.getProjectById(id);
    if (!existingProject) {
      throw new Error('Project not found');
    }

    const updatedProject = new Project({ ...existingProject, ...projectData });
    const errors = updatedProject.validate();

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    updatedProject.updatedAt = new Date().toISOString();

    await this.db.run(
      'UPDATE projects SET name = ?, description = ?, updated_at = ? WHERE id = ?',
      [
        updatedProject.name,
        updatedProject.description,
        updatedProject.updatedAt,
        id,
      ]
    );

    return updatedProject;
  }

  // Delete project (soft delete)
  async deleteProject(id) {
    const project = await this.getProjectById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    await this.db.run('UPDATE projects SET is_active = 0 WHERE id = ?', [id]);

    return true;
  }

  // Hard delete project
  async hardDeleteProject(id) {
    await this.db.run('DELETE FROM projects WHERE id = ?', [id]);
    return true;
  }

  // Check if project exists
  async projectExists(id) {
    const project = await this.getProjectById(id);
    return project !== null;
  }

  // Get project count
  async getProjectCount() {
    const result = await this.db.get(
      'SELECT COUNT(*) as count FROM projects WHERE is_active = 1'
    );
    return result.count;
  }

  // Search projects
  async searchProjects(query) {
    const rows = await this.db.all(
      'SELECT * FROM projects WHERE (name LIKE ? OR description LIKE ?) AND is_active = 1 ORDER BY name',
      [`%${query}%`, `%${query}%`]
    );

    return rows.map(row => this.mapRowToProject(row));
  }

  // Get project statistics
  async getProjectStatistics() {
    const totalProjects = await this.getProjectCount();
    const projectsWithTasks = await this.db.get(`
      SELECT COUNT(DISTINCT p.id) as count 
      FROM projects p 
      INNER JOIN tasks t ON p.id = t.project_id 
      WHERE p.is_active = 1 AND t.is_active = 1
    `);

    const totalTasks = await this.db.get(`
      SELECT COUNT(*) as count 
      FROM tasks t 
      INNER JOIN projects p ON t.project_id = p.id 
      WHERE p.is_active = 1 AND t.is_active = 1
    `);

    return {
      totalProjects,
      projectsWithTasks: projectsWithTasks.count,
      totalTasks: totalTasks.count,
    };
  }

  // Get project by ID with tasks
  async getProjectWithTasks(id) {
    const project = await this.getProjectById(id);
    if (!project) {
      return null;
    }

    const tasks = await this.db.all(
      `
      SELECT t.*, u.name as assigned_user_name, u.color as assigned_user_color
      FROM tasks t
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE t.project_id = ? AND t.is_active = 1
      ORDER BY t.status, t.order_index
    `,
      [id]
    );

    return {
      ...project,
      tasks: tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        projectId: task.project_id,
        assignedUserId: task.assigned_user_id,
        assignedUserName: task.assigned_user_name,
        assignedUserColor: task.assigned_user_color,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        order: task.order_index,
        isActive: task.is_active === 1,
      })),
    };
  }

  // Helper method to map database row to Project object
  mapRowToProject(row) {
    return new Project({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: row.is_active === 1,
    });
  }

  // Validation helpers
  validateProjectData(projectData) {
    const project = new Project(projectData);
    return project.validate();
  }

  // Utility methods
  async getActiveProjects() {
    return this.getAllProjects();
  }

  async getInactiveProjects() {
    const rows = await this.db.all(
      'SELECT * FROM projects WHERE is_active = 0 ORDER BY name'
    );

    return rows.map(row => this.mapRowToProject(row));
  }

  async restoreProject(id) {
    await this.db.run('UPDATE projects SET is_active = 1 WHERE id = ?', [id]);

    return this.getProjectById(id);
  }

  // Get projects created in date range
  async getProjectsByDateRange(startDate, endDate) {
    const rows = await this.db.all(
      'SELECT * FROM projects WHERE created_at BETWEEN ? AND ? AND is_active = 1 ORDER BY created_at',
      [startDate, endDate]
    );

    return rows.map(row => this.mapRowToProject(row));
  }

  // Get recently updated projects
  async getRecentlyUpdatedProjects(limit = 10) {
    const rows = await this.db.all(
      'SELECT * FROM projects WHERE is_active = 1 ORDER BY updated_at DESC LIMIT ?',
      [limit]
    );

    return rows.map(row => this.mapRowToProject(row));
  }
}
