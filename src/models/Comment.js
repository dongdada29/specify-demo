// Comment model for Taskify
export class Comment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.content = data.content || '';
    this.taskId = data.taskId || null;
    this.authorId = data.authorId || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  // Validation methods
  validate() {
    const errors = [];

    if (!this.content || this.content.trim().length === 0) {
      errors.push('Content is required');
    }

    if (this.content && this.content.length > 2000) {
      errors.push('Content cannot exceed 2000 characters');
    }

    if (!this.taskId) {
      errors.push('Task ID is required');
    }

    if (!this.authorId) {
      errors.push('Author ID is required');
    }

    if (this.createdAt && this.updatedAt) {
      const created = new Date(this.createdAt);
      const updated = new Date(this.updatedAt);
      if (created > updated) {
        errors.push('Created date cannot be after updated date');
      }
    }

    return errors;
  }

  // Serialization methods
  toJSON() {
    return {
      id: this.id,
      content: this.content,
      taskId: this.taskId,
      authorId: this.authorId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }

  static fromJSON(data) {
    return new Comment(data);
  }

  // Comparison methods
  equals(other) {
    if (!other || !(other instanceof Comment)) {
      return false;
    }
    return this.id === other.id;
  }

  // Update methods
  update(data) {
    if (data.content !== undefined) {
      this.content = data.content;
    }
    this.updatedAt = new Date().toISOString();
  }

  // Display methods
  getDisplayContent() {
    return this.content;
  }

  getShortContent(maxLength = 100) {
    if (this.content.length <= maxLength) {
      return this.content;
    }
    return this.content.substring(0, maxLength) + '...';
  }

  // Time formatting
  getFormattedCreatedAt() {
    const date = new Date(this.createdAt);
    return date.toLocaleString();
  }

  getRelativeCreatedAt() {
    const date = new Date(this.createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString();
  }

  // Permission methods
  canEdit(authorId) {
    return this.authorId === authorId;
  }

  canDelete(authorId) {
    return this.authorId === authorId;
  }

  // Active status
  isActive() {
    return this.isActive === true;
  }

  activate() {
    this.isActive = true;
    this.updatedAt = new Date().toISOString();
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date().toISOString();
  }

  // Content methods
  isEmpty() {
    return !this.content || this.content.trim().length === 0;
  }

  getWordCount() {
    if (!this.content) {
      return 0;
    }
    return this.content.trim().split(/\s+/).length;
  }

  getCharacterCount() {
    return this.content ? this.content.length : 0;
  }
}
