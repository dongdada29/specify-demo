// Task detail modal component for Taskify
export class TaskDetailModal {
  constructor() {
    this.modal = null;
    this.currentTask = null;
    this.onUpdate = null;
    this.onClose = null;
  }

  // Initialize the modal
  init() {
    this.modal = document.getElementById('task-modal');
    if (!this.modal) {
      console.error('Task modal element not found');
      return;
    }

    this.setupEventListeners();
  }

  // Setup event listeners
  setupEventListeners() {
    const closeBtn = document.getElementById('close-modal');
    const assigneeSelect = document.getElementById('task-assignee');
    const addCommentBtn = document.getElementById('add-comment');
    const newCommentTextarea = document.getElementById('new-comment');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    if (assigneeSelect) {
      assigneeSelect.addEventListener('change', e => {
        this.handleAssigneeChange(e.target.value);
      });
    }

    if (addCommentBtn) {
      addCommentBtn.addEventListener('click', () => {
        this.handleAddComment();
      });
    }

    if (newCommentTextarea) {
      newCommentTextarea.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleAddComment();
        }
      });
    }

    // Close modal when clicking outside
    this.modal.addEventListener('click', e => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  // Show modal with task data
  show(task, users = []) {
    if (!this.modal) {
      console.error('Modal not initialized');
      return;
    }

    this.currentTask = task;
    this.populateModal(task, users);
    this.modal.classList.add('active');

    // Focus on first input
    const firstInput = this.modal.querySelector('input, textarea, select');
    if (firstInput) {
      firstInput.focus();
    }
  }

  // Close modal
  close() {
    if (this.modal) {
      this.modal.classList.remove('active');
    }

    if (this.onClose) {
      this.onClose();
    }

    this.currentTask = null;
  }

  // Check if modal is open
  isOpen() {
    return this.modal && this.modal.classList.contains('active');
  }

  // Populate modal with task data
  populateModal(task, users) {
    const titleElement = document.getElementById('task-title');
    const descriptionElement = document.getElementById('task-description');
    const assigneeSelect = document.getElementById('task-assignee');

    if (titleElement) {
      titleElement.textContent = task.title;
    }

    if (descriptionElement) {
      descriptionElement.textContent = task.description || 'No description';
    }

    if (assigneeSelect) {
      this.populateAssigneeSelect(assigneeSelect, users, task.assignedUserId);
    }

    // Load comments
    this.loadComments(task.id);
  }

  // Populate assignee select
  populateAssigneeSelect(select, users, currentAssigneeId) {
    select.innerHTML = '<option value="">Unassigned</option>';

    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.name;
      if (user.id === currentAssigneeId) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  // Load comments for task
  async loadComments(taskId) {
    try {
      const commentList = document.getElementById('comment-list');
      if (!commentList) return;

      // This would typically call a service to get comments
      // For now, we'll show a placeholder
      commentList.innerHTML = '<div class="loading">Loading comments...</div>';

      // Simulate loading comments
      setTimeout(() => {
        commentList.innerHTML =
          '<div class="no-comments">No comments yet</div>';
      }, 500);
    } catch (error) {
      console.error('Error loading comments:', error);
      const commentList = document.getElementById('comment-list');
      if (commentList) {
        commentList.innerHTML =
          '<div class="error">Failed to load comments</div>';
      }
    }
  }

  // Handle assignee change
  handleAssigneeChange(userId) {
    if (!this.currentTask) return;

    const userIdInt = userId ? parseInt(userId) : null;

    if (this.onUpdate) {
      this.onUpdate('assignment', {
        taskId: this.currentTask.id,
        assignedUserId: userIdInt,
      });
    }
  }

  // Handle add comment
  handleAddComment() {
    const textarea = document.getElementById('new-comment');
    if (!textarea) return;

    const content = textarea.value.trim();
    if (!content) {
      this.showError('Comment cannot be empty');
      return;
    }

    if (this.onUpdate) {
      this.onUpdate('comment', {
        taskId: this.currentTask.id,
        content: content,
      });
    }

    // Clear textarea
    textarea.value = '';
  }

  // Show error message
  showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;

    // Add to modal
    const modalBody = this.modal.querySelector('.modal-body');
    if (modalBody) {
      modalBody.appendChild(notification);

      // Remove after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
  }

  // Show success message
  showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;

    const modalBody = this.modal.querySelector('.modal-body');
    if (modalBody) {
      modalBody.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
  }

  // Update task data
  updateTask(task) {
    this.currentTask = task;
    this.populateModal(task);
  }

  // Add comment to UI
  addComment(comment) {
    const commentList = document.getElementById('comment-list');
    if (!commentList) return;

    // Remove "no comments" message if present
    const noComments = commentList.querySelector('.no-comments');
    if (noComments) {
      noComments.remove();
    }

    // Create comment element
    const commentElement = this.createCommentElement(comment);
    commentList.insertAdjacentHTML('beforeend', commentElement);
  }

  // Create comment element
  createCommentElement(comment) {
    return `
      <div class="comment" data-comment-id="${comment.id}">
        <div class="comment-header">
          <span class="comment-author">${comment.authorName}</span>
          <span class="comment-time">${comment.getRelativeCreatedAt ? comment.getRelativeCreatedAt() : 'Just now'}</span>
        </div>
        <div class="comment-content">${comment.content}</div>
        <div class="comment-actions">
          <button class="btn btn-sm" data-action="edit-comment">Edit</button>
          <button class="btn btn-sm" data-action="delete-comment">Delete</button>
        </div>
      </div>
    `;
  }

  // Set update callback
  setOnUpdate(callback) {
    this.onUpdate = callback;
  }

  // Set close callback
  setOnClose(callback) {
    this.onClose = callback;
  }

  // Get current task
  getCurrentTask() {
    return this.currentTask;
  }

  // Cleanup
  destroy() {
    if (this.modal) {
      this.modal.classList.remove('active');
    }

    this.currentTask = null;
    this.onUpdate = null;
    this.onClose = null;
  }
}
