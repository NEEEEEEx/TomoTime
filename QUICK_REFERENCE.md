# TomoTime Study Plan Integration - Quick Reference

## 🎯 What Was Implemented

A complete AI-powered study plan creation and calendar management system that:
1. **Generates study plans** through conversation with Tomo AI
2. **Parses AI responses** to extract task details automatically
3. **Detects scheduling conflicts** before adding tasks
4. **Displays tasks** on the calendar with visual categorization
5. **Allows editing** of all task properties including type conversion
6. **Suggests schedule improvements** for better learning

## 📦 New Files Created

```
context/
  └── TaskContext.js                          # Global task state management

utils/
  ├── studyPlanParser.js                      # AI response parsing
  ├── scheduleConflictDetection.js            # Conflict detection & analysis
  └── schedulingHelpers.js                    # Scheduling utilities & validation

components/modals/
  └── StudyPlanConfirmationModal.js           # Plan approval UI

STUDY_PLAN_IMPLEMENTATION.md                  # Full documentation
QUICK_REFERENCE.md                            # This file
```

## 🔄 Modified Files

```
App.js                                        # Added TaskProvider wrapper
screens/ChatAi.js                             # Added plan parsing & approval flow
screens/CalendarPage.js                       # Migrated to TaskContext
components/modals/EditTaskModal.js            # Added task type selector & deadline support
utils/conversationHistory.js                  # Enhanced AI system prompt
```

## 🚀 Quick Start

### For Users
1. Open ChatAi screen
2. Ask Tomo: "Create a study plan for [topic] on [date]"
3. Provide additional details (difficulty, coverage, other tasks)
4. Review the generated plan in the modal
5. Select tasks to approve
6. Tasks appear on calendar immediately

### For Developers

**Initialize TaskContext in component:**
```javascript
import { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';

const MyComponent = () => {
  const { tasks, addTask, updateTask, deleteTask } = useContext(TaskContext);
  // Use context methods...
};
```

**Check for conflicts:**
```javascript
const conflicts = checkTimeConflict(
  '2025-12-15',      // date
  '02:00 PM',        // startTime
  '03:30 PM'         // endTime
);
```

**Parse AI response:**
```javascript
import { parseStudyPlan, isStudyPlanResponse } from '../utils/studyPlanParser';

if (isStudyPlanResponse(aiResponse)) {
  const tasks = parseStudyPlan(aiResponse);
}
```

## 📋 Task Structure

Every task in the system has this structure:

```javascript
{
  taskId: string,                    // Unique identifier
  title: string,                     // Task name
  description: string,               // Details
  date: 'YYYY-MM-DD',               // Date in ISO format
  day: string,                       // Day name ('Monday', etc.)
  startTime: 'HH:MM AM/PM',         // Start time (optional for Deadline)
  endTime: 'HH:MM AM/PM',           // End time
  priority: 'Low'|'Medium'|'High',  // Priority level
  taskType: 'Study'|'Break'|'Deadline'  // Task category
}
```

## 🎨 Visual Indicators

