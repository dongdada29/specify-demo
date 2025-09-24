// User selection page for Taskify
import { UserService } from '../services/UserService.js';
import { DatabaseService } from '../services/DatabaseService.js';
import { User, UserRole, UserRoleNames } from '../models/User.js';

export class UserSelectionPage {
  constructor() {
    this.db = null;
    this.userService = null;
    this.users = [];
    this.currentUser = null;
  }

  // Initialize the page
  async init() {
    try {
      // Initialize database and services
      this.db = new DatabaseService();
      await this.db.initialize();
      this.userService = new UserService(this.db);

      // Load users
      await this.loadUsers();

      // Render the page
      this.render();

      // Setup event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing user selection page:', error);
      this.showError('Failed to load users. Please refresh the page.');
    }
  }

  // Load users from database
  async loadUsers() {
    try {
      this.users = await this.userService.getAllUsers();
    } catch (error) {
      console.error('Error loading users:', error);
      throw error;
    }
  }

  // Render the page
  render() {
    const userGrid = document.getElementById('user-grid');
    if (!userGrid) {
      console.error('User grid element not found');
      return;
    }

    userGrid.innerHTML = '';

    this.users.forEach(user => {
      const userCard = this.createUserCard(user);
      userGrid.appendChild(userCard);
    });
  }

  // Create user card element
  createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.dataset.userId = user.id;

    card.innerHTML = `
      <div class="user-avatar" style="background-color: ${user.color}">
        ${user.getInitials()}
      </div>
      <div class="user-name">${user.name}</div>
      <div class="user-role">${UserRoleNames[user.role]}</div>
    `;

    return card;
  }

  // Setup event listeners
  setupEventListeners() {
    const userGrid = document.getElementById('user-grid');
    if (!userGrid) return;

    userGrid.addEventListener('click', e => {
      const userCard = e.target.closest('.user-card');
      if (userCard) {
        this.selectUser(userCard);
      }
    });

    // Handle keyboard navigation
    userGrid.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const userCard = e.target.closest('.user-card');
        if (userCard) {
          this.selectUser(userCard);
        }
      }
    });

    // Make cards focusable
    userGrid.querySelectorAll('.user-card').forEach(card => {
      card.tabIndex = 0;
    });
  }

  // Select a user
  async selectUser(userCard) {
    try {
      const userId = parseInt(userCard.dataset.userId);
      const user = this.users.find(u => u.id === userId);

      if (!user) {
        console.error('User not found');
        return;
      }

      // Update UI
      this.updateSelection(userCard);

      // Store current user
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user.toJSON()));

      // Navigate to project list
      await this.navigateToProjectList();
    } catch (error) {
      console.error('Error selecting user:', error);
      this.showError('Failed to select user. Please try again.');
    }
  }

  // Update user selection in UI
  updateSelection(selectedCard) {
    // Remove previous selection
    document.querySelectorAll('.user-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Add selection to clicked card
    selectedCard.classList.add('selected');
  }

  // Navigate to project list page
  async navigateToProjectList() {
    try {
      // Hide user selection page
      const userSelectionPage = document.getElementById('user-selection');
      if (userSelectionPage) {
        userSelectionPage.classList.remove('active');
      }

      // Show project list page
      const projectListPage = document.getElementById('project-list');
      if (projectListPage) {
        projectListPage.classList.add('active');

        // Update current user display
        const currentUserName = document.getElementById('current-user-name');
        if (currentUserName && this.currentUser) {
          currentUserName.textContent = this.currentUser.name;
        }
      }

      // Initialize project list page
      const { ProjectListPage } = await import('./ProjectList.js');
      const projectListPageInstance = new ProjectListPage();
      await projectListPageInstance.init();
    } catch (error) {
      console.error('Error navigating to project list:', error);
      this.showError('Failed to load project list. Please try again.');
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

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Set current user (for restoration from localStorage)
  setCurrentUser(user) {
    this.currentUser = user;
  }

  // Check if user is selected
  isUserSelected() {
    return this.currentUser !== null;
  }

  // Get selected user ID
  getSelectedUserId() {
    return this.currentUser ? this.currentUser.id : null;
  }

  // Clear selection
  clearSelection() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');

    // Update UI
    document.querySelectorAll('.user-card').forEach(card => {
      card.classList.remove('selected');
    });
  }

  // Refresh users
  async refreshUsers() {
    try {
      await this.loadUsers();
      this.render();
      this.setupEventListeners();
    } catch (error) {
      console.error('Error refreshing users:', error);
      this.showError('Failed to refresh users. Please try again.');
    }
  }

  // Cleanup
  destroy() {
    // Remove event listeners
    const userGrid = document.getElementById('user-grid');
    if (userGrid) {
      userGrid.replaceWith(userGrid.cloneNode(true));
    }

    // Clear data
    this.users = [];
    this.currentUser = null;
  }
}
