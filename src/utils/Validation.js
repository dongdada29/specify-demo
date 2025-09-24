// Validation utilities for Taskify
export class Validation {
  // Email validation
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Hex color validation
  static isValidHexColor(color) {
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    return hexColorRegex.test(color);
  }

  // URL validation
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // String validation
  static isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  static isValidStringLength(value, minLength = 0, maxLength = Infinity) {
    if (typeof value !== 'string') return false;
    return value.length >= minLength && value.length <= maxLength;
  }

  // Number validation
  static isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  static isValidInteger(value) {
    return Number.isInteger(value);
  }

  static isValidPositiveNumber(value) {
    return this.isValidNumber(value) && value > 0;
  }

  static isValidNonNegativeNumber(value) {
    return this.isValidNumber(value) && value >= 0;
  }

  // Date validation
  static isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  }

  static isValidISODate(dateString) {
    const date = new Date(dateString);
    return this.isValidDate(date) && date.toISOString() === dateString;
  }

  // Array validation
  static isValidArray(value) {
    return Array.isArray(value);
  }

  static isValidNonEmptyArray(value) {
    return this.isValidArray(value) && value.length > 0;
  }

  // Object validation
  static isValidObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  // ID validation
  static isValidId(id) {
    return this.isValidPositiveInteger(id);
  }

  static isValidPositiveInteger(value) {
    return this.isValidInteger(value) && value > 0;
  }

  // Task validation
  static validateTaskData(data) {
    const errors = [];

    if (!this.isNonEmptyString(data.title)) {
      errors.push('Title is required');
    } else if (!this.isValidStringLength(data.title, 1, 200)) {
      errors.push('Title must be between 1 and 200 characters');
    }

    if (
      data.description &&
      !this.isValidStringLength(data.description, 0, 2000)
    ) {
      errors.push('Description cannot exceed 2000 characters');
    }

    if (!this.isValidId(data.projectId)) {
      errors.push('Valid project ID is required');
    }

    if (data.assignedUserId && !this.isValidId(data.assignedUserId)) {
      errors.push('Assigned user ID must be a valid positive integer');
    }

    if (data.status && !this.isValidTaskStatus(data.status)) {
      errors.push('Invalid task status');
    }

    if (
      data.order !== undefined &&
      !this.isValidNonNegativeNumber(data.order)
    ) {
      errors.push('Order must be a non-negative number');
    }

    return errors;
  }

  static isValidTaskStatus(status) {
    const validStatuses = [1, 2, 3, 4]; // ToDo, InProgress, InReview, Done
    return validStatuses.includes(status);
  }

  // User validation
  static validateUserData(data) {
    const errors = [];

    if (!this.isNonEmptyString(data.name)) {
      errors.push('Name is required');
    } else if (!this.isValidStringLength(data.name, 1, 100)) {
      errors.push('Name must be between 1 and 100 characters');
    }

    if (!this.isValidUserRole(data.role)) {
      errors.push('Valid role is required');
    }

    if (!this.isValidHexColor(data.color)) {
      errors.push('Valid hex color is required (e.g., #FF6B6B)');
    }

    return errors;
  }

  static isValidUserRole(role) {
    const validRoles = [1, 2]; // ProductManager, Engineer
    return validRoles.includes(role);
  }

  // Project validation
  static validateProjectData(data) {
    const errors = [];

    if (!this.isNonEmptyString(data.name)) {
      errors.push('Name is required');
    } else if (!this.isValidStringLength(data.name, 1, 200)) {
      errors.push('Name must be between 1 and 200 characters');
    }

    if (
      data.description &&
      !this.isValidStringLength(data.description, 0, 1000)
    ) {
      errors.push('Description cannot exceed 1000 characters');
    }

    return errors;
  }

  // Comment validation
  static validateCommentData(data) {
    const errors = [];

    if (!this.isNonEmptyString(data.content)) {
      errors.push('Content is required');
    } else if (!this.isValidStringLength(data.content, 1, 2000)) {
      errors.push('Content must be between 1 and 2000 characters');
    }

    if (!this.isValidId(data.taskId)) {
      errors.push('Valid task ID is required');
    }

    if (!this.isValidId(data.authorId)) {
      errors.push('Valid author ID is required');
    }

    return errors;
  }

  // Form validation
  static validateForm(formData, rules) {
    const errors = {};

    for (const [field, rule] of Object.entries(rules)) {
      const value = formData[field];
      const fieldErrors = [];

      if (
        rule.required &&
        (value === undefined || value === null || value === '')
      ) {
        fieldErrors.push(`${rule.label || field} is required`);
      }

      if (value !== undefined && value !== null && value !== '') {
        if (rule.type === 'email' && !this.isValidEmail(value)) {
          fieldErrors.push(`${rule.label || field} must be a valid email`);
        }

        if (rule.type === 'url' && !this.isValidUrl(value)) {
          fieldErrors.push(`${rule.label || field} must be a valid URL`);
        }

        if (rule.type === 'hexColor' && !this.isValidHexColor(value)) {
          fieldErrors.push(`${rule.label || field} must be a valid hex color`);
        }

        if (
          rule.minLength &&
          !this.isValidStringLength(value, rule.minLength)
        ) {
          fieldErrors.push(
            `${rule.label || field} must be at least ${rule.minLength} characters`
          );
        }

        if (
          rule.maxLength &&
          !this.isValidStringLength(value, 0, rule.maxLength)
        ) {
          fieldErrors.push(
            `${rule.label || field} cannot exceed ${rule.maxLength} characters`
          );
        }

        if (rule.min && value < rule.min) {
          fieldErrors.push(
            `${rule.label || field} must be at least ${rule.min}`
          );
        }

        if (rule.max && value > rule.max) {
          fieldErrors.push(`${rule.label || field} cannot exceed ${rule.max}`);
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          fieldErrors.push(`${rule.label || field} format is invalid`);
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return errors;
  }

  // Sanitization
  static sanitizeString(value) {
    if (typeof value !== 'string') return value;
    return value.trim();
  }

  static sanitizeHtml(value) {
    if (typeof value !== 'string') return value;
    // Basic HTML sanitization - remove script tags and dangerous attributes
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
  }

  static sanitizeInput(value) {
    if (typeof value !== 'string') return value;
    return this.sanitizeHtml(this.sanitizeString(value));
  }

  // Common validation patterns
  static patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    hexColor: /^#[0-9A-F]{6}$/i,
    url: /^https?:\/\/.+/,
    phone: /^\+?[\d\s\-\(\)]+$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
    username: /^[a-zA-Z0-9_]+$/,
    slug: /^[a-z0-9\-]+$/,
  };

  // Validation result helpers
  static hasErrors(validationResult) {
    if (Array.isArray(validationResult)) {
      return validationResult.length > 0;
    }
    if (typeof validationResult === 'object') {
      return Object.keys(validationResult).length > 0;
    }
    return false;
  }

  static getFirstError(validationResult) {
    if (Array.isArray(validationResult)) {
      return validationResult[0];
    }
    if (typeof validationResult === 'object') {
      const firstField = Object.keys(validationResult)[0];
      return validationResult[firstField][0];
    }
    return null;
  }

  static getAllErrors(validationResult) {
    if (Array.isArray(validationResult)) {
      return validationResult;
    }
    if (typeof validationResult === 'object') {
      const allErrors = [];
      Object.values(validationResult).forEach(errors => {
        allErrors.push(...errors);
      });
      return allErrors;
    }
    return [];
  }
}
