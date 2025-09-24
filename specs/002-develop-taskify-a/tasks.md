# Tasks: Create Taskify

**Input**: Design documents from `/specs/002-develop-taskify-a/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [x] T001 Create project structure with Vite configuration
- [x] T002 Initialize package.json with dependencies (Vite, SQLite3, Jest, Playwright)
- [x] T003 [P] Configure ESLint and Prettier for code quality
- [x] T004 [P] Setup Jest testing framework with Vite integration
- [x] T005 [P] Setup Playwright for E2E testing
- [x] T006 Create basic HTML structure with user selection interface

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T007 [P] Contract test Projects API in tests/contract/test_projects_api.js
- [x] T008 [P] Contract test Tasks API in tests/contract/test_tasks_api.js
- [x] T009 [P] Contract test Notifications API in tests/contract/test_notifications_api.js
- [x] T010 [P] Integration test user selection flow in tests/integration/test_user_selection.js
- [x] T011 [P] Integration test project navigation in tests/integration/test_project_navigation.js
- [x] T012 [P] Integration test task management in tests/integration/test_task_management.js
- [x] T013 [P] Integration test drag and drop in tests/integration/test_drag_drop.js
- [x] T014 [P] Integration test comment system in tests/integration/test_comments.js
- [x] T015 [P] Integration test real-time updates in tests/integration/test_realtime.js

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T016 [P] User model in src/models/User.js
- [x] T017 [P] Project model in src/models/Project.js
- [x] T018 [P] Task model in src/models/Task.js
- [x] T019 [P] Comment model in src/models/Comment.js
- [x] T020 [P] KanbanColumn model in src/models/KanbanColumn.js
- [x] T021 [P] Database service in src/services/DatabaseService.js
- [x] T022 [P] User service in src/services/UserService.js
- [x] T023 [P] Project service in src/services/ProjectService.js
- [x] T024 [P] Task service in src/services/TaskService.js
- [x] T025 [P] Comment service in src/services/CommentService.js
- [x] T026 [P] WebSocket service in src/services/WebSocketService.js
- [x] T027 [P] Drag and drop handler in src/utils/DragDropHandler.js
- [x] T028 [P] Validation utilities in src/utils/Validation.js

## Phase 3.4: UI Implementation
- [x] T029 Create user selection page in src/pages/UserSelection.js
- [x] T030 Create project list page in src/pages/ProjectList.js
- [x] T031 Create Kanban board page in src/pages/KanbanBoard.js
- [x] T032 Create task detail modal in src/components/TaskDetailModal.js
- [x] T033 Create task card component in src/components/TaskCard.js
- [x] T034 Create comment component in src/components/Comment.js
- [x] T035 Create user assignment dropdown in src/components/UserAssignment.js
- [x] T036 Create notification system in src/components/NotificationSystem.js

## Phase 3.5: Integration
- [x] T037 Connect services to SQLite database
- [x] T038 Implement WebSocket real-time communication
- [x] T039 Setup data seeding with predefined users and projects
- [x] T040 Implement task status transitions
- [x] T041 Setup error handling and logging
- [x] T042 Implement responsive design for mobile devices

## Phase 3.6: Polish
- [x] T043 [P] Unit tests for models in tests/unit/test_models.js
- [x] T044 [P] Unit tests for services in tests/unit/test_services.js
- [x] T045 [P] Unit tests for utilities in tests/unit/test_utils.js
- [x] T046 Performance optimization and bundle size analysis
- [x] T047 [P] Update documentation and README
- [x] T048 [P] Run E2E tests and fix any issues
- [x] T049 [P] Code review and refactoring
- [x] T050 Final testing and validation

## Dependencies
- Tests (T007-T015) before implementation (T016-T042)
- T016-T020 (models) before T021-T025 (services)
- T021 (DatabaseService) before T022-T025 (other services)
- T022-T025 (services) before T029-T036 (UI components)
- T037-T042 (integration) before T043-T050 (polish)

## Parallel Examples
```
# Launch T007-T009 together (Contract tests):
Task: "Contract test Projects API in tests/contract/test_projects_api.js"
Task: "Contract test Tasks API in tests/contract/test_tasks_api.js"
Task: "Contract test Notifications API in tests/contract/test_notifications_api.js"

# Launch T016-T020 together (Models):
Task: "User model in src/models/User.js"
Task: "Project model in src/models/Project.js"
Task: "Task model in src/models/Task.js"
Task: "Comment model in src/models/Comment.js"
Task: "KanbanColumn model in src/models/KanbanColumn.js"

# Launch T022-T025 together (Services):
Task: "User service in src/services/UserService.js"
Task: "Project service in src/services/ProjectService.js"
Task: "Task service in src/services/TaskService.js"
Task: "Comment service in src/services/CommentService.js"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts
- Follow TDD: Write tests first, then make them pass

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → UI → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
