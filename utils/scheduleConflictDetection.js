// Utility for detecting and managing schedule conflicts

export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes) => {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
};

export const detectConflicts = (newTasks, existingTasks) => {
  const conflicts = [];

  newTasks.forEach((newTask, newIdx) => {
    if (newTask.taskType === 'Deadline') return; // Deadlines don't conflict with time slots

    const newStart = timeToMinutes(newTask.startTime);
    const newEnd = timeToMinutes(newTask.endTime);

    existingTasks.forEach((existingTask, existingIdx) => {
      if (existingTask.taskType === 'Deadline') return;
      if (existingTask.date !== newTask.date) return; // Different dates don't conflict

      const existingStart = timeToMinutes(existingTask.startTime);
      const existingEnd = timeToMinutes(existingTask.endTime);

      // Check for overlap
      if (!(newEnd <= existingStart || newStart >= existingEnd)) {
        conflicts.push({
          newTaskIndex: newIdx,
          existingTask: existingTask,
          newTask: newTask,
          overlapMinutes: Math.min(newEnd, existingEnd) - Math.max(newStart, existingStart),
        });
      }
    });
  });

  return conflicts;
};

export const suggestScheduleAdjustments = (tasks, newTasks) => {
  const adjustments = [];
  const suggestions = [];

  newTasks.forEach((newTask, idx) => {
    if (newTask.taskType === 'Deadline') {
      // Check if there's enough study time before deadline
      const deadlineDate = newTask.date;
      const tasksBefore = tasks.filter(t =>
        t.date === deadlineDate && t.taskType === 'Study'
      );

      if (tasksBefore.length === 0) {
        suggestions.push({
          level: 'warning',
          message: `No study sessions scheduled before deadline "${newTask.title}" on ${deadlineDate}. Consider adding study time.`,
        });
      }
      return;
    }

    // Check for study block duration balance
    const duration = timeToMinutes(newTask.endTime) - timeToMinutes(newTask.startTime);
    
    if (newTask.taskType === 'Study' && duration > 120) { // > 2 hours
      suggestions.push({
        level: 'info',
        message: `Study block "${newTask.title}" is ${Math.floor(duration / 60)} hours long. Consider breaking it into shorter sessions with breaks.`,
        taskIndex: idx,
      });
    }

    // Check for excessive daily study load
    const dailyStudyMinutes = tasks
      .filter(t => t.date === newTask.date && t.taskType === 'Study')
      .reduce((total, t) => total + (timeToMinutes(t.endTime) - timeToMinutes(t.startTime)), 0);

    if (dailyStudyMinutes + duration > 480) { // > 8 hours
      suggestions.push({
        level: 'warning',
        message: `Daily study load on ${newTask.date} exceeds 8 hours. Consider distributing tasks across more days.`,
        taskIndex: idx,
      });
    }
  });

  return {
    adjustments,
    suggestions,
  };
};

// Automatically adjust task times to resolve conflicts
export const resolveConflictByShifting = (newTask, existingTask) => {
  const newStart = timeToMinutes(newTask.startTime);
  const newEnd = timeToMinutes(newTask.endTime);
  const duration = newEnd - newStart;

  const existingStart = timeToMinutes(existingTask.startTime);
  const existingEnd = timeToMinutes(existingTask.endTime);

  // Option 1: Move new task after existing task
  const option1Start = existingEnd;
  const option1End = option1Start + duration;

  // Option 2: Move new task before existing task
  const option2End = existingStart;
  const option2Start = option2End - duration;

  // Return the shift that causes least disruption
  if (option1End <= 1440) { // Within 24 hours (1440 minutes)
    return {
      startTime: minutesToTime(option1Start),
      endTime: minutesToTime(option1End),
      suggestion: `Shifted after "${existingTask.title}" (${minutesToTime(existingStart)} - ${minutesToTime(existingEnd)})`,
    };
  }

  if (option2Start >= 0) {
    return {
      startTime: minutesToTime(option2Start),
      endTime: minutesToTime(option2End),
      suggestion: `Shifted before "${existingTask.title}" (${minutesToTime(existingStart)} - ${minutesToTime(existingEnd)})`,
    };
  }

  return null; // Cannot resolve with simple shifting
};

// Get optimal study schedule based on cognitive load
export const optimizeStudySchedule = (tasks) => {
  const studySessions = tasks.filter(t => t.taskType === 'Study');
  const breaks = tasks.filter(t => t.taskType === 'Break');

  // Recommend: 50 minutes study + 10 minutes break (Pomodoro-like)
  const recommendations = [];

  let lastEnd = 0;
  studySessions.forEach((session, idx) => {
    const start = timeToMinutes(session.startTime);
    const duration = timeToMinutes(session.endTime) - start;

    if (duration > 60) {
      recommendations.push({
        type: 'break-recommendation',
        after: session,
        suggestion: `Add a 10-minute break after ${Math.floor(duration / 60)} hours of study`,
      });
    }

    if (idx < studySessions.length - 1) {
      const nextSession = studySessions[idx + 1];
      const gap = timeToMinutes(nextSession.startTime) - timeToMinutes(session.endTime);

      if (gap < 10) {
        recommendations.push({
          type: 'insufficient-break',
          between: [session, nextSession],
          suggestion: `Increase break time between "${session.title}" and "${nextSession.title}" to at least 10 minutes`,
        });
      }
    }
  });

  return recommendations;
};

// Calculate total study hours for a given date
export const calculateDailyStudyHours = (tasks, date) => {
  return tasks
    .filter(t => t.date === date && t.taskType === 'Study')
    .reduce((total, t) => total + (timeToMinutes(t.endTime) - timeToMinutes(t.startTime)), 0) / 60;
};

// Check if schedule is balanced across days
export const assessScheduleBalance = (tasks) => {
  const tasksByDate = {};

  tasks.forEach(task => {
    if (!tasksByDate[task.date]) {
      tasksByDate[task.date] = [];
    }
    tasksByDate[task.date].push(task);
  });

  const assessment = {
    overloaded: [], // > 8 hours/day
    underloaded: [], // < 2 hours/day
    balanced: [],
  };

  Object.entries(tasksByDate).forEach(([date, dateTasks]) => {
    const hours = calculateDailyStudyHours([...dateTasks], date);

    if (hours > 8) {
      assessment.overloaded.push({ date, hours });
    } else if (hours < 2 && hours > 0) {
      assessment.underloaded.push({ date, hours });
    } else if (hours > 0) {
      assessment.balanced.push({ date, hours });
    }
  });

  return assessment;
};
