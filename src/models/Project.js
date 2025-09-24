// Project model for Taskify
export class Project {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  // Validation methods
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (this.name && this.name.length > 200) {
      errors.push('Name cannot exceed 200 characters');
    }

    if (this.description && this.description.length > 1000) {
      errors.push('Description cannot exceed 1000 characters');
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
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }

  static fromJSON(data) {
    return new Project(data);
  }

  // Comparison methods
  equals(other) {
    if (!other || !(other instanceof Project)) {
      return false;
    }
    return this.id === other.id;
  }

  // Update methods
  update(data) {
    if (data.name !== undefined) {
      this.name = data.name;
    }
    if (data.description !== undefined) {
      this.description = data.description;
    }
    this.updatedAt = new Date().toISOString();
  }

  // Display methods
  getDisplayName() {
    return this.name;
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

  // Status methods
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
