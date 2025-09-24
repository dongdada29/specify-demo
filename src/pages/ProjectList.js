// Project list page for Taskify
import { ProjectService } from '../services/ProjectService.js';
import { DatabaseService } from '../services/DatabaseService.js';
import { Project } from '../models/Project.js';

export class ProjectListPage {
  constructor() {
    this.db = null;
    this.projectService = null;
    this.projects = [];
    this.currentUser = null;
  }

  // Initialize the page
  async init() {
    try {
      // Get current user from localStorage
      this.currentUser = this.getCurrentUser();
      if (!this.currentUser) {
        await this.navigateToUserSelection();
        return;
      }

      // Initialize database and services
      this.db = new DatabaseService();
      await this.db.initialize();
      this.projectService = new ProjectService(this.db);

      // Load projects
      await this.loadProjects();

      // Render the page
      this.render();

      // Setup event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing project list page:', error);
      this.showError('Failed to load projects. Please refresh the page.');
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing current user:', error);
      return null;
    }
  }

  // Load projects from database
  async loadProjects() {
    try {
      this.projects = await this.projectService.getProjectsWithTaskCounts();
    } catch (error) {
      console.error('Error loading projects:', error);
      throw error;
    }
  }

  // Render the page
  render() {
    const projectGrid = document.getElementById('project-grid');
    if (!projectGrid) {
      console.error('Project grid element not found');
      return;
    }

    projectGrid.innerHTML = '';

    if (this.projects.length === 0) {
      projectGrid.innerHTML =
        '<div class="no-projects">No projects available</div>';
      return;
    }

    this.projects.forEach(project => {
      const projectCard = this.createProjectCard(project);
      projectGrid.appendChild(projectCard);
    });
  }

  // Create project card element
  createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.projectId = project.id;

    card.innerHTML = `
      <div class="project-name">${project.name}</div>
      <div class="project-description">${project.description || 'No description'}</div>
      <div class="project-stats">
        <span>To Do: ${project.todoCount || 0}</span>
        <span>In Progress: ${project.inProgressCount || 0}</span>
        <span>In Review: ${project.inReviewCount || 0}</span>
        <span>Done: ${project.doneCount || 0}</span>
      </div>
    `;

    return card;
  }

  // Setup event listeners
  setupEventListeners() {
    const projectGrid = document.getElementById('project-grid');
    if (!projectGrid) return;

    projectGrid.addEventListener('click', e => {
      const projectCard = e.target.closest('.project-card');
      if (projectCard) {
        this.selectProject(projectCard);
      }
    });

    // Handle keyboard navigation
    projectGrid.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const projectCard = e.target.closest('.project-card');
        if (projectCard) {
          this.selectProject(projectCard);
        }
      }
    });

    // Make cards focusable
    projectGrid.querySelectorAll('.project-card').forEach(card => {
      card.tabIndex = 0;
    });

    // Switch user button
    const switchUserBtn = document.getElementById('switch-user');
    if (switchUserBtn) {
      switchUserBtn.addEventListener('click', async () => {
        await this.navigateToUserSelection();
      });
    }
  }

  // Select a project
  async selectProject(projectCard) {
    try {
      const projectId = parseInt(projectCard.dataset.projectId);
      const project = this.projects.find(p => p.id === projectId);

      if (!project) {
        console.error('Project not found');
        return;
      }

      // Store current project
      localStorage.setItem('currentProject', JSON.stringify(project));

      // Navigate to Kanban board
      await this.navigateToKanbanBoard(project);
    } catch (error) {
      console.error('Error selecting project:', error);
      this.showError('Failed to select project. Please try again.');
    }
  }

  // Navigate to Kanban board page
  async navigateToKanbanBoard(project) {
    try {
      // Hide project list page
      const projectListPage = document.getElementById('project-list');
      if (projectListPage) {
        projectListPage.classList.remove('active');
      }

      // Show Kanban board page
      const kanbanBoardPage = document.getElementById('kanban-board');
      if (kanbanBoardPage) {
        kanbanBoardPage.classList.add('active');

        // Update current project display
        const currentProjectName = document.getElementById(
          'current-project-name'
        );
        if (currentProjectName) {
          currentProjectName.textContent = project.name;
        }
      }

      // Initialize Kanban board page
      const { KanbanBoardPage } = await import('./KanbanBoard.js');
      const kanbanBoardPageInstance = new KanbanBoardPage();
      await kanbanBoardPageInstance.init();
    } catch (error) {
      console.error('Error navigating to Kanban board:', error);
      this.showError('Failed to load Kanban board. Please try again.');
    }
  }

  // Navigate to user selection page
  async navigateToUserSelection() {
    try {
      // Clear current user
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentProject');

      // Hide project list page
      const projectListPage = document.getElementById('project-list');
      if (projectListPage) {
        projectListPage.classList.remove('active');
      }

      // Show user selection page
      const userSelectionPage = document.getElementById('user-selection');
      if (userSelectionPage) {
        userSelectionPage.classList.add('active');
      }

      // Initialize user selection page
      const { UserSelectionPage } = await import('./UserSelection.js');
      const userSelectionPageInstance = new UserSelectionPage();
      await userSelectionPageInstance.init();
    } catch (error) {
      console.error('Error navigating to user selection:', error);
      this.showError('Failed to switch user. Please refresh the page.');
    }
  }

  // Show error message
  showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;

    // Add to notifications container
    const notifications = document.getElementById('notifications');
    if (notifications) {
      notifications.appendChild(notification);

      // Remove after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    }
  }

  // Get current project
  getCurrentProject() {
    try {
      const projectData = localStorage.getItem('currentProject');
      return projectData ? JSON.parse(projectData) : null;
    } catch (error) {
      console.error('Error parsing current project:', error);
      return null;
    }
  }

  // Refresh projects
  async refreshProjects() {
    try {
      await this.loadProjects();
      this.render();
      this.setupEventListeners();
    } catch (error) {
      console.error('Error refreshing projects:', error);
      this.showError('Failed to refresh projects. Please try again.');
    }
  }

  // Search projects
  async searchProjects(query) {
    try {
      if (!query || query.trim().length === 0) {
        await this.loadProjects();
      } else {
        this.projects = await this.projectService.searchProjects(query);
      }
      this.render();
      this.setupEventListeners();
    } catch (error) {
      console.error('Error searching projects:', error);
      this.showError('Failed to search projects. Please try again.');
    }
  }

  // Get project statistics
  async getProjectStatistics() {
    try {
      return await this.projectService.getProjectStatistics();
    } catch (error) {
      console.error('Error getting project statistics:', error);
      return null;
    }
  }

  // Cleanup
  destroy() {
    // Remove event listeners
    const projectGrid = document.getElementById('project-grid');
    if (projectGrid) {
      projectGrid.replaceWith(projectGrid.cloneNode(true));
    }

    // Clear data
    this.projects = [];
    this.currentUser = null;
  }
}
