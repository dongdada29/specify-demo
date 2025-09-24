// User model for Taskify
export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.role = data.role || UserRole.Engineer;
    this.color = data.color || '#6b7280';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  // Validation methods
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (this.name && this.name.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }

    if (!Object.values(UserRole).includes(this.role)) {
      errors.push('Invalid role');
    }

    if (!this.isValidColor(this.color)) {
      errors.push('Invalid color format');
    }

    return errors;
  }

  isValidColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  // Serialization methods
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      color: this.color,
      createdAt: this.createdAt,
      isActive: this.isActive,
    };
  }

  static fromJSON(data) {
    return new User(data);
  }

  // Comparison methods
  equals(other) {
    if (!other || !(other instanceof User)) {
      return false;
    }
    return this.id === other.id;
  }

  // Display methods
  getDisplayName() {
    return this.name;
  }

  getRoleName() {
    return UserRole[this.role] || 'Unknown';
  }

  getInitials() {
    return this.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}

// User role enumeration
export const UserRole = {
  ProductManager: 1,
  Engineer: 2,
};

// Reverse mapping for role names
export const UserRoleNames = {
  [UserRole.ProductManager]: 'Product Manager',
  [UserRole.Engineer]: 'Engineer',
};
