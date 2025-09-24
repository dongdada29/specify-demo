# Taskify - Team Productivity Platform

A modern team productivity platform built with Vite, vanilla JavaScript, and SQLite. Taskify provides Kanban-style task management with real-time updates, drag-and-drop functionality, and collaborative features.

## Features

- **User Management**: Predefined users with role-based access (Product Manager, Engineers)
- **Project Management**: Create and manage multiple projects
- **Task Management**: Kanban-style task boards with drag-and-drop functionality
- **Real-time Updates**: WebSocket-based real-time collaboration
- **Comment System**: Add, edit, and delete comments on tasks
- **User Assignment**: Assign tasks to team members
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Local Storage**: SQLite database for data persistence

## Technology Stack

- **Frontend**: Vite, Vanilla JavaScript (ES2022), HTML5, CSS3
- **Database**: SQLite3
- **Real-time**: WebSocket API
- **Testing**: Jest, Playwright
- **Build Tool**: Vite
- **Code Quality**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 18+ 
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd taskify
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

## Usage

### User Selection

1. Launch the application
2. Select your identity from the 5 predefined users:
   - **Alice Johnson** (Product Manager) - Red theme
   - **Bob Smith** (Engineer) - Teal theme
   - **Carol Davis** (Engineer) - Blue theme
   - **David Wilson** (Engineer) - Green theme
   - **Eva Brown** (Engineer) - Yellow theme

### Project Management

1. After selecting your identity, you'll see 3 sample projects
2. Click on any project to open its Kanban board
3. View project statistics and task counts

### Task Management

1. **Viewing Tasks**: Tasks are organized in 4 columns:
   - **To Do** - New tasks ready to be started
   - **In Progress** - Tasks currently being worked on
   - **In Review** - Tasks awaiting review
   - **Done** - Completed tasks

2. **Moving Tasks**: Drag and drop tasks between columns to change their status

3. **Assigning Tasks**: Click on a task to open the detail view and assign it to a team member

4. **Adding Comments**: Add unlimited comments to tasks (editable/deletable only by the creator)

### Real-time Features

- Task movements are instantly visible to all users
- New comments appear without page refresh
- Task assignments update in real-time
- Status changes are synchronized across all clients

## Project Structure

```
src/
├── app/                 # Main application class
├── components/          # Reusable UI components
├── models/             # Data models
├── pages/              # Page components
├── services/           # Business logic services
├── utils/              # Utility functions
└── styles/             # CSS styles

tests/
├── contract/           # API contract tests
├── integration/        # Integration tests
└── unit/               # Unit tests
```

## Data Model

### Users
- Product Manager: Alice Johnson
- Engineers: Bob Smith, Carol Davis, David Wilson, Eva Brown

### Projects
- Website Redesign
- Mobile App
- API Integration

### Tasks
- Each project contains 5-15 tasks
- Tasks are randomly distributed across status columns
- At least one task in each status column

## API Endpoints

### Projects API
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks API
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/status` - Update task status
- `PUT /api/tasks/:id/assignment` - Update task assignment
- `DELETE /api/tasks/:id` - Delete task

### Comments API
- `GET /api/comments` - Get all comments
- `GET /api/comments/:id` - Get comment by ID
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## Testing

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## Performance

- **Page Load**: Under 2 seconds
- **Task Movement**: Under 200ms
- **Comment Addition**: Under 100ms
- **Real-time Updates**: Under 50ms

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the repository.
