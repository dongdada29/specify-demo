// Drag and drop handler for Taskify Kanban board
export class DragDropHandler {
  constructor() {
    this.draggedElement = null;
    this.dragOverElement = null;
    this.isDragging = false;
    this.listeners = new Map();
  }

  // Initialize drag and drop for the application
  initialize() {
    this.setupDragAndDrop();
    this.setupTouchEvents();
  }

  // Setup drag and drop event listeners
  setupDragAndDrop() {
    // Make task cards draggable
    document.addEventListener('dragstart', this.handleDragStart.bind(this));
    document.addEventListener('dragend', this.handleDragEnd.bind(this));
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('dragenter', this.handleDragEnter.bind(this));
    document.addEventListener('dragleave', this.handleDragLeave.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
  }

  // Setup touch events for mobile devices
  setupTouchEvents() {
    let touchStartElement = null;
    let touchStartPosition = null;

    document.addEventListener('touchstart', e => {
      const taskCard = e.target.closest('.task-card');
      if (taskCard) {
        touchStartElement = taskCard;
        touchStartPosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        taskCard.classList.add('touch-dragging');
      }
    });

    document.addEventListener('touchmove', e => {
      if (touchStartElement && touchStartPosition) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartPosition.x;
        const deltaY = touch.clientY - touchStartPosition.y;

        // Only start drag if moved enough
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          this.startTouchDrag(touchStartElement, touch);
        }
      }
    });

    document.addEventListener('touchend', e => {
      if (touchStartElement) {
        touchStartElement.classList.remove('touch-dragging');
        touchStartElement = null;
        touchStartPosition = null;
      }
    });
  }

  // Handle drag start
  handleDragStart(e) {
    const taskCard = e.target.closest('.task-card');
    if (!taskCard) return;

    this.draggedElement = taskCard;
    this.isDragging = true;

    // Add dragging class
    taskCard.classList.add('dragging');

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskCard.dataset.taskId);

    // Emit drag start event
    this.emit('dragStart', {
      element: taskCard,
      taskId: taskCard.dataset.taskId,
    });
  }

  // Handle drag end
  handleDragEnd(e) {
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
      this.draggedElement = null;
    }

    this.isDragging = false;
    this.clearDragOverStates();

    // Emit drag end event
    this.emit('dragEnd', {
      element: e.target.closest('.task-card'),
    });
  }

  // Handle drag over
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  // Handle drag enter
  handleDragEnter(e) {
    const dropTarget = this.getDropTarget(e.target);
    if (!dropTarget) return;

    this.dragOverElement = dropTarget;
    dropTarget.classList.add('drag-over');

    // Emit drag enter event
    this.emit('dragEnter', {
      element: dropTarget,
      taskId: this.draggedElement?.dataset.taskId,
    });
  }

  // Handle drag leave
  handleDragLeave(e) {
    const dropTarget = this.getDropTarget(e.target);
    if (!dropTarget) return;

    // Only remove drag-over if we're leaving the drop target entirely
    if (!dropTarget.contains(e.relatedTarget)) {
      dropTarget.classList.remove('drag-over');
      if (this.dragOverElement === dropTarget) {
        this.dragOverElement = null;
      }
    }
  }

  // Handle drop
  handleDrop(e) {
    e.preventDefault();

    const dropTarget = this.getDropTarget(e.target);
    if (!dropTarget || !this.draggedElement) return;

    const taskId = e.dataTransfer.getData('text/plain');
    const newStatus = parseInt(dropTarget.dataset.status);
    const oldStatus = parseInt(this.draggedElement.dataset.status);

    // Clear drag over states
    this.clearDragOverStates();

    // Emit drop event
    this.emit('drop', {
      taskId: parseInt(taskId),
      oldStatus,
      newStatus,
      element: this.draggedElement,
      dropTarget,
    });
  }

  // Start touch drag
  startTouchDrag(element, touch) {
    // Create a temporary drag event
    const dragEvent = new DragEvent('dragstart', {
      dataTransfer: new DataTransfer(),
    });

    // Set up the drag data
    dragEvent.dataTransfer.setData('text/plain', element.dataset.taskId);

    // Trigger the drag start
    element.dispatchEvent(dragEvent);
  }

  // Get valid drop target
  getDropTarget(element) {
    // Check if element is a kanban column
    const kanbanColumn = element.closest('.kanban-column');
    if (kanbanColumn) {
      return kanbanColumn;
    }

    // Check if element is a task list
    const taskList = element.closest('.task-list');
    if (taskList) {
      return taskList.closest('.kanban-column');
    }

    return null;
  }

  // Clear all drag over states
  clearDragOverStates() {
    document.querySelectorAll('.drag-over').forEach(element => {
      element.classList.remove('drag-over');
    });
    this.dragOverElement = null;
  }

  // Make element draggable
  makeDraggable(element) {
    element.draggable = true;
    element.classList.add('draggable');
  }

  // Make element not draggable
  makeNotDraggable(element) {
    element.draggable = false;
    element.classList.remove('draggable');
  }

  // Enable drag and drop for task cards
  enableForTaskCards() {
    document.querySelectorAll('.task-card').forEach(card => {
      this.makeDraggable(card);
    });
  }

  // Disable drag and drop for task cards
  disableForTaskCards() {
    document.querySelectorAll('.task-card').forEach(card => {
      this.makeNotDraggable(card);
    });
  }

  // Enable drag and drop for kanban columns
  enableForKanbanColumns() {
    document.querySelectorAll('.kanban-column').forEach(column => {
      column.classList.add('drop-target');
    });
  }

  // Disable drag and drop for kanban columns
  disableForKanbanColumns() {
    document.querySelectorAll('.kanban-column').forEach(column => {
      column.classList.remove('drop-target');
    });
  }

  // Reorder tasks within the same column
  reorderTasks(column, taskId, newOrder) {
    const taskCards = column.querySelectorAll('.task-card');
    const taskArray = Array.from(taskCards);
    const draggedTask = taskArray.find(
      card => card.dataset.taskId === taskId.toString()
    );

    if (!draggedTask) return;

    // Remove dragged task from array
    const filteredTasks = taskArray.filter(
      card => card.dataset.taskId !== taskId.toString()
    );

    // Insert at new position
    filteredTasks.splice(newOrder, 0, draggedTask);

    // Reorder DOM elements
    filteredTasks.forEach((task, index) => {
      column.querySelector('.task-list').appendChild(task);
    });

    // Emit reorder event
    this.emit('reorder', {
      column,
      taskId: parseInt(taskId),
      newOrder,
      tasks: filteredTasks.map(card => parseInt(card.dataset.taskId)),
    });
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
            `Error in drag drop event listener for ${event}:`,
            error
          );
        }
      });
    }
  }

  // Get drag state
  getDragState() {
    return {
      isDragging: this.isDragging,
      draggedElement: this.draggedElement,
      dragOverElement: this.dragOverElement,
    };
  }

  // Cleanup
  destroy() {
    this.clearListeners();
    this.clearDragOverStates();
    this.draggedElement = null;
    this.dragOverElement = null;
    this.isDragging = false;
  }

  clearListeners() {
    this.listeners.clear();
  }
}
