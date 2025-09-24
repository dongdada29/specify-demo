// WebSocket service for real-time updates in Taskify
export class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = 'ws://localhost:3001';
    this.reconnectInterval = 5000;
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = 0;
    this.isConnected = false;
    this.listeners = new Map();
    this.messageQueue = [];
  }

  // Connect to WebSocket server
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = event => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.processMessageQueue();
          this.emit('connected', event);
          resolve();
        };

        this.ws.onmessage = event => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = event => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.emit('disconnected', event);
          this.handleReconnect();
        };

        this.ws.onerror = error => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  // Send message to server
  send(message) {
    if (this.isConnected && this.ws) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        this.messageQueue.push(message);
      }
    } else {
      this.messageQueue.push(message);
    }
  }

  // Process queued messages
  processMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'task_updated':
        this.emit('taskUpdated', payload);
        break;
      case 'task_created':
        this.emit('taskCreated', payload);
        break;
      case 'task_deleted':
        this.emit('taskDeleted', payload);
        break;
      case 'task_assigned':
        this.emit('taskAssigned', payload);
        break;
      case 'task_unassigned':
        this.emit('taskUnassigned', payload);
        break;
      case 'comment_created':
        this.emit('commentCreated', payload);
        break;
      case 'comment_updated':
        this.emit('commentUpdated', payload);
        break;
      case 'comment_deleted':
        this.emit('commentDeleted', payload);
        break;
      case 'project_updated':
        this.emit('projectUpdated', payload);
        break;
      case 'user_online':
        this.emit('userOnline', payload);
        break;
      case 'user_offline':
        this.emit('userOffline', payload);
        break;
      case 'notification_created':
        this.emit('notificationCreated', payload);
        break;
      default:
        console.warn('Unknown WebSocket message type:', type);
    }
  }

  // Handle reconnection
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in WebSocket event listener for ${event}:`,
            error
          );
        }
      });
    }
  }

  // Specific message sending methods
  sendTaskUpdate(task) {
    this.send({
      type: 'task_updated',
      payload: task,
    });
  }

  sendTaskCreated(task) {
    this.send({
      type: 'task_created',
      payload: task,
    });
  }

  sendTaskDeleted(taskId) {
    this.send({
      type: 'task_deleted',
      payload: { id: taskId },
    });
  }

  sendTaskAssigned(taskId, userId) {
    this.send({
      type: 'task_assigned',
      payload: { taskId, userId },
    });
  }

  sendTaskUnassigned(taskId) {
    this.send({
      type: 'task_unassigned',
      payload: { taskId },
    });
  }

  sendCommentCreated(comment) {
    this.send({
      type: 'comment_created',
      payload: comment,
    });
  }

  sendCommentUpdated(comment) {
    this.send({
      type: 'comment_updated',
      payload: comment,
    });
  }

  sendCommentDeleted(commentId) {
    this.send({
      type: 'comment_deleted',
      payload: { id: commentId },
    });
  }

  sendProjectUpdate(project) {
    this.send({
      type: 'project_updated',
      payload: project,
    });
  }

  sendUserOnline(userId) {
    this.send({
      type: 'user_online',
      payload: { userId },
    });
  }

  sendUserOffline(userId) {
    this.send({
      type: 'user_offline',
      payload: { userId },
    });
  }

  sendNotification(notification) {
    this.send({
      type: 'notification_created',
      payload: notification,
    });
  }

  // Connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }

  // Ping server to check connection
  ping() {
    this.send({
      type: 'ping',
      payload: { timestamp: Date.now() },
    });
  }

  // Set reconnection parameters
  setReconnectionParams(interval, maxAttempts) {
    this.reconnectInterval = interval;
    this.maxReconnectAttempts = maxAttempts;
  }

  // Clear all listeners
  clearListeners() {
    this.listeners.clear();
  }
}
