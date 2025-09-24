// Contract tests for Tasks API
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('Tasks API Contract Tests', () => {
  beforeAll(async () => {
    // Setup test database
    // This will fail initially as the API doesn't exist yet
  });

  afterAll(async () => {
    // Cleanup test database
  });

  describe('GET /api/tasks', () => {
    test('should return list of tasks', async () => {
      const response = await fetch('/api/tasks');
      expect(response.status).toBe(200);

      const tasks = await response.json();
      expect(Array.isArray(tasks)).toBe(true);

      // Validate task structure
      tasks.forEach(task => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('description');
        expect(task).toHaveProperty('status');
        expect(task).toHaveProperty('projectId');
        expect(task).toHaveProperty('assignedUserId');
        expect(task).toHaveProperty('createdAt');
        expect(task).toHaveProperty('updatedAt');
        expect(task).toHaveProperty('order');
        expect(task).toHaveProperty('isActive');
      });
    });

    test('should filter tasks by project', async () => {
      const projectId = 1;
      const response = await fetch(`/api/tasks?projectId=${projectId}`);
      const tasks = await response.json();

      tasks.forEach(task => {
        expect(task.projectId).toBe(projectId);
      });
    });

    test('should filter tasks by status', async () => {
      const status = 1; // ToDo
      const response = await fetch(`/api/tasks?status=${status}`);
      const tasks = await response.json();

      tasks.forEach(task => {
        expect(task.status).toBe(status);
      });
    });

    test('should filter tasks by assigned user', async () => {
      const userId = 1;
      const response = await fetch(`/api/tasks?assignedUserId=${userId}`);
      const tasks = await response.json();

      tasks.forEach(task => {
        expect(task.assignedUserId).toBe(userId);
      });
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('should return specific task by id', async () => {
      const taskId = 1;
      const response = await fetch(`/api/tasks/${taskId}`);
      expect(response.status).toBe(200);

      const task = await response.json();
      expect(task.id).toBe(taskId);
    });

    test('should return 404 for non-existent task', async () => {
      const response = await fetch('/api/tasks/999');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/tasks', () => {
    test('should create new task with valid data', async () => {
      const newTask = {
        title: 'Test Task',
        description: 'A test task for contract testing',
        projectId: 1,
        status: 1, // ToDo
        order: 0,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      expect(response.status).toBe(201);
      const task = await response.json();
      expect(task.title).toBe(newTask.title);
      expect(task.description).toBe(newTask.description);
      expect(task.projectId).toBe(newTask.projectId);
      expect(task.status).toBe(newTask.status);
      expect(task.id).toBeDefined();
    });

    test('should return 400 for invalid task data', async () => {
      const invalidTask = {
        title: '', // Empty title should be invalid
        projectId: 1,
        status: 1,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ininvalidTask),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('should update existing task', async () => {
      const taskId = 1;
      const updatedTask = {
        title: 'Updated Task Title',
        description: 'Updated description',
        status: 2, // InProgress
        assignedUserId: 1,
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      expect(response.status).toBe(200);
      const task = await response.json();
      expect(task.title).toBe(updatedTask.title);
      expect(task.status).toBe(updatedTask.status);
      expect(task.assignedUserId).toBe(updatedTask.assignedUserId);
    });

    test('should update task status', async () => {
      const taskId = 1;
      const statusUpdate = {
        status: 3, // InReview
      };

      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusUpdate),
      });

      expect(response.status).toBe(200);
      const task = await response.json();
      expect(task.status).toBe(statusUpdate.status);
    });

    test('should update task assignment', async () => {
      const taskId = 1;
      const assignmentUpdate = {
        assignedUserId: 2,
      };

      const response = await fetch(`/api/tasks/${taskId}/assignment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentUpdate),
      });

      expect(response.status).toBe(200);
      const task = await response.json();
      expect(task.assignedUserId).toBe(assignmentUpdate.assignedUserId);
    });
  });

  describe('PUT /api/tasks/:id/reorder', () => {
    test('should reorder tasks within same status', async () => {
      const taskId = 1;
      const reorderData = {
        newOrder: 2,
        status: 1, // ToDo
      };

      const response = await fetch(`/api/tasks/${taskId}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reorderData),
      });

      expect(response.status).toBe(200);
      const task = await response.json();
      expect(task.order).toBe(reorderData.newOrder);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should soft delete task', async () => {
      const taskId = 1;
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);

      // Verify task is soft deleted
      const getResponse = await fetch(`/api/tasks/${taskId}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
