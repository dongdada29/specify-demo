// Database service for Taskify using IndexedDB (browser-compatible)
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';
import { KanbanColumn } from '../models/KanbanColumn.js';

export class DatabaseService {
  constructor() {
    this.db = null;
    this.isConnected = false;
    this.dbName = 'TaskifyDB';
    this.dbVersion = 1;
  }

  // Connection methods
  async connect() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.isConnected = true;
        console.log('Connected to IndexedDB');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        this.createTables(db);
      };
    });
  }

  async disconnect() {
    if (this.db) {
      this.db.close();
      this.isConnected = false;
      console.log('Disconnected from IndexedDB');
    }
  }

  // Database initialization
  async initialize() {
    if (!this.isConnected) {
      await this.connect();
    }

    await this.seedData();
  }

  createTables(db) {
    // Users store
    if (!db.objectStoreNames.contains('users')) {
      const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
      userStore.createIndex('name', 'name', { unique: true });
      userStore.createIndex('role', 'role', { unique: false });
    }

    // Projects store
    if (!db.objectStoreNames.contains('projects')) {
      const projectStore = db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
      projectStore.createIndex('name', 'name', { unique: true });
    }

    // Tasks store
    if (!db.objectStoreNames.contains('tasks')) {
      const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
      taskStore.createIndex('project_id', 'project_id', { unique: false });
      taskStore.createIndex('assigned_user_id', 'assigned_user_id', { unique: false });
      taskStore.createIndex('status', 'status', { unique: false });
      taskStore.createIndex('status_order', ['status', 'order_index'], { unique: false });
    }

    // Comments store
    if (!db.objectStoreNames.contains('comments')) {
      const commentStore = db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
      commentStore.createIndex('task_id', 'task_id', { unique: false });
      commentStore.createIndex('author_id', 'author_id', { unique: false });
      commentStore.createIndex('created_at', 'created_at', { unique: false });
    }

    // Kanban columns store
    if (!db.objectStoreNames.contains('kanban_columns')) {
      const columnStore = db.createObjectStore('kanban_columns', { keyPath: 'id', autoIncrement: true });
      columnStore.createIndex('status', 'status', { unique: true });
      columnStore.createIndex('order_index', 'order_index', { unique: false });
    }
  }

  async seedData() {
    // Check if data already exists
    const userCount = await this.getCount('users');
    if (userCount > 0) {
      return; // Data already seeded
    }

    // Seed users
    await this.seedUsers();
    await this.seedProjects();
    await this.seedKanbanColumns();
    await this.seedTasks();
  }

  async seedUsers() {
    const users = [
      { name: 'Alice Johnson', role: 1, color: '#FF6B6B', created_at: new Date().toISOString(), is_active: 1 },
      { name: 'Bob Smith', role: 2, color: '#4ECDC4', created_at: new Date().toISOString(), is_active: 1 },
      { name: 'Carol Davis', role: 2, color: '#45B7D1', created_at: new Date().toISOString(), is_active: 1 },
      { name: 'David Wilson', role: 2, color: '#96CEB4', created_at: new Date().toISOString(), is_active: 1 },
      { name: 'Eva Brown', role: 2, color: '#FFEAA7', created_at: new Date().toISOString(), is_active: 1 },
    ];

    for (const user of users) {
      await this.add('users', user);
    }
  }

  async seedProjects() {
    const projects = [
      { name: 'Website Redesign', description: 'Modernize company website', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_active: 1 },
      { name: 'Mobile App', description: 'Develop mobile application', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_active: 1 },
      { name: 'API Integration', description: 'Integrate with third-party services', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_active: 1 },
    ];

    for (const project of projects) {
      await this.add('projects', project);
    }
  }

  async seedKanbanColumns() {
    const columns = [
      { name: 'To Do', order_index: 1, status: 1, is_active: 1 },
      { name: 'In Progress', order_index: 2, status: 2, is_active: 1 },
      { name: 'In Review', order_index: 3, status: 3, is_active: 1 },
      { name: 'Done', order_index: 4, status: 4, is_active: 1 },
    ];

    for (const column of columns) {
      await this.add('kanban_columns', column);
    }
  }

  async seedTasks() {
    // Get project IDs
    const projects = await this.all('projects');
    const users = await this.all('users');

    // Generate tasks for each project
    for (const project of projects) {
      const taskCount = Math.floor(Math.random() * 11) + 5; // 5-15 tasks

      for (let i = 0; i < taskCount; i++) {
        const status = Math.floor(Math.random() * 4) + 1; // 1-4
        const assignedUserId = Math.random() > 0.3 ? users[Math.floor(Math.random() * users.length)].id : null;

        await this.add('tasks', {
          title: `Task ${i + 1}`,
          description: `Description for task ${i + 1}`,
          status: status,
          project_id: project.id,
          assigned_user_id: assignedUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          order_index: i,
          is_active: 1,
        });
      }
    }
  }

  // Generic database operations
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Query methods
  async all(storeName, indexName = null, range = null) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const target = indexName ? store.index(indexName) : store;
      const request = range ? target.getAll(range) : target.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(value);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getCount(storeName) {
    const results = await this.getAll(storeName);
    return results.length;
  }

  // Legacy methods for compatibility
  async run(sql, params = []) {
    // This method is not applicable for IndexedDB
    throw new Error('run() method not supported in IndexedDB implementation');
  }

  async get(sql, params = []) {
    // This method is not applicable for IndexedDB
    throw new Error('get() method not supported in IndexedDB implementation');
  }

  async all(sql, params = []) {
    // This method is not applicable for IndexedDB
    throw new Error('all() method not supported in IndexedDB implementation');
  }

  // Transaction support
  async transaction(callback) {
    // IndexedDB transactions are handled automatically
    return await callback();
  }
}