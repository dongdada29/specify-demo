// Main application class for Taskify
import { DatabaseService } from '../services/DatabaseService.js';
import { UserService } from '../services/UserService.js';
import { ProjectService } from '../services/ProjectService.js';
import { TaskService } from '../services/TaskService.js';
import { CommentService } from '../services/CommentService.js';
import { WebSocketService } from '../services/WebSocketService.js';
import { NotificationSystem } from '../components/NotificationSystem.js';
import { UserSelectionPage } from '../pages/UserSelection.js';
import { ProjectListPage } from '../pages/ProjectList.js';
import { KanbanBoardPage } from '../pages/KanbanBoard.js';

export class App {
  constructor() {
    this.db = null;
    this.userService = null;
    this.projectService = null;
    this.taskService = null;
    this.commentService = null;
    this.webSocketService = null;
    this.notificationSystem = null;
    this.currentUser = null;
    this.currentProject = null;
    this.isInitialized = false;
  }

  // Initialize the application
  async init() {
    try {
      console.log('Initializing Taskify application...');

      // Initialize database and services
      await this.initializeServices();

      // Initialize notification system
      this.initializeNotificationSystem();

      // Initialize WebSocket connection
      await this.initializeWebSocket();

      // Check for existing user session
      this.checkExistingSession();

      // Initialize UI
      this.initializeUI();

      this.isInitialized = true;
      console.log('Taskify application initialized successfully');
    } catch (error) {
      console.error('Error initializing application:', error);
      this.showError(
        'Failed to initialize application. Please refresh the page.'
      );
    }
  }

  // Initialize database and services
  async initializeServices() {
    this.db = new DatabaseService();
    await this.db.initialize();

    this.userService = new UserService(this.db);
    this.projectService = new ProjectService(this.db);
    this.taskService = new TaskService(this.db);
    this.commentService = new CommentService(this.db);
  }

  // Initialize notification system
  initializeNotificationSystem() {
    this.notificationSystem = new NotificationSystem({
      position: 'top-right',
      duration: 5000,
      maxNotifications: 5,
    });
    this.notificationSystem.init();
  }

  // Initialize WebSocket connection
  async initializeWebSocket() {
    try {
      this.webSocketService = new WebSocketService();
      await this.webSocketService.connect();

      // Setup WebSocket event listeners
      this.setupWebSocketListeners();
    } catch (error) {
      console.warn('WebSocket connection failed:', error);
      // Continue without WebSocket - app will work in offline mode
    }
  }

  // Setup WebSocket event listeners
  setupWebSocketListeners() {
    if (!this.webSocketService) return;

    this.webSocketService.on('connected', () => {
      this.notificationSystem.showConnectionStatus(true);
    });

    this.webSocketService.on('disconnected', () => {
      this.notificationSystem.showConnectionStatus(false);
    });

    this.webSocketService.on('taskUpdated', task => {
      this.handleTaskUpdate(task);
    });

    this.webSocketService.on('taskCreated', task => {
      this.handleTaskCreated(task);
    });

    this.webSocketService.on('taskDeleted', data => {
      this.handleTaskDeleted(data.id);
    });

    this.webSocketService.on('commentCreated', comment => {
      this.handleCommentCreated(comment);
    });

    this.webSocketService.on('userOnline', data => {
      this.handleUserOnline(data);
    });

    this.webSocketService.on('userOffline', data => {
      this.handleUserOffline(data);
    });
  }

