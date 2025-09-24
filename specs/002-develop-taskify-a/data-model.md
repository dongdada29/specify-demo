# Data Model: Create Taskify

## Database
**Type**: SQLite 3.x
**Location**: Local file storage (taskify.db)
**Features**: ACID compliance, foreign key constraints, indexes

## Entities

### User
**Purpose**: Represents team members who can be assigned to tasks
**Attributes**:
- `Id` (int, Primary Key): Unique identifier
- `Name` (string, Required, MaxLength: 100): Display name
- `Role` (UserRole enum, Required): ProductManager or Engineer
- `Color` (string, Required, MaxLength: 7): Hex color code for UI display
- `CreatedAt` (DateTime, Required): Creation timestamp
- `IsActive` (bool, Required, Default: true): Soft delete flag

**Validation Rules**:
- Name cannot be empty or whitespace
- Color must be valid hex color format (#RRGGBB)
- Role must be valid enum value

**Relationships**:
- One-to-Many with Task (AssignedUser)
- One-to-Many with Comment (Author)

### Project
**Purpose**: Represents a project containing tasks
**Attributes**:
- `Id` (int, Primary Key): Unique identifier
- `Name` (string, Required, MaxLength: 200): Project name
- `Description` (string, Optional, MaxLength: 1000): Project description
- `CreatedAt` (DateTime, Required): Creation timestamp
- `UpdatedAt` (DateTime, Required): Last modification timestamp
- `IsActive` (bool, Required, Default: true): Soft delete flag

**Validation Rules**:
- Name cannot be empty or whitespace
- Description cannot exceed 1000 characters
- CreatedAt must be before or equal to UpdatedAt

**Relationships**:
- One-to-Many with Task

### Task
**Purpose**: Represents individual work items in the Kanban board
**Attributes**:
- `Id` (int, Primary Key): Unique identifier
- `Title` (string, Required, MaxLength: 200): Task title
- `Description` (string, Optional, MaxLength: 2000): Task description
- `Status` (TaskStatus enum, Required): ToDo, InProgress, InReview, Done
- `ProjectId` (int, Required, Foreign Key): Reference to Project
- `AssignedUserId` (int, Optional, Foreign Key): Reference to User
- `CreatedAt` (DateTime, Required): Creation timestamp
- `UpdatedAt` (DateTime, Required): Last modification timestamp
- `Order` (int, Required): Display order within status column
- `IsActive` (bool, Required, Default: true): Soft delete flag

**Validation Rules**:
- Title cannot be empty or whitespace
- Description cannot exceed 2000 characters
- Status must be valid enum value
- ProjectId must reference existing project
- AssignedUserId must reference existing user (if not null)
- Order must be non-negative
- CreatedAt must be before or equal to UpdatedAt

**Relationships**:
- Many-to-One with Project
- Many-to-One with User (AssignedUser)
- One-to-Many with Comment

### Comment
**Purpose**: Represents user comments on tasks
**Attributes**:
- `Id` (int, Primary Key): Unique identifier
- `Content` (string, Required, MaxLength: 2000): Comment text
- `TaskId` (int, Required, Foreign Key): Reference to Task
- `AuthorId` (int, Required, Foreign Key): Reference to User
- `CreatedAt` (DateTime, Required): Creation timestamp
- `UpdatedAt` (DateTime, Required): Last modification timestamp
- `IsActive` (bool, Required, Default: true): Soft delete flag

**Validation Rules**:
- Content cannot be empty or whitespace
- Content cannot exceed 2000 characters
- TaskId must reference existing task
- AuthorId must reference existing user
- CreatedAt must be before or equal to UpdatedAt

**Relationships**:
- Many-to-One with Task
- Many-to-One with User (Author)

### KanbanColumn
**Purpose**: Represents the columns in the Kanban board
**Attributes**:
- `Id` (int, Primary Key): Unique identifier
- `Name` (string, Required, MaxLength: 50): Column name
- `Order` (int, Required): Display order
- `Status` (TaskStatus enum, Required): Corresponding task status
- `IsActive` (bool, Required, Default: true): Soft delete flag

**Validation Rules**:
- Name cannot be empty or whitespace
- Order must be non-negative
- Status must be valid enum value

**Relationships**:
- One-to-Many with Task (implicit through Status)

## Enums

### UserRole
```javascript
const UserRole = {
    ProductManager: 1,
    Engineer: 2
};
```

### TaskStatus
```javascript
const TaskStatus = {
    ToDo: 1,
    InProgress: 2,
    InReview: 3,
    Done: 4
};
```

## Database Constraints

### Primary Keys
- All entities have auto-incrementing integer primary keys
- Primary keys are clustered indexes

### Foreign Keys
- `Task.ProjectId` → `Project.Id` (CASCADE DELETE)
- `Task.AssignedUserId` → `User.Id` (SET NULL on delete)
- `Comment.TaskId` → `Task.Id` (CASCADE DELETE)
- `Comment.AuthorId` → `User.Id` (CASCADE DELETE)

### Unique Constraints
- `User.Name` (case-insensitive)
- `Project.Name` (case-insensitive)
- `KanbanColumn.Status` (one column per status)

### Check Constraints
- `User.Color` must match hex color pattern
- `Task.Order` must be non-negative
- `KanbanColumn.Order` must be non-negative

## Indexes

### Performance Indexes
- `IX_Task_ProjectId_Status` (ProjectId, Status) - for project task queries
- `IX_Task_AssignedUserId_Status` (AssignedUserId, Status) - for user task queries
- `IX_Task_Status_Order` (Status, Order) - for Kanban board ordering
- `IX_Comment_TaskId_CreatedAt` (TaskId, CreatedAt) - for comment ordering
- `IX_User_Role` (Role) - for role-based queries

### Unique Indexes
- `IX_User_Name` (Name) - for user name uniqueness
- `IX_Project_Name` (Name) - for project name uniqueness
- `IX_KanbanColumn_Status` (Status) - for status uniqueness

## State Transitions

### Task Status Transitions
- `ToDo` → `InProgress` (user starts work)
- `InProgress` → `InReview` (user completes work)
- `InReview` → `Done` (review approved)
- `InReview` → `InProgress` (review rejected)
- `Done` → `InProgress` (reopened)

### Soft Delete Transitions
- All entities support soft delete via `IsActive` flag
- Soft deleted entities are excluded from normal queries
- Hard delete only for data cleanup operations

## Data Seeding

### Predefined Users
1. Product Manager: "Alice Johnson" (ProductManager, #FF6B6B)
2. Engineer: "Bob Smith" (Engineer, #4ECDC4)
3. Engineer: "Carol Davis" (Engineer, #45B7D1)
4. Engineer: "David Wilson" (Engineer, #96CEB4)
5. Engineer: "Eva Brown" (Engineer, #FFEAA7)

### Sample Projects
1. "Website Redesign" - Modernize company website
2. "Mobile App" - Develop mobile application
3. "API Integration" - Integrate with third-party services

### Kanban Columns
1. "To Do" (ToDo, Order: 1)
2. "In Progress" (InProgress, Order: 2)
3. "In Review" (InReview, Order: 3)
4. "Done" (Done, Order: 4)

### Sample Tasks
Each project will have 5-15 tasks randomly distributed across statuses, ensuring at least one task per status.
