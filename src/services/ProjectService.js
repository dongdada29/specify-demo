// Project service for Taskify
import { Project } from '../models/Project.js';

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

    const projectDataToStore = {
      name: project.name,
      description: project.description,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
      is_active: 1,
    };

    const id = await this.db.add('projects', projectDataToStore);
    project.id = id;
    return project;
  }

  // Get project by ID
  async getProjectById(id) {
    const row = await this.db.get('projects', id);
    if (!row) return null;

    return new Project({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: row.is_active === 1,
    });
  }

  // Get all projects
  async getAllProjects() {
    const rows = await this.db.getAll('projects');
    return rows
      .filter(row => row.is_active === 1)
      .map(
        row =>
          new Project({
            id: row.id,
            name: row.name,
            description: row.description,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            isActive: row.is_active === 1,
          })
      );
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

    const projectDataToStore = {
      id: id,
      name: updatedProject.name,
      description: updatedProject.description,
      created_at: updatedProject.createdAt,
      updated_at: new Date().toISOString(),
      is_active: updatedProject.isActive ? 1 : 0,
    };

    await this.db.update('projects', projectDataToStore);
    return updatedProject;
  }

  // Delete project (soft delete)
  async deleteProject(id) {
    const project = await this.getProjectById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    const projectDataToStore = {
      id: id,
      name: project.name,
      description: project.description,
      created_at: project.createdAt,
      updated_at: new Date().toISOString(),
      is_active: 0,
    };

    await this.db.update('projects', projectDataToStore);
    return true;
  }

  // Get project statistics
  async getProjectStats() {
    const projects = await this.getAllProjects();
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.isActive).length;

    return {
      totalProjects,
      activeProjects,
      inactiveProjects: totalProjects - activeProjects,
    };
  }

  // Search projects
  async searchProjects(query) {
    const projects = await this.getAllProjects();
    const lowercaseQuery = query.toLowerCase();

    return projects.filter(
      project =>
        project.name.toLowerCase().includes(lowercaseQuery) ||
        (project.description &&
          project.description.toLowerCase().includes(lowercaseQuery))
    );
  }
}