  // Check for existing user session
  checkExistingSession() {
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        console.log('Restored user session:', this.currentUser.name);
      }
    } catch (error) {
      console.error('Error restoring user session:', error);
      localStorage.removeItem('currentUser');
    }
  }

  // Initialize UI based on current state
  initializeUI() {
    if (this.currentUser) {
      // User is logged in, show project list
      this.showProjectList();
    } else {
      // No user session, show user selection
      this.showUserSelection();
    }
  }

  // Show user selection page
  async showUserSelection() {
    try {
      // Hide other pages
      this.hideAllPages();

      // Show user selection page
      const userSelectionPage = document.getElementById('user-selection');
      if (userSelectionPage) {
        userSelectionPage.classList.add('active');
      }

      // Initialize user selection page
      const userSelectionPageInstance = new UserSelectionPage();
      await userSelectionPageInstance.init();
    } catch (error) {
      console.error('Error showing user selection:', error);
      this.showError('Failed to load user selection. Please refresh the page.');
    }
  }

  // Show project list page
  async showProjectList() {
    try {
      // Hide other pages
      this.hideAllPages();

      // Show project list page
      const projectListPage = document.getElementById('project-list');
      if (projectListPage) {
        projectListPage.classList.add('active');
      }

      // Initialize project list page
      const projectListPageInstance = new ProjectListPage();
      await projectListPageInstance.init();
    } catch (error) {
      console.error('Error showing project list:', error);
      this.showError('Failed to load project list. Please refresh the page.');
    }
  }

  // Show Kanban board page
  async showKanbanBoard(project) {
    try {
      // Hide other pages
      this.hideAllPages();

      // Show Kanban board page
      const kanbanBoardPage = document.getElementById('kanban-board');
      if (kanbanBoardPage) {
        kanbanBoardPage.classList.add('active');
      }

      // Initialize Kanban board page
      const kanbanBoardPageInstance = new KanbanBoardPage();
      await kanbanBoardPageInstance.init();
    } catch (error) {
      console.error('Error showing Kanban board:', error);
      this.showError('Failed to load Kanban board. Please try again.');
    }
  }

  // Hide all pages
  hideAllPages() {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.classList.remove('active');
    });
  }

  // Handle task update from WebSocket
  handleTaskUpdate(task) {
    // Update UI if task is visible
    const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
    if (taskElement) {
      // Update task card
      this.updateTaskCard(taskElement, task);
    }
  }

  // Handle task creation from WebSocket
  handleTaskCreated(task) {
    // Add task to UI if current project matches
    if (this.currentProject && task.projectId === this.currentProject.id) {
      this.addTaskToUI(task);
    }
  }

  // Handle task deletion from WebSocket
  handleTaskDeleted(taskId) {
    // Remove task from UI
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.remove();
    }
  }

  // Handle comment creation from WebSocket
  handleCommentCreated(comment) {
    // Show notification
    this.notificationSystem.showCommentAdded(
      comment.taskTitle || 'Task',
      comment.authorName || 'Someone'
    );
  }

  // Handle user online from WebSocket
  handleUserOnline(data) {
    this.notificationSystem.showUserOnline(data.userName || 'User');
  }

  // Handle user offline from WebSocket
  handleUserOffline(data) {
    this.notificationSystem.showUserOffline(data.userName || 'User');
  }

  // Update task card in UI
  updateTaskCard(element, task) {
    // Update task data attributes
    element.dataset.status = task.status;

    // Update task title
    const titleElement = element.querySelector('.task-title');
    if (titleElement) {
      titleElement.textContent = task.title;
    }

    // Update task description
    const descriptionElement = element.querySelector('.task-description');
    if (descriptionElement) {
      descriptionElement.textContent = task.description || '';
    }

    // Update assignment
    const assigneeElement = element.querySelector('.task-assignee');
    if (assigneeElement) {
      if (task.assignedUserName) {
        assigneeElement.innerHTML = `
          <div class="assignee-avatar" style="background-color: ${task.assignedUserColor || '#6b7280'}">
            ${task.assignedUserName.charAt(0).toUpperCase()}
          </div>
          <span>${task.assignedUserName}</span>
        `;
      } else {
        assigneeElement.innerHTML = '<span>Unassigned</span>';
      }
    }
  }

  // Add task to UI
  addTaskToUI(task) {
    const statusName = this.getStatusName(task.status);
    const taskList = document.getElementById(
      `${statusName.toLowerCase().replace(' ', '-')}-tasks`
    );

    if (taskList) {
      const taskCard = this.createTaskCard(task);
      taskList.appendChild(taskCard);
    }
  }

  // Create task card element
  createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.taskId = task.id;
    card.dataset.status = task.status;

    if (task.assignedUserId) {
      card.classList.add('assigned');
      if (task.assignedUserColor) {
        card.style.borderLeftColor = task.assignedUserColor;
      }
    }

    card.innerHTML = `
      <div class="task-title">${task.title}</div>
      <div class="task-description">${task.description || ''}</div>
      <div class="task-meta">
        <div class="task-assignee">
          ${
            task.assignedUserName
              ? `
            <div class="assignee-avatar" style="background-color: ${task.assignedUserColor || '#6b7280'}">
              ${task.assignedUserName.charAt(0).toUpperCase()}
            </div>
            <span>${task.assignedUserName}</span>
          `
              : '<span>Unassigned</span>'
          }
        </div>
      </div>
    `;

    return card;
  }

  // Get status name
  getStatusName(status) {
    const statusNames = {
      1: 'To Do',
      2: 'In Progress',
      3: 'In Review',
      4: 'Done',
    };
    return statusNames[status] || 'Unknown';
  }

  // Show error message
  showError(message) {
    this.notificationSystem.showError(message);
  }

  // Show success message
  showSuccess(message) {
    this.notificationSystem.showSuccess(message);
  }

  // Show info message
  showInfo(message) {
    this.notificationSystem.showInfo(message);
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Set current user
  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Get current project
  getCurrentProject() {
    return this.currentProject;
  }

  // Set current project
  setCurrentProject(project) {
    this.currentProject = project;
    localStorage.setItem('currentProject', JSON.stringify(project));
  }

  // Logout user
  logout() {
    this.currentUser = null;
    this.currentProject = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentProject');
    this.showUserSelection();
  }

  // Get services
  getServices() {
    return {
      userService: this.userService,
      projectService: this.projectService,
      taskService: this.taskService,
      commentService: this.commentService,
      webSocketService: this.webSocketService,
    };
  }

  // Get notification system
  getNotificationSystem() {
    return this.notificationSystem;
  }

  // Check if app is initialized
  isAppInitialized() {
    return this.isInitialized;
  }

  // Cleanup
  destroy() {
    if (this.webSocketService) {
      this.webSocketService.disconnect();
    }

    if (this.notificationSystem) {
      this.notificationSystem.destroy();
    }

    this.db = null;
    this.userService = null;
    this.projectService = null;
    this.taskService = null;
    this.commentService = null;
    this.webSocketService = null;
    this.notificationSystem = null;
    this.currentUser = null;
    this.currentProject = null;
    this.isInitialized = false;
  }
}
