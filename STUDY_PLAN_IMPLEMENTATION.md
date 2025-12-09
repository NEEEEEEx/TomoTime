# Study Plan Integration - Implementation Guide

## Overview
This implementation adds comprehensive AI-powered study plan creation, approval, and calendar integration to TomoTime. The system allows users to interact with Tomo AI to generate personalized study schedules that are displayed on the calendar with conflict detection and editing capabilities.

## Key Components

### 1. **TaskContext** (`context/TaskContext.js`)
Global state management for all tasks/schedule items.

**Features:**
- Persistent storage using AsyncStorage
- Task CRUD operations (Create, Read, Update, Delete)
- Conflict detection for time slots
- Helper methods for task queries

**Key Functions:**
- `loadTasks()` - Initialize tasks from storage
- `addTask(task)` - Add new task to calendar
- `updateTask(taskId, updates)` - Modify existing task
- `deleteTask(taskId)` - Remove task
- `getTasksForDate(dateString)` - Filter tasks by date
- `checkTimeConflict(date, startTime, endTime)` - Detect scheduling conflicts

**Task Structure:**
```javascript
{
  taskId: string,
  title: string,
  description: string,
  date: 'YYYY-MM-DD',
  day: string, // 'Monday', 'Tuesday', etc.
  startTime: 'HH:MM AM/PM',
  endTime: 'HH:MM AM/PM',
  priority: 'Low' | 'Medium' | 'High',
  taskType: 'Study' | 'Break' | 'Deadline'
}
```

### 2. **Study Plan Parser** (`utils/studyPlanParser.js`)
Parses AI-generated study plans from natural language responses.

**Key Functions:**
- `parseStudyPlan(aiResponse)` - Extract task data from AI response
- `formatStudyPlanConfirmation(tasks)` - Format tasks for user review
- `isStudyPlanResponse(response)` - Detect if response contains a plan

**How It Works:**
- Scans AI response for date patterns (YYYY-MM-DD)
- Extracts time ranges (HH:MM AM/PM - HH:MM AM/PM)
- Identifies task types (Study, Break, Deadline)
- Determines priority levels
- Accumulates descriptions

### 3. **Schedule Conflict Detection** (`utils/scheduleConflictDetection.js`)
Advanced scheduling conflict and balance analysis.

**Key Functions:**
- `detectConflicts(newTasks, existingTasks)` - Find overlapping tasks
- `suggestScheduleAdjustments(tasks, newTasks)` - Provide optimization recommendations
- `resolveConflictByShifting(newTask, existingTask)` - Auto-adjust times
- `calculateDailyStudyHours(tasks, date)` - Get daily study load
- `assessScheduleBalance(tasks)` - Check if schedule is balanced

**Conflict Detection Logic:**
- Checks for time overlap on same date
- Ignores Deadline tasks (no time conflict)
- Returns overlap details and duration

**Balance Recommendations:**
- ⚠️ WARNING: Daily study > 8 hours
- ℹ️ INFO: Long study sessions suggest breaks
- ℹ️ INFO: Uneven daily load suggests redistribution

### 4. **Study Plan Confirmation Modal** (`components/modals/StudyPlanConfirmationModal.js`)
User interface for reviewing and approving AI-generated plans.

**Features:**
- Display tasks with preview cards
- Task type color indicators
- Toggle task selection (approve/reject individual tasks)
- Conflict warning display
- Approve/Reject actions

**Task Card Display:**
- Title and description
- Date and day
- Time range (or deadline)
- Priority level
- Task type badge

### 5. **Enhanced ChatAi Screen** (`screens/ChatAi.js`)
Updated AI chat interface with automatic plan detection and approval flow.

**New Features:**
- Automatic study plan detection in AI responses
- Plan parsing and validation
- Conflict checking before approval
- One-click approval to add to calendar
- Plan rejection handling

**Flow:**
1. User requests study plan
2. AI generates response with plan
3. System detects plan in response
4. Parses tasks from text
5. Checks for conflicts
6. Shows confirmation modal
7. User approves/rejects
8. Tasks added to calendar or plan adjusted

### 6. **Updated CalendarPage** (`screens/CalendarPage.js`)
Modified to use TaskContext for all task management.

**Changes:**
- Now uses global task state from TaskContext
- Automatic loading of tasks on mount
- Updated handlers use context methods
- No longer maintains local task state
- Better data consistency across app

### 7. **Enhanced EditTaskModal** (`components/modals/EditTaskModal.js`)
Updated to support all task types including deadlines.

**New Features:**
- Task type selector (Study/Break/Deadline)
- Conditional UI for deadline vs timed tasks
- All task properties editable
- Day name auto-calculation
- ScrollView for small screens

**Conditional Fields:**
- **Study/Break:** Show start and end time pickers
- **Deadline:** Show only deadline time picker

### 8. **Updated AI System Prompt** (`utils/conversationHistory.js`)
Enhanced AI instructions for better study plan generation.

