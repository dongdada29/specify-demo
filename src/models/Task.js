// Task model for Taskify
export class Task {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.status = data.status || TaskStatus.ToDo;
    this.projectId = data.projectId || null;
    this.assignedUserId = data.assignedUserId || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.order = data.order || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  // Validation methods
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (this.title && this.title.length > 200) {
      errors.push('Title cannot exceed 200 characters');
    }

    if (this.description && this.description.length > 2000) {
      errors.push('Description cannot exceed 2000 characters');
    }

    if (!Object.values(TaskStatus).includes(this.status)) {
      errors.push('Invalid status');
    }

    if (!this.projectId) {
      errors.push('Project ID is required');
    }

    if (this.order < 0) {
      errors.push('Order must be non-negative');
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
      title: this.title,
      description: this.description,
      status: this.status,
      projectId: this.projectId,
      assignedUserId: this.assignedUserId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      order: this.order,
      isActive: this.isActive,
    };
  }

  static fromJSON(data) {
    return new Task(data);
  }

  // Comparison methods
  equals(other) {
    if (!other || !(other instanceof Task)) {
      return false;
    }
    return this.id === other.id;
  }

  // Update methods
  update(data) {
    if (data.title !== undefined) {
      this.title = data.title;
    }
    if (data.description !== undefined) {
      this.description = data.description;
    }
    if (data.status !== undefined) {
      this.status = data.status;
    }
    if (data.assignedUserId !== undefined) {
      this.assignedUserId = data.assignedUserId;
    }
    if (data.order !== undefined) {
      this.order = data.order;
    }
    this.updatedAt = new Date().toISOString();
  }

  // Status methods
  isAssigned() {
    return this.assignedUserId !== null && this.assignedUserId !== undefined;
  }

  assign(userId) {
    this.assignedUserId = userId;
    this.updatedAt = new Date().toISOString();
  }

  unassign() {
    this.assignedUserId = null;
    this.updatedAt = new Date().toISOString();
  }

  // Status transition methods
  canTransitionTo(newStatus) {
    const validTransitions = {
      [TaskStatus.ToDo]: [TaskStatus.InProgress],
      [TaskStatus.InProgress]: [TaskStatus.InReview, TaskStatus.ToDo],
      [TaskStatus.InReview]: [TaskStatus.Done, TaskStatus.InProgress],
      [TaskStatus.Done]: [TaskStatus.InProgress],
    };

    return validTransitions[this.status]?.includes(newStatus) || false;
  }

  transitionTo(newStatus) {
    if (this.canTransitionTo(newStatus)) {
      this.status = newStatus;
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Display methods
  getDisplayTitle() {
    return this.title;
  }

  getStatusName() {
    return TaskStatusNames[this.status] || 'Unknown';
  }

  getShortDescription(maxLength = 100) {
    if (!this.description) {
      return '';
    }
    if (this.description.length <= maxLength) {
      return this.description;
    }
    return this.description.substring(0, maxLength) + '...';
  }

  // Status checks
  isToDo() {
    return this.status === TaskStatus.ToDo;
  }

  isInProgress() {
    return this.status === TaskStatus.InProgress;
  }

  isInReview() {
    return this.status === TaskStatus.InReview;
  }

  isDone() {
    return this.status === TaskStatus.Done;
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
}

// Task status enumeration
export const TaskStatus = {
  ToDo: 1,
  InProgress: 2,
  InReview: 3,
  Done: 4,
};

// Reverse mapping for status names
export const TaskStatusNames = {
  [TaskStatus.ToDo]: 'To Do',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.InReview]: 'In Review',
  [TaskStatus.Done]: 'Done',
};
