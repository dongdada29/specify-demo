// Kanban board page for Taskify
import { TaskService } from '../services/TaskService.js';
import { CommentService } from '../services/CommentService.js';
import { UserService } from '../services/UserService.js';
import { DatabaseService } from '../services/DatabaseService.js';
import { DragDropHandler } from '../utils/DragDropHandler.js';
import { Task, TaskStatus, TaskStatusNames } from '../models/Task.js';

export class KanbanBoardPage {
  constructor() {
    this.db = null;
    this.taskService = null;
    this.commentService = null;
    this.userService = null;
    this.dragDropHandler = null;
    this.tasks = [];
    this.users = [];
    this.currentUser = null;
    this.currentProject = null;
  }

  // Initialize the page
  async init() {
    try {
      // Get current user and project from localStorage
      this.currentUser = this.getCurrentUser();
      this.currentProject = this.getCurrentProject();

      if (!this.currentUser || !this.currentProject) {
        this.navigateToProjectList();
        return;
      }

      // Initialize database and services
      this.db = new DatabaseService();
      await this.db.initialize();
      this.taskService = new TaskService(this.db);
      this.commentService = new CommentService(this.db);
      this.userService = new UserService(this.db);

      // Load data
      await this.loadData();

      // Render the page
      this.render();

      // Setup event listeners
      this.setupEventListeners();

      // Initialize drag and drop
      this.initializeDragAndDrop();
    } catch (error) {
      console.error('Error initializing Kanban board page:', error);
      this.showError('Failed to load Kanban board. Please refresh the page.');
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

  // Get current project from localStorage
  getCurrentProject() {
    try {
      const projectData = localStorage.getItem('currentProject');
      return projectData ? JSON.parse(projectData) : null;
    } catch (error) {
      console.error('Error parsing current project:', error);
      return null;
    }
  }

  // Load all necessary data
  async loadData() {
    try {
      // Load tasks for current project
      this.tasks = await this.taskService.getTasksByProject(
        this.currentProject.id
      );

      // Load users for assignment
      this.users = await this.userService.getAllUsers();
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  // Render the page
  render() {
    this.renderKanbanColumns();
    this.renderTasks();
  }

  // Render Kanban columns
  renderKanbanColumns() {
    const kanbanBoard = document.getElementById('kanban-board');
    if (!kanbanBoard) {
      console.error('Kanban board element not found');
      return;
    }

    // Clear existing content
    kanbanBoard.innerHTML = '';

    // Create columns for each status
    Object.values(TaskStatus).forEach(status => {
      const column = this.createKanbanColumn(status);
      kanbanBoard.appendChild(column);
    });
  }

  // Create Kanban column element
  createKanbanColumn(status) {
    const column = document.createElement('div');
    column.className = 'kanban-column';
    column.dataset.status = status;

    const statusName = TaskStatusNames[status];
    const tasks = this.tasks.filter(task => task.status === status);

    column.innerHTML = `
      <h3>${statusName}</h3>
      <div class="task-list" id="${statusName.toLowerCase().replace(' ', '-')}-tasks">
        ${tasks.map(task => this.createTaskCard(task)).join('')}
      </div>
    `;

    return column;
  }

  // Render tasks in their respective columns
  renderTasks() {
    // Clear all task lists
    document.querySelectorAll('.task-list').forEach(list => {
      list.innerHTML = '';
    });

    // Group tasks by status
    const tasksByStatus = {};
    Object.values(TaskStatus).forEach(status => {
      tasksByStatus[status] = this.tasks.filter(task => task.status === status);
    });

    // Render tasks in each column
    Object.entries(tasksByStatus).forEach(([status, tasks]) => {
      const statusName = TaskStatusNames[status];
      const taskList = document.getElementById(
        `${statusName.toLowerCase().replace(' ', '-')}-tasks`
      );

      if (taskList) {
        tasks.forEach(task => {
          const taskCard = this.createTaskCard(task);
          taskList.appendChild(taskCard);
        });
      }
    });
  }

  // Create task card element
  createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.taskId = task.id;
    card.dataset.status = task.status;

    // Add assigned class if task is assigned to current user
    if (task.assignedUserId === this.currentUser.id) {
      card.classList.add('assigned');
      card.style.borderLeftColor = this.currentUser.color;
    } else if (task.assignedUserId && task.assignedUserColor) {
      card.classList.add('assigned');
      card.style.borderLeftColor = task.assignedUserColor;
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
              ${task.assignedUserName.charAt(0)}
            </div>
            <span>${task.assignedUserName}</span>
          `
              : '<span>Unassigned</span>'
          }
        </div>
        <div class="task-actions">
          <button class="btn btn-sm" data-action="edit">Edit</button>
        </div>
      </div>
    `;

    return card;
  }

  // Setup event listeners
  setupEventListeners() {
    // Task card clicks
    document.addEventListener('click', e => {
      const taskCard = e.target.closest('.task-card');
      if (taskCard) {
        this.openTaskModal(taskCard);
      }
    });

    // Back to projects button
    const backToProjectsBtn = document.getElementById('back-to-projects');
    if (backToProjectsBtn) {
      backToProjectsBtn.addEventListener('click', () => {
        this.navigateToProjectList();
      });
    }

    // Task modal events
    this.setupTaskModalEvents();
  }

  // Setup task modal event listeners
  setupTaskModalEvents() {
    const modal = document.getElementById('task-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const assigneeSelect = document.getElementById('task-assignee');
    const addCommentBtn = document.getElementById('add-comment');

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.closeTaskModal();
      });
    }

    if (assigneeSelect) {
      assigneeSelect.addEventListener('change', e => {
        this.updateTaskAssignment(e.target.value);
      });
    }

    if (addCommentBtn) {
      addCommentBtn.addEventListener('click', () => {
        this.addComment();
      });
    }

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          this.closeTaskModal();
        }
      });
    }
  }

  // Initialize drag and drop
  initializeDragAndDrop() {
    this.dragDropHandler = new DragDropHandler();
    this.dragDropHandler.initialize();

    // Listen for drag and drop events
    this.dragDropHandler.on('drop', data => {
      this.handleTaskDrop(data);
    });
  }

  // Handle task drop
  async handleTaskDrop(data) {
    try {
      const { taskId, oldStatus, newStatus } = data;

      if (oldStatus === newStatus) {
        // Task was reordered within the same column
        return;
      }

      // Update task status in database
      await this.taskService.updateTaskStatus(taskId, newStatus);

      // Update local task data
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = newStatus;
      }

      // Re-render tasks
      this.renderTasks();

      // Show success message
      this.showSuccess('Task moved successfully');
    } catch (error) {
      console.error('Error handling task drop:', error);
      this.showError('Failed to move task. Please try again.');
    }
  }

  // Open task modal
  async openTaskModal(taskCard) {
    try {
      const taskId = parseInt(taskCard.dataset.taskId);
      const task = this.tasks.find(t => t.id === taskId);

      if (!task) {
        console.error('Task not found');
        return;
      }

      // Load task details and comments
      await this.loadTaskDetails(task);

      // Show modal
      const modal = document.getElementById('task-modal');
      if (modal) {
        modal.classList.add('active');
      }
    } catch (error) {
      console.error('Error opening task modal:', error);
      this.showError('Failed to load task details. Please try again.');
    }
  }

  // Load task details for modal
  async loadTaskDetails(task) {
    try {
      // Update modal content
      const titleElement = document.getElementById('task-title');
      const descriptionElement = document.getElementById('task-description');
      const assigneeSelect = document.getElementById('task-assignee');
      const commentList = document.getElementById('comment-list');

      if (titleElement) titleElement.textContent = task.title;
      if (descriptionElement)
        descriptionElement.textContent = task.description || 'No description';

      // Populate assignee select
      if (assigneeSelect) {
        assigneeSelect.innerHTML = '<option value="">Unassigned</option>';
        this.users.forEach(user => {
          const option = document.createElement('option');
          option.value = user.id;
          option.textContent = user.name;
          if (user.id === task.assignedUserId) {
            option.selected = true;
          }
          assigneeSelect.appendChild(option);
        });
      }

      // Load comments
      if (commentList) {
        const comments = await this.commentService.getCommentsByTask(task.id);
        commentList.innerHTML = comments
          .map(comment => this.createCommentElement(comment))
          .join('');
      }

      // Store current task ID for updates
      this.currentTaskId = task.id;
    } catch (error) {
      console.error('Error loading task details:', error);
      throw error;
    }
  }

  // Create comment element
  createCommentElement(comment) {
    const canEdit = comment.authorId === this.currentUser.id;

    return `
      <div class="comment" data-comment-id="${comment.id}">
        <div class="comment-header">
          <span class="comment-author">${comment.authorName}</span>
          <span class="comment-time">${comment.getRelativeCreatedAt()}</span>
        </div>
        <div class="comment-content">${comment.content}</div>
        ${
          canEdit
            ? `
          <div class="comment-actions">
            <button class="btn btn-sm" data-action="edit-comment">Edit</button>
            <button class="btn btn-sm" data-action="delete-comment">Delete</button>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  // Close task modal
  closeTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.currentTaskId = null;
  }

  // Update task assignment
  async updateTaskAssignment(userId) {
    try {
      if (!this.currentTaskId) return;

      const userIdInt = userId ? parseInt(userId) : null;
      await this.taskService.assignTask(this.currentTaskId, userIdInt);

      // Update local task data
      const task = this.tasks.find(t => t.id === this.currentTaskId);
      if (task) {
        task.assignedUserId = userIdInt;
        if (userIdInt) {
          const user = this.users.find(u => u.id === userIdInt);
          if (user) {
            task.assignedUserName = user.name;
            task.assignedUserColor = user.color;
          }
        } else {
          task.assignedUserName = null;
          task.assignedUserColor = null;
        }
      }

      // Re-render tasks
      this.renderTasks();

      // Show success message
      this.showSuccess('Task assignment updated');
    } catch (error) {
      console.error('Error updating task assignment:', error);
      this.showError('Failed to update task assignment. Please try again.');
    }
  }

  // Add comment
  async addComment() {
    try {
      if (!this.currentTaskId) return;

      const commentTextarea = document.getElementById('new-comment');
      const content = commentTextarea.value.trim();

      if (!content) {
        this.showError('Comment cannot be empty');
        return;
      }

      const comment = await this.commentService.createComment({
        content,
        taskId: this.currentTaskId,
        authorId: this.currentUser.id,
      });

      // Add author info to comment
      comment.authorName = this.currentUser.name;
      comment.authorColor = this.currentUser.color;

      // Add comment to UI
      const commentList = document.getElementById('comment-list');
      if (commentList) {
        const commentElement = this.createCommentElement(comment);
        commentList.insertAdjacentHTML('beforeend', commentElement);
      }

      // Clear textarea
      commentTextarea.value = '';

      // Show success message
      this.showSuccess('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      this.showError('Failed to add comment. Please try again.');
    }
  }

  // Navigate to project list page
  navigateToProjectList() {
    try {
      // Hide Kanban board page
      const kanbanBoardPage = document.getElementById('kanban-board');
      if (kanbanBoardPage) {
        kanbanBoardPage.classList.remove('active');
      }

      // Show project list page
      const projectListPage = document.getElementById('project-list');
      if (projectListPage) {
        projectListPage.classList.add('active');
      }

      // Clear current project
      localStorage.removeItem('currentProject');
    } catch (error) {
      console.error('Error navigating to project list:', error);
      this.showError(
        'Failed to navigate to project list. Please refresh the page.'
      );
    }
  }

  // Show error message
  showError(message) {
    this.showNotification(message, 'error');
  }

  // Show success message
  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const notifications = document.getElementById('notifications');
    if (notifications) {
      notifications.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    }
  }

  // Cleanup
  destroy() {
    if (this.dragDropHandler) {
      this.dragDropHandler.destroy();
    }

    this.tasks = [];
    this.users = [];
    this.currentUser = null;
    this.currentProject = null;
  }
}
