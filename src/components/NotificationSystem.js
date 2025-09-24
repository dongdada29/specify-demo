// Notification system component for Taskify
export class NotificationSystem {
  constructor(options = {}) {
    this.options = {
      position: 'top-right',
      duration: 5000,
      maxNotifications: 5,
      showProgress: true,
      ...options,
    };
    this.notifications = [];
    this.container = null;
    this.onClick = null;
    this.onClose = null;
  }

  // Initialize notification system
  init() {
    this.createContainer();
    this.setupEventListeners();
  }

  // Create notification container
  createContainer() {
    this.container = document.getElementById('notifications');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notifications';
      this.container.className = `notifications notifications-${this.options.position}`;
      document.body.appendChild(this.container);
    }
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.container) return;

    this.container.addEventListener('click', e => {
      const notification = e.target.closest('.notification');
      if (notification) {
        const notificationId = notification.dataset.notificationId;
        if (this.onClick) {
          this.onClick(notificationId);
        }
      }
    });
  }

  // Show notification
  show(message, type = 'info', options = {}) {
    const notification = {
      id: this.generateId(),
      message,
      type,
      timestamp: Date.now(),
      duration: options.duration || this.options.duration,
      persistent: options.persistent || false,
      actions: options.actions || [],
      data: options.data || null,
    };

    this.notifications.push(notification);
    this.renderNotification(notification);
    this.cleanupOldNotifications();

    return notification.id;
  }

  // Show success notification
  showSuccess(message, options = {}) {
    return this.show(message, 'success', options);
  }

  // Show error notification
  showError(message, options = {}) {
    return this.show(message, 'error', { ...options, duration: 7000 });
  }

  // Show warning notification
  showWarning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  // Show info notification
  showInfo(message, options = {}) {
    return this.show(message, 'info', options);
  }

  // Render notification element
  renderNotification(notification) {
    const element = document.createElement('div');
    element.className = `notification notification-${notification.type}`;
    element.dataset.notificationId = notification.id;

    const progressBar = this.options.showProgress
      ? '<div class="notification-progress"></div>'
      : '';

    const actions =
      notification.actions.length > 0
        ? `<div class="notification-actions">${notification.actions
            .map(
              action =>
                `<button class="btn btn-sm" data-action="${action.action}">${action.label}</button>`
            )
            .join('')}</div>`
        : '';

    element.innerHTML = `
      <div class="notification-content">
        <div class="notification-message">${notification.message}</div>
        ${actions}
      </div>
      <button class="notification-close" data-action="close">&times;</button>
      ${progressBar}
    `;

    // Add click handler for close button
    const closeBtn = element.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.close(notification.id);
      });
    }

    // Add click handlers for action buttons
    element.querySelectorAll('[data-action]').forEach(btn => {
      if (btn.dataset.action !== 'close') {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          this.handleAction(notification.id, btn.dataset.action);
        });
      }
    });

    this.container.appendChild(element);

    // Animate in
    setTimeout(() => {
      element.classList.add('show');
    }, 10);

    // Auto-close if not persistent
    if (!notification.persistent) {
      this.autoClose(notification.id, notification.duration);
    }
  }

  // Auto-close notification
  autoClose(notificationId, duration) {
    setTimeout(() => {
      this.close(notificationId);
    }, duration);
  }

  // Close notification
  close(notificationId) {
    const element = this.container.querySelector(
      `[data-notification-id="${notificationId}"]`
    );
    if (element) {
      element.classList.add('hide');
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 300);
    }

    // Remove from notifications array
    this.notifications = this.notifications.filter(
      n => n.id !== notificationId
    );

    if (this.onClose) {
      this.onClose(notificationId);
    }
  }

  // Close all notifications
  closeAll() {
    this.notifications.forEach(notification => {
      this.close(notification.id);
    });
  }

  // Handle action
  handleAction(notificationId, action) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      const actionConfig = notification.actions.find(a => a.action === action);
      if (actionConfig && actionConfig.handler) {
        actionConfig.handler(notificationId, action);
      }
    }
  }

  // Cleanup old notifications
  cleanupOldNotifications() {
    if (this.notifications.length > this.options.maxNotifications) {
      const oldest = this.notifications[0];
      this.close(oldest.id);
    }
  }

  // Generate unique ID
  generateId() {
    return (
      'notification-' +
      Date.now() +
      '-' +
      Math.random().toString(36).substr(2, 9)
    );
  }

  // Show task assignment notification
  showTaskAssigned(taskTitle, userName) {
    return this.showSuccess(
      `Task "${taskTitle}" has been assigned to ${userName}`,
      {
        actions: [
          {
            action: 'view',
            label: 'View Task',
            handler: id => {
              // Handle view task action
              this.close(id);
            },
          },
        ],
      }
    );
  }

  // Show task status change notification
  showTaskStatusChanged(taskTitle, oldStatus, newStatus) {
    return this.showInfo(
      `Task "${taskTitle}" moved from ${oldStatus} to ${newStatus}`,
      {
        duration: 3000,
      }
    );
  }

  // Show comment added notification
  showCommentAdded(taskTitle, authorName) {
    return this.showInfo(`${authorName} added a comment to "${taskTitle}"`, {
      actions: [
        {
          action: 'view',
          label: 'View Comment',
          handler: id => {
            // Handle view comment action
            this.close(id);
          },
        },
      ],
    });
  }

  // Show user online notification
  showUserOnline(userName) {
    return this.showInfo(`${userName} is now online`, {
      duration: 2000,
    });
  }

  // Show user offline notification
  showUserOffline(userName) {
    return this.showWarning(`${userName} is now offline`, {
      duration: 2000,
    });
  }

  // Show connection status notification
  showConnectionStatus(connected) {
    if (connected) {
      return this.showSuccess('Connected to server', { duration: 2000 });
    } else {
      return this.showError('Disconnected from server', { persistent: true });
    }
  }

  // Set click handler
  setOnClick(callback) {
    this.onClick = callback;
  }

  // Set close handler
  setOnClose(callback) {
    this.onClose = callback;
  }

  // Get notifications count
  getCount() {
    return this.notifications.length;
  }

  // Get all notifications
  getAll() {
    return this.notifications;
  }

  // Check if notification exists
  exists(notificationId) {
    return this.notifications.some(n => n.id === notificationId);
  }

  // Update notification
  update(notificationId, updates) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      Object.assign(notification, updates);
      this.renderNotification(notification);
    }
  }

  // Cleanup
  destroy() {
    this.closeAll();

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.notifications = [];
    this.onClick = null;
    this.onClose = null;
  }
}
