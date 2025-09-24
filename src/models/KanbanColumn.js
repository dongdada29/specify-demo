// KanbanColumn model for Taskify
export class KanbanColumn {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.order = data.order || 0;
    this.status = data.status || 1; // TaskStatus.ToDo
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  // Validation methods
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (this.name && this.name.length > 50) {
      errors.push('Name cannot exceed 50 characters');
    }

    if (this.order < 0) {
      errors.push('Order must be non-negative');
    }

    const validStatuses = [1, 2, 3, 4]; // TaskStatus values
    if (!validStatuses.includes(this.status)) {
      errors.push('Invalid status');
    }

    return errors;
  }

  // Serialization methods
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      order: this.order,
      status: this.status,
      isActive: this.isActive,
    };
  }

  static fromJSON(data) {
    return new KanbanColumn(data);
  }

  // Comparison methods
  equals(other) {
    if (!other || !(other instanceof KanbanColumn)) {
      return false;
    }
    return this.id === other.id;
  }

  // Update methods
  update(data) {
    if (data.name !== undefined) {
      this.name = data.name;
    }
    if (data.order !== undefined) {
      this.order = data.order;
    }
    if (data.status !== undefined) {
      this.status = data.status;
    }
  }

  // Display methods
  getDisplayName() {
    return this.name;
  }

  getStatusName() {
    const statusNames = {
      1: 'To Do',
      2: 'In Progress',
      3: 'In Review',
      4: 'Done',
    };
    return statusNames[this.status] || 'Unknown';
  }

  // Order methods
  moveUp() {
    if (this.order > 0) {
      this.order--;
    }
  }

  moveDown() {
    this.order++;
  }

  setOrder(newOrder) {
    if (newOrder >= 0) {
      this.order = newOrder;
    }
  }

  // Status methods
  isToDo() {
    return this.status === 1; // TaskStatus.ToDo
  }

  isInProgress() {
    return this.status === 2; // TaskStatus.InProgress
  }

  isInReview() {
    return this.status === 3; // TaskStatus.InReview
  }

  isDone() {
    return this.status === 4; // TaskStatus.Done
  }

  // Active status
  isActive() {
    return this.isActive === true;
  }

  activate() {
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }

  // Factory methods for default columns
  static createDefaultColumns() {
    return [
      new KanbanColumn({
        id: 1,
        name: 'To Do',
        order: 1,
        status: 1, // TaskStatus.ToDo
      }),
      new KanbanColumn({
        id: 2,
        name: 'In Progress',
        order: 2,
        status: 2, // TaskStatus.InProgress
      }),
      new KanbanColumn({
        id: 3,
        name: 'In Review',
        order: 3,
        status: 3, // TaskStatus.InReview
      }),
      new KanbanColumn({
        id: 4,
        name: 'Done',
        order: 4,
        status: 4, // TaskStatus.Done
      }),
    ];
  }

  // Utility methods
  static sortByOrder(columns) {
    return columns.sort((a, b) => a.order - b.order);
  }

  static getColumnByStatus(columns, status) {
    return columns.find(column => column.status === status);
  }

  static getNextOrder(columns) {
    if (columns.length === 0) {
      return 0;
    }
    return Math.max(...columns.map(col => col.order)) + 1;
  }
}

// Import TaskStatus for reference
import { TaskStatus, TaskStatusNames } from './Task.js';
