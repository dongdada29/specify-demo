// Main application entry point
import { App } from './app/App.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
