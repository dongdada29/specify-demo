// User assignment component for Taskify
export class UserAssignment {
  constructor(users = [], options = {}) {
    this.users = users;
    this.options = {
      showUnassigned: true,
      showUserAvatars: true,
      showUserRoles: true,
      ...options,
    };
    this.element = null;
    this.currentUserId = null;
    this.onChange = null;
  }

  // Create user assignment element
  create() {
    this.element = document.createElement('div');
    this.element.className = 'user-assignment';

    this.render();
    this.setupEventListeners();

    return this.element;
  }

  // Render user assignment content
  render() {
    if (!this.element) return;

    this.element.innerHTML = `
      <label for="user-assignment-select">Assign to:</label>
      <select id="user-assignment-select" class="user-assignment-select">
        ${this.options.showUnassigned ? '<option value="">Unassigned</option>' : ''}
        ${this.users.map(user => this.createUserOption(user)).join('')}
      </select>
    `;
  }

  // Create user option element
  createUserOption(user) {
    const avatar = this.options.showUserAvatars
      ? `<span class="user-avatar" style="background-color: ${user.color}">${user.getInitials ? user.getInitials() : user.name.charAt(0)}</span>`
      : '';

    const role = this.options.showUserRoles
      ? `<span class="user-role">${user.getRoleName ? user.getRoleName() : 'User'}</span>`
      : '';

    return `
      <option value="${user.id}" ${user.id === this.currentUserId ? 'selected' : ''}>
        ${avatar}${user.name}${role}
      </option>
    `;
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.element) return;

    const select = this.element.querySelector('.user-assignment-select');
    if (select) {
      select.addEventListener('change', e => {
        const userId = e.target.value ? parseInt(e.target.value) : null;
        this.setCurrentUser(userId);

        if (this.onChange) {
          this.onChange(userId);
        }
      });
    }
  }

  // Set current user
  setCurrentUser(userId) {
    this.currentUserId = userId;
    const select = this.element.querySelector('.user-assignment-select');
    if (select) {
      select.value = userId || '';
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUserId;
  }

  // Get current user data
  getCurrentUserData() {
    if (!this.currentUserId) return null;
    return this.users.find(user => user.id === this.currentUserId);
  }

  // Update users list
  updateUsers(users) {
    this.users = users;
    this.render();
    this.setupEventListeners();
  }

  // Add user
  addUser(user) {
    this.users.push(user);
    this.render();
    this.setupEventListeners();
  }

  // Remove user
  removeUser(userId) {
    this.users = this.users.filter(user => user.id !== userId);
    this.render();
    this.setupEventListeners();
  }

  // Clear selection
  clear() {
    this.setCurrentUser(null);
  }

  // Disable component
  disable() {
    const select = this.element.querySelector('.user-assignment-select');
    if (select) {
      select.disabled = true;
    }
  }

  // Enable component
  enable() {
    const select = this.element.querySelector('.user-assignment-select');
    if (select) {
      select.disabled = false;
    }
  }

  // Set change handler
  setOnChange(callback) {
    this.onChange = callback;
  }

  // Get element
  getElement() {
    return this.element;
  }

  // Get users
  getUsers() {
    return this.users;
  }

  // Check if user is assigned
  isAssigned() {
    return this.currentUserId !== null;
  }

  // Check if specific user is assigned
  isUserAssigned(userId) {
    return this.currentUserId === userId;
  }

  // Get assigned user name
  getAssignedUserName() {
    const user = this.getCurrentUserData();
    return user ? user.name : null;
  }

  // Get assigned user color
  getAssignedUserColor() {
    const user = this.getCurrentUserData();
    return user ? user.color : null;
  }

  // Focus component
  focus() {
    const select = this.element.querySelector('.user-assignment-select');
    if (select) {
      select.focus();
    }
  }

  // Show validation error
  showError(message) {
    // Remove existing error
    this.hideError();

    const errorElement = document.createElement('div');
    errorElement.className = 'user-assignment-error';
    errorElement.textContent = message;

    this.element.appendChild(errorElement);
  }

  // Hide validation error
  hideError() {
    const errorElement = this.element.querySelector('.user-assignment-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  // Validate selection
  validate() {
    if (this.options.required && !this.isAssigned()) {
      this.showError('Please select a user');
      return false;
    }

    this.hideError();
    return true;
  }

  // Reset to default state
  reset() {
    this.clear();
    this.hideError();
  }

  // Cleanup
  destroy() {
    if (this.element) {
      this.element.remove();
    }

    this.element = null;
    this.users = [];
    this.currentUserId = null;
    this.onChange = null;
  }
}