**Guidelines:**
- Date format: YYYY-MM-DD
- Time format: HH:MM AM/PM
- Realistic study blocks (45-120 min)
- Mandatory breaks (10-15 min)
- Daily limits (4-8 hours recommended)
- Multiple days distribution
- Balance recommendations

**Expected AI Response Structure:**
```
**Study Session 1 - Topic**
Coverage: Specific topics
2025-12-15 | Monday
02:00 PM - 03:30 PM
Priority: Medium
Type: Study

**Break Time**
Short recharge
2025-12-15 | Monday
03:30 PM - 03:45 PM
Type: Break
```

## Data Flow

### Adding a Study Plan
```
User → ChatAi Chat → AI Response (with plan)
  ↓
parseStudyPlan() extracts tasks
  ↓
detectConflicts() checks existing schedule
  ↓
StudyPlanConfirmationModal shows for review
  ↓
User approves selected tasks
  ↓
addTask() in TaskContext for each task
  ↓
Tasks persisted to AsyncStorage
  ↓
CalendarPage automatically updates with new tasks
```

### Editing a Task
```
CalendarPage displays tasks
  ↓
User taps edit icon
  ↓
EditTaskModal opens with task data
  ↓
User modifies properties
  ↓
handleSaveTask() calls updateTask()
  ↓
TaskContext persists changes
  ↓
CalendarPage re-renders with updates
```

## Color Coding

### Task Types
- **Study**: Yellow/Gold (#FFBE5B)
- **Break**: Light Gray (#D3D3DD)
- **Deadline**: Red (#FF8A8A)

### Conflict Warnings
- **Warning**: Yellow background (#fff3cd)
- **Info**: Informational messages

## Integration with Existing Code

### App.js Changes
- Wrapped with `<TaskProvider>` to enable TaskContext
- All screens now have access to task management

### Dependencies
- AsyncStorage (already in project)
- React Context API (built-in)
- Navigation (already configured)

## Usage Examples

### For Users
1. **Create Study Plan:**
   - Open ChatAi
   - Ask Tomo: "I have a quiz on Dec 15, create a study plan"
   - Provide details (difficulty, topics, other tasks)
   - Approve the generated plan
   - Plan appears on calendar

2. **Edit Tasks:**
   - Navigate to CalendarPage
   - Select date with tasks
   - Tap edit icon on task card
   - Modify details
   - Save changes

3. **Delete Tasks:**
   - Tap delete icon on task card
   - Confirm deletion
   - Task removed from calendar

### For Developers

**Adding a Task Programmatically:**
```javascript
const { addTask } = useContext(TaskContext);

addTask({
  title: 'Quiz Review',
  description: 'Review chapters 5-8',
  date: '2025-12-15',
  day: 'Monday',
  startTime: '02:00 PM',
  endTime: '03:00 PM',
  priority: 'High',
  taskType: 'Study'
});
```

**Checking for Conflicts:**
```javascript
const { checkTimeConflict } = useContext(TaskContext);

const conflicts = checkTimeConflict(
  '2025-12-15',
  '02:00 PM',
  '03:00 PM'
);

if (conflicts.length > 0) {
  // Handle conflicts
}
```

**Analyzing Schedule Balance:**
```javascript
import { assessScheduleBalance } from '../utils/scheduleConflictDetection';

const { tasks } = useContext(TaskContext);
const assessment = assessScheduleBalance(tasks);

console.log(assessment.overloaded); // Days with > 8 hours
console.log(assessment.underloaded); // Days with < 2 hours
console.log(assessment.balanced); // Balanced days
```

## Testing the Implementation

### Test Scenarios
1. **Test AI Plan Generation:**
   - Request study plan from ChatAi
   - Verify plan appears with correct formatting
   - Approve plan and check calendar

2. **Test Conflict Detection:**
   - Add overlapping time slots
   - Verify warning message appears
   - Try to approve with conflicts

3. **Test Task Editing:**
   - Edit task details
   - Change dates and times
   - Verify changes persist

4. **Test Task Types:**
   - Create Study, Break, and Deadline tasks
   - Edit and verify type-specific fields work
   - Verify color coding displays correctly

5. **Test Persistence:**
   - Add tasks and close app
   - Reopen app
   - Verify tasks still exist

## Future Enhancements

- [ ] Smart schedule recommendations based on focus time
- [ ] Integration with Google Calendar
- [ ] Notifications for upcoming tasks
- [ ] Study analytics and time tracking
- [ ] Recurring task templates
- [ ] Collaborative study planning
- [ ] Mobile app notifications
- [ ] Progress tracking for tasks

## Troubleshooting

### Tasks Not Showing
- Check AsyncStorage is properly initialized
- Verify tasks have correct date format (YYYY-MM-DD)
- Check that TaskProvider wraps all screens in App.js

### Plan Not Parsing
- Verify AI response contains dates in YYYY-MM-DD format
- Check time format matches HH:MM AM/PM
- Review AI system prompt for response structure

### Conflicts Not Detected
- Ensure tasks have same date
- Verify time format is consistent
- Check that time conversion logic is correct

### Performance Issues
- Limit number of tasks displayed
- Use FlatList with proper key extraction
- Consider pagination for large task lists
