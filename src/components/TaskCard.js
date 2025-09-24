// Task card component for Taskify
export class TaskCard {
  constructor(task, options = {}) {
    this.task = task;
    this.options = {
      showActions: true,
      draggable: true,
      clickable: true,
      ...options,
    };
    this.element = null;
    this.onClick = null;
    this.onEdit = null;
    this.onDelete = null;
    this.onAssign = null;
  }

  // Create task card element
  create() {
    this.element = document.createElement('div');
    this.element.className = 'task-card';
    this.element.dataset.taskId = this.task.id;
    this.element.dataset.status = this.task.status;

    // Add assigned class if task is assigned
    if (this.task.assignedUserId) {
      this.element.classList.add('assigned');
      if (this.task.assignedUserColor) {
        this.element.style.borderLeftColor = this.task.assignedUserColor;
      }
    }

    this.render();
    this.setupEventListeners();

    return this.element;
  }

  // Render task card content
  render() {
    if (!this.element) return;

    this.element.innerHTML = `
      <div class="task-title">${this.task.title}</div>
      <div class="task-description">${this.task.description || ''}</div>
      <div class="task-meta">
        <div class="task-assignee">
          ${
            this.task.assignedUserName
              ? `
            <div class="assignee-avatar" style="background-color: ${this.task.assignedUserColor || '#6b7280'}">
              ${this.task.assignedUserName.charAt(0).toUpperCase()}
            </div>
            <span>${this.task.assignedUserName}</span>
          `
              : '<span>Unassigned</span>'
          }
        </div>
        ${
          this.options.showActions
            ? `
          <div class="task-actions">
            <button class="btn btn-sm" data-action="edit">Edit</button>
            <button class="btn btn-sm" data-action="assign">Assign</button>
          </div>
        `
            : ''
        }
      </div>
    `;

    // Set draggable attribute
    if (this.options.draggable) {
      this.element.draggable = true;
    }

    // Set tabindex for keyboard navigation
    if (this.options.clickable) {
      this.element.tabIndex = 0;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.element) return;

    // Click handler
    if (this.options.clickable) {
      this.element.addEventListener('click', e => {
        // Don't trigger if clicking on action buttons
        if (e.target.closest('.task-actions')) {
          return;
        }

        if (this.onClick) {
          this.onClick(this.task);
        }
      });
    }

    // Action button handlers
    if (this.options.showActions) {
      this.element.addEventListener('click', e => {
        const action = e.target.dataset.action;

        switch (action) {
          case 'edit':
            e.stopPropagation();
            if (this.onEdit) {
              this.onEdit(this.task);
            }
            break;
          case 'assign':
            e.stopPropagation();
            if (this.onAssign) {
              this.onAssign(this.task);
            }
            break;
        }
      });
    }

    // Keyboard navigation
    this.element.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.onClick) {
          this.onClick(this.task);
        }
      }
    });

    // Drag events
    if (this.options.draggable) {
      this.element.addEventListener('dragstart', e => {
        this.element.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.task.id.toString());
      });

      this.element.addEventListener('dragend', e => {
        this.element.classList.remove('dragging');
      });
    }
  }

  // Update task data
  updateTask(task) {
    this.task = task;
    this.render();
  }

  // Update assignment
  updateAssignment(assignedUserId, assignedUserName, assignedUserColor) {
    this.task.assignedUserId = assignedUserId;
    this.task.assignedUserName = assignedUserName;
    this.task.assignedUserColor = assignedUserColor;

    // Update UI
    const assigneeElement = this.element.querySelector('.task-assignee');
    if (assigneeElement) {
      if (assignedUserName) {
        assigneeElement.innerHTML = `
          <div class="assignee-avatar" style="background-color: ${assignedUserColor || '#6b7280'}">
            ${assignedUserName.charAt(0).toUpperCase()}
          </div>
          <span>${assignedUserName}</span>
        `;
      } else {
        assigneeElement.innerHTML = '<span>Unassigned</span>';
      }
    }

    // Update assigned class
    if (assignedUserId) {
      this.element.classList.add('assigned');
      if (assignedUserColor) {
        this.element.style.borderLeftColor = assignedUserColor;
      }
    } else {
      this.element.classList.remove('assigned');
      this.element.style.borderLeftColor = '';
    }
  }

  // Update status
  updateStatus(status) {
    this.task.status = status;
    this.element.dataset.status = status;
  }

  // Update title
  updateTitle(title) {
    this.task.title = title;
    const titleElement = this.element.querySelector('.task-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  // Update description
  updateDescription(description) {
    this.task.description = description;
    const descriptionElement = this.element.querySelector('.task-description');
    if (descriptionElement) {
      descriptionElement.textContent = description || '';
    }
  }

  // Highlight task
  highlight() {
    this.element.classList.add('highlighted');
    setTimeout(() => {
      this.element.classList.remove('highlighted');
    }, 2000);
  }

  // Focus task
  focus() {
    this.element.focus();
  }

  // Set click handler
  setOnClick(callback) {
    this.onClick = callback;
  }

  // Set edit handler
  setOnEdit(callback) {
    this.onEdit = callback;
  }

  // Set delete handler
  setOnDelete(callback) {
    this.onDelete = callback;
  }

  // Set assign handler
  setOnAssign(callback) {
    this.onAssign = callback;
  }

  // Get task data
  getTask() {
    return this.task;
  }

  // Get element
  getElement() {
    return this.element;
  }

  // Check if task is assigned to user
  isAssignedToUser(userId) {
    return this.task.assignedUserId === userId;
  }

  // Check if task is in status
  isInStatus(status) {
    return this.task.status === status;
  }

  // Get task ID
  getTaskId() {
    return this.task.id;
  }

  // Get task status
  getStatus() {
    return this.task.status;
  }

  // Get assigned user ID
  getAssignedUserId() {
    return this.task.assignedUserId;
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
    this.task = null;
    this.onClick = null;
    this.onEdit = null;
    this.onDelete = null;
    this.onAssign = null;
  }
}
