// Comment component for Taskify
export class CommentComponent {
  constructor(comment, options = {}) {
    this.comment = comment;
    this.options = {
      showActions: true,
      editable: true,
      deletable: true,
      ...options,
    };
    this.element = null;
    this.isEditing = false;
    this.onEdit = null;
    this.onDelete = null;
    this.onSave = null;
    this.onCancel = null;
  }

  // Create comment element
  create() {
    this.element = document.createElement('div');
    this.element.className = 'comment';
    this.element.dataset.commentId = this.comment.id;

    this.render();
    this.setupEventListeners();

    return this.element;
  }

  // Render comment content
  render() {
    if (!this.element) return;

    const canEdit = this.options.editable && this.comment.canEdit;
    const canDelete = this.options.deletable && this.comment.canDelete;

    this.element.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${this.comment.authorName || 'Unknown'}</span>
        <span class="comment-time">${this.comment.getRelativeCreatedAt ? this.comment.getRelativeCreatedAt() : 'Just now'}</span>
      </div>
      <div class="comment-content">${this.comment.content}</div>
      ${
        this.options.showActions && (canEdit || canDelete)
          ? `
        <div class="comment-actions">
          ${canEdit ? '<button class="btn btn-sm" data-action="edit">Edit</button>' : ''}
          ${canDelete ? '<button class="btn btn-sm" data-action="delete">Delete</button>' : ''}
        </div>
      `
          : ''
      }
    `;
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.element) return;

    this.element.addEventListener('click', e => {
      const action = e.target.dataset.action;

      switch (action) {
        case 'edit':
          e.stopPropagation();
          this.startEdit();
          break;
        case 'delete':
          e.stopPropagation();
          this.confirmDelete();
          break;
        case 'save':
          e.stopPropagation();
          this.saveEdit();
          break;
        case 'cancel':
          e.stopPropagation();
          this.cancelEdit();
          break;
      }
    });
  }

  // Start editing comment
  startEdit() {
    if (this.isEditing) return;

    this.isEditing = true;
    const contentElement = this.element.querySelector('.comment-content');
    const actionsElement = this.element.querySelector('.comment-actions');

    if (contentElement) {
      contentElement.innerHTML = `
        <textarea class="comment-edit-textarea" rows="3">${this.comment.content}</textarea>
      `;
    }

    if (actionsElement) {
      actionsElement.innerHTML = `
        <button class="btn btn-sm" data-action="save">Save</button>
        <button class="btn btn-sm" data-action="cancel">Cancel</button>
      `;
    }

    // Focus textarea
    const textarea = this.element.querySelector('.comment-edit-textarea');
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }

  // Save edited comment
  saveEdit() {
    const textarea = this.element.querySelector('.comment-edit-textarea');
    if (!textarea) return;

    const newContent = textarea.value.trim();
    if (!newContent) {
      this.showError('Comment cannot be empty');
      return;
    }

    if (newContent === this.comment.content) {
      this.cancelEdit();
      return;
    }

    if (this.onSave) {
      this.onSave(this.comment.id, newContent);
    } else {
      // Default behavior - just update locally
      this.comment.content = newContent;
      this.finishEdit();
    }
  }

  // Cancel editing
  cancelEdit() {
    this.isEditing = false;
    this.finishEdit();
  }

  // Finish editing (restore normal view)
  finishEdit() {
    const contentElement = this.element.querySelector('.comment-content');
    const actionsElement = this.element.querySelector('.comment-actions');

    if (contentElement) {
      contentElement.textContent = this.comment.content;
    }

    if (actionsElement) {
      const canEdit = this.options.editable && this.comment.canEdit;
      const canDelete = this.options.deletable && this.comment.canDelete;

      actionsElement.innerHTML = '';
      if (canEdit) {
        actionsElement.innerHTML +=
          '<button class="btn btn-sm" data-action="edit">Edit</button>';
      }
      if (canDelete) {
        actionsElement.innerHTML +=
          '<button class="btn btn-sm" data-action="delete">Delete</button>';
      }
    }
  }

  // Confirm delete
  confirmDelete() {
    if (confirm('Are you sure you want to delete this comment?')) {
      if (this.onDelete) {
        this.onDelete(this.comment.id);
      } else {
        // Default behavior - just remove from DOM
        this.remove();
      }
    }
  }

  // Update comment data
  updateComment(comment) {
    this.comment = comment;
    this.render();
  }

  // Update content
  updateContent(content) {
    this.comment.content = content;
    const contentElement = this.element.querySelector('.comment-content');
    if (contentElement) {
      contentElement.textContent = content;
    }
  }

  // Show error message
  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'comment-error';
    errorElement.textContent = message;

    this.element.appendChild(errorElement);

    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.parentNode.removeChild(errorElement);
      }
    }, 3000);
  }

  // Show success message
  showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'comment-success';
    successElement.textContent = message;

    this.element.appendChild(successElement);

    setTimeout(() => {
      if (successElement.parentNode) {
        successElement.parentNode.removeChild(successElement);
      }
    }, 2000);
  }

  // Highlight comment
  highlight() {
    this.element.classList.add('highlighted');
    setTimeout(() => {
      this.element.classList.remove('highlighted');
    }, 2000);
  }

  // Set edit handler
  setOnEdit(callback) {
    this.onEdit = callback;
  }

  // Set delete handler
  setOnDelete(callback) {
    this.onDelete = callback;
  }

  // Set save handler
  setOnSave(callback) {
    this.onSave = callback;
  }

  // Set cancel handler
  setOnCancel(callback) {
    this.onCancel = callback;
  }

  // Get comment data
  getComment() {
    return this.comment;
  }

  // Get element
  getElement() {
    return this.element;
  }

  // Get comment ID
  getCommentId() {
    return this.comment.id;
  }

  // Check if comment is being edited
  isBeingEdited() {
    return this.isEditing;
  }

  // Check if comment can be edited
  canEdit() {
    return this.options.editable && this.comment.canEdit;
  }

  // Check if comment can be deleted
  canDelete() {
    return this.options.deletable && this.comment.canDelete;
  }

  // Remove from DOM
  remove() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  // Cleanup
  destroy() {
    if (this.element) {
      this.element.remove();
    }

    this.element = null;
    this.comment = null;
    this.isEditing = false;
    this.onEdit = null;
    this.onDelete = null;
    this.onSave = null;
    this.onCancel = null;
  }
}
