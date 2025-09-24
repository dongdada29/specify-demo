// Database service for Taskify using SQLite
import Database from 'sqlite3';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';
import { KanbanColumn } from '../models/KanbanColumn.js';

export class DatabaseService {
  constructor(dbPath = './taskify.db') {
    this.dbPath = dbPath;
    this.db = null;
    this.isConnected = false;
  }

  // Connection methods
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new Database.Database(this.dbPath, err => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          this.isConnected = true;
          console.log('Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  async disconnect() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close(err => {
          if (err) {
            console.error('Error closing database:', err);
            reject(err);
          } else {
            this.isConnected = false;
            console.log('Disconnected from SQLite database');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Database initialization
  async initialize() {
    if (!this.isConnected) {
      await this.connect();
    }

    await this.createTables();
    await this.createIndexes();
    await this.seedData();
  }

  async createTables() {
    const queries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        role INTEGER NOT NULL,
        color TEXT NOT NULL,
        created_at TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1
      )`,

      // Projects table
      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1
      )`,

      // Tasks table
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status INTEGER NOT NULL,
        project_id INTEGER NOT NULL,
        assigned_user_id INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_user_id) REFERENCES users (id) ON DELETE SET NULL
      )`,

      // Comments table
      `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        task_id INTEGER NOT NULL,
        author_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Kanban columns table
      `CREATE TABLE IF NOT EXISTS kanban_columns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        status INTEGER NOT NULL UNIQUE,
        is_active INTEGER NOT NULL DEFAULT 1
      )`,
    ];

    for (const query of queries) {
      await this.run(query);
    }
  }

  async createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks (project_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user_status ON tasks (assigned_user_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_status_order ON tasks (status, order_index)',
      'CREATE INDEX IF NOT EXISTS idx_comments_task_created ON comments (task_id, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)',
    ];

    for (const index of indexes) {
      await this.run(index);
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
      { name: 'Alice Johnson', role: 1, color: '#FF6B6B' },
      { name: 'Bob Smith', role: 2, color: '#4ECDC4' },
      { name: 'Carol Davis', role: 2, color: '#45B7D1' },
      { name: 'David Wilson', role: 2, color: '#96CEB4' },
      { name: 'Eva Brown', role: 2, color: '#FFEAA7' },
    ];

    for (const user of users) {
      await this.run(
        'INSERT INTO users (name, role, color, created_at) VALUES (?, ?, ?, ?)',
        [user.name, user.role, user.color, new Date().toISOString()]
      );
    }
  }

  async seedProjects() {
    const projects = [
      { name: 'Website Redesign', description: 'Modernize company website' },
      { name: 'Mobile App', description: 'Develop mobile application' },
      {
        name: 'API Integration',
        description: 'Integrate with third-party services',
      },
    ];

    for (const project of projects) {
      await this.run(
        'INSERT INTO projects (name, description, created_at, updated_at) VALUES (?, ?, ?, ?)',
        [
          project.name,
          project.description,
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
    }
  }

  async seedKanbanColumns() {
    const columns = [
      { name: 'To Do', order_index: 1, status: 1 },
      { name: 'In Progress', order_index: 2, status: 2 },
      { name: 'In Review', order_index: 3, status: 3 },
      { name: 'Done', order_index: 4, status: 4 },
    ];

    for (const column of columns) {
      await this.run(
        'INSERT INTO kanban_columns (name, order_index, status) VALUES (?, ?, ?)',
        [column.name, column.order_index, column.status]
      );
    }
  }

  async seedTasks() {
    // Get project IDs
    const projects = await this.all('SELECT id FROM projects');
    const users = await this.all('SELECT id FROM users');

    // Generate tasks for each project
    for (const project of projects) {
      const taskCount = Math.floor(Math.random() * 11) + 5; // 5-15 tasks

      for (let i = 0; i < taskCount; i++) {
        const status = Math.floor(Math.random() * 4) + 1; // 1-4
        const assignedUserId =
          Math.random() > 0.3
            ? users[Math.floor(Math.random() * users.length)].id
            : null;

        await this.run(
          'INSERT INTO tasks (title, description, status, project_id, assigned_user_id, created_at, updated_at, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            `Task ${i + 1}`,
            `Description for task ${i + 1}`,
            status,
            project.id,
            assignedUserId,
            new Date().toISOString(),
            new Date().toISOString(),
            i,
          ]
        );
      }
    }
  }

  // Generic database operations
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getCount(table) {
    const result = await this.get(`SELECT COUNT(*) as count FROM ${table}`);
    return result.count;
  }

  // Transaction support
  async transaction(callback) {
    await this.run('BEGIN TRANSACTION');
    try {
      const result = await callback();
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }
}
