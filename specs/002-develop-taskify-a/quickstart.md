# Quickstart Guide: Taskify

## Overview
Taskify is a team productivity platform that provides Kanban-style task management with real-time updates, drag-and-drop functionality, and collaborative features.

## Prerequisites
- Node.js 18+ (for Vite development server)
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- No additional database setup required (uses local SQLite)

## Getting Started

### 1. User Selection
1. Launch the application
2. Select your identity from the 5 predefined users:
   - **Alice Johnson** (Product Manager) - Red theme
   - **Bob Smith** (Engineer) - Teal theme
   - **Carol Davis** (Engineer) - Blue theme
   - **David Wilson** (Engineer) - Green theme
   - **Eva Brown** (Engineer) - Yellow theme

### 2. Project Overview
After selecting your identity, you'll see 3 sample projects:
- **Website Redesign** - Modernize company website
- **Mobile App** - Develop mobile application
- **API Integration** - Integrate with third-party services

### 3. Kanban Board Navigation
1. Click on any project to open its Kanban board
2. View tasks organized in 4 columns:
   - **To Do** - New tasks ready to be started
   - **In Progress** - Tasks currently being worked on
   - **In Review** - Tasks awaiting review
   - **Done** - Completed tasks

### 4. Task Management

#### Viewing Tasks
- Tasks assigned to you are highlighted in your theme color
- Hover over tasks to see quick details
- Click on a task to view full details and comments

#### Moving Tasks
1. **Drag and Drop**: Drag tasks between columns to change their status
2. **Status Updates**: Tasks automatically update their status based on column
3. **Order Management**: Drag tasks within the same column to reorder them

#### Assigning Tasks
1. Click on a task to open the detail view
2. Click the "Assign" button
3. Select a team member from the dropdown
4. The task will be highlighted in the assignee's color

#### Adding Comments
1. Open a task detail view
2. Scroll to the comments section
3. Type your comment and press Enter
4. Comments appear in real-time for all users

#### Managing Comments
- **Edit**: Click the edit button on your own comments
- **Delete**: Click the delete button on your own comments
- **View**: Read comments from all team members
- **Real-time**: See new comments as they're added

## Key Features

### Real-time Updates
- Task movements are instantly visible to all users
- New comments appear without page refresh
- Task assignments update in real-time
- Status changes are synchronized across all clients

### Visual Indicators
- **Your Tasks**: Highlighted in your theme color
- **Assigned Tasks**: Show assignee's color
- **Unassigned Tasks**: Default neutral color
- **Status Icons**: Visual indicators for each task status

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Touch-friendly drag and drop on mobile
- Optimized layouts for different screen sizes

## Sample Data

### Predefined Users
Each user has a unique color theme and role:
- **Product Manager**: Can view all projects and tasks
- **Engineers**: Can be assigned to tasks and add comments

### Sample Projects
Each project contains 5-15 tasks distributed across all status columns:
- **Website Redesign**: 12 tasks (3 To Do, 4 In Progress, 3 In Review, 2 Done)
- **Mobile App**: 8 tasks (2 To Do, 3 In Progress, 2 In Review, 1 Done)
- **API Integration**: 10 tasks (2 To Do, 2 In Progress, 3 In Review, 3 Done)

### Task Distribution
- At least one task in each status column
- Random distribution across remaining tasks
- Realistic task titles and descriptions
- Various assignment patterns

## Testing Scenarios

### Basic Functionality
1. **User Selection**: Verify all 5 users are available
2. **Project Navigation**: Confirm 3 projects are visible
3. **Task Viewing**: Check task details and assignments
4. **Drag and Drop**: Test moving tasks between columns
5. **Comment System**: Add, edit, and delete comments

### Real-time Features
1. **Multi-user Testing**: Open multiple browser windows
2. **Task Movement**: Move tasks in one window, verify updates in others
3. **Comment Updates**: Add comments and verify real-time visibility
4. **Assignment Changes**: Reassign tasks and verify color updates

### Edge Cases
1. **Invalid Drags**: Try dragging to invalid locations
2. **Comment Permissions**: Attempt to edit/delete others' comments
3. **Concurrent Updates**: Multiple users editing same task
4. **Network Issues**: Test behavior with poor connectivity

## Performance Expectations

### Response Times
- **Page Load**: Under 2 seconds
- **Task Movement**: Under 200ms
- **Comment Addition**: Under 100ms
- **Real-time Updates**: Under 50ms

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Local Storage
- **Database**: SQLite file (taskify.db) stored locally
- **Data Persistence**: All data saved to local file
- **Backup**: Copy taskify.db file to backup data

## Troubleshooting

### Common Issues
1. **Drag and Drop Not Working**: Check browser compatibility
2. **Real-time Updates Missing**: Verify WebSocket connection
3. **Tasks Not Loading**: Check SQLite database file
4. **Comments Not Saving**: Verify database write permissions

### Debug Information
- Check browser console for JavaScript errors
- Verify WebSocket connection in developer tools
- Check SQLite database file exists and is writable
- Monitor WebSocket connection status

## Next Steps

After completing the quickstart:
1. Explore all project features
2. Test with multiple users
3. Try different task management workflows
4. Provide feedback on user experience
5. Report any issues or suggestions