### Task Type Colors
| Type | Color | Use Case |
|------|-------|----------|
| Study | Yellow (#FFBE5B) | Study sessions |
| Break | Gray (#D3D3DD) | Rest periods |
| Deadline | Red (#FF8A8A) | Final deadlines |

### Warning Levels
- 🔴 **High**: Study load > 8 hours/day
- 🟡 **Medium**: Potential issues (no breaks, unbalanced load)
- 🔵 **Low**: Info only (long sessions, suggestions)

## 📱 User Workflows

### Workflow 1: Create Study Plan
```
User opens ChatAi
  ↓
Requests study plan (e.g., "Quiz on Dec 15, create plan")
  ↓
Provides details (difficulty, coverage, other tasks)
  ↓
Tomo generates plan with structured response
  ↓
System detects plan and parses tasks
  ↓
Shows StudyPlanConfirmationModal
  ↓
User selects tasks to approve
  ↓
Approved tasks added to calendar
  ↓
Calendar updated with new schedule
```

### Workflow 2: Edit Existing Task
```
User navigates to CalendarPage
  ↓
Selects date with tasks
  ↓
Taps edit icon on task card
  ↓
EditTaskModal opens with task data
  ↓
User modifies:
  - Title
  - Description
  - Date
  - Times (or deadline)
  - Priority
  - Task type
  ↓
Saves changes
  ↓
Calendar updates
```

### Workflow 3: Check Schedule Conflicts
```
AI generates study plan
  ↓
System extracts tasks
  ↓
detectConflicts() checks against existing tasks
  ↓
If conflicts found:
  - Warning displayed in confirmation modal
  - Tasks remain selectable
  - User can adjust/reject conflicting tasks
  ↓
User approves selection
  ↓
Non-conflicting tasks added
  ↓
Conflicting tasks handled per user choice
```

## 🔌 API Reference

### TaskContext Methods
```javascript
// Load all tasks from storage
await loadTasks()

// Add new task and return with taskId
const newTask = addTask(taskData)

// Update existing task
updateTask(taskId, updates)

// Delete task
deleteTask(taskId)

// Get tasks for specific date
const dayTasks = getTasksForDate('2025-12-15')

// Get all tasks
const allTasks = getAllTasks()

// Check for time conflicts
const conflicts = checkTimeConflict(date, startTime, endTime, excludeTaskId)
```

### Study Plan Parser
```javascript
// Check if response contains plan
if (isStudyPlanResponse(response)) {
  // Parse tasks from response
  const tasks = parseStudyPlan(response)
}

// Format tasks for display
const message = formatStudyPlanConfirmation(tasks)
```

### Conflict Detection
```javascript
// Detect conflicts between new and existing tasks
const conflicts = detectConflicts(newTasks, existingTasks)

// Get suggestions for improvements
const { suggestions } = suggestScheduleAdjustments(tasks, newTasks)

// Calculate study hours for a date
const hours = calculateDailyStudyHours(tasks, '2025-12-15')

// Assess overall balance
const assessment = assessScheduleBalance(tasks)
// Returns: { overloaded: [], underloaded: [], balanced: [] }
```

### Scheduling Helpers
```javascript
// Generate recommendations for a plan
const recs = generateSchedulingRecommendations(tasks, newTasks)

// Validate study plan quality
const validation = validateStudyPlan(tasks)
// Returns: { isValid, issues: [], warnings: [] }

// Get natural language summary
const summary = generatePlanSummary(tasks)
```

## ⚠️ Important Notes

### Date/Time Format
- **Dates**: Always use `YYYY-MM-DD` format (e.g., 2025-12-15)
- **Times**: Always use `HH:MM AM/PM` format (e.g., 02:30 PM)
- This is crucial for conflict detection to work correctly

### Task Type Behavior
- **Study/Break**: Both require startTime and endTime
- **Deadline**: Only uses endTime (no startTime)
- Edit modal adapts UI based on task type

### Conflict Rules
- Conflicts only occur on the same date
- Deadline tasks don't conflict with times
- Overlapping minute ranges trigger conflict detection

### Storage
- All tasks persist in AsyncStorage automatically
- Survives app restart
- No internet required for cached data

## 🔧 Troubleshooting

### Tasks not appearing on calendar
- ✓ Verify TaskProvider wraps all screens in App.js
- ✓ Check date format is YYYY-MM-DD
- ✓ Ensure loadTasks() is called in useEffect

### AI plan not being parsed
- ✓ Verify AI response contains dates (YYYY-MM-DD)
- ✓ Check time format (HH:MM AM/PM)
- ✓ Review AI system prompt alignment

### Conflicts not detected
- ✓ Verify tasks have same date
- ✓ Check time conversion (12-hour to 24-hour)
- ✓ Ensure task types are 'Study' or 'Break'

### Modal not showing after plan approval
- ✓ Check AddUserMessage is awaited properly
- ✓ Verify setConversation is called after addTask
- ✓ Ensure modal state is reset correctly

## 🎓 Learning Resources

For understanding the implementation:

1. **Context API**: Used for global state management
2. **AsyncStorage**: Persistent local storage
3. **Regular Expressions**: Used in plan parsing
4. **Time Conversion**: 12-hour to 24-hour format handling
5. **React Hooks**: useState, useContext, useEffect

## 🚦 Next Steps

To extend this implementation:

1. Add schedule visualization (timeline view)
2. Implement task notifications
3. Add Google Calendar sync
4. Create study analytics dashboard
5. Build focus timer integration
6. Add collaborative scheduling

## 📞 Support

For issues or questions:
1. Check STUDY_PLAN_IMPLEMENTATION.md for detailed docs
2. Review test scenarios in implementation guide
3. Verify all imports are correct
4. Check console for error messages
5. Ensure dependencies are installed
