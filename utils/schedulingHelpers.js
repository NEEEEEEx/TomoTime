// Smart scheduling recommendations and optimizations

import { timeToMinutes, calculateDailyStudyHours } from './scheduleConflictDetection';

/**
 * Generate AI-friendly scheduling suggestions for balance
 * These suggestions can be incorporated into AI responses
 */
export const generateSchedulingRecommendations = (tasks, newTasks) => {
  const recommendations = [];

  // Check if tasks are distributed across multiple days
  const newTaskDates = [...new Set(newTasks.map(t => t.date))];
  if (newTaskDates.length === 1) {
    recommendations.push({
      type: 'distribution',
      level: 'medium',
      message: 'All tasks are scheduled on the same day. For better learning retention, consider distributing them across 2-3 days.',
    });
  }

  // Check daily study load
  newTaskDates.forEach(date => {
    const dailyHours = calculateDailyStudyHours(newTasks, date);
    if (dailyHours > 8) {
      recommendations.push({
        type: 'overload',
        level: 'high',
        message: `Study load on ${date} is ${dailyHours.toFixed(1)} hours. Consider limiting to 6-8 hours for optimal learning.`,
      });
    } else if (dailyHours > 6) {
      recommendations.push({
        type: 'heavy',
        level: 'medium',
        message: `Study load on ${date} is ${dailyHours.toFixed(1)} hours. This is acceptable but ensure adequate breaks.`,
      });
    }
  });

  // Check for study block duration
  newTasks.forEach(task => {
    if (task.taskType === 'Study') {
      const duration = timeToMinutes(task.endTime) - timeToMinutes(task.startTime);
      if (duration > 120) {
        recommendations.push({
          type: 'long-session',
          level: 'low',
          message: `"${task.title}" is ${Math.floor(duration / 60)} hours long. Consider breaking it into 45-90 minute blocks with breaks.`,
        });
      }
    }
  });

  // Check for breaks
  const breakTasks = newTasks.filter(t => t.taskType === 'Break');
  if (breakTasks.length === 0 && newTasks.some(t => t.taskType === 'Study')) {
    recommendations.push({
      type: 'no-breaks',
      level: 'medium',
      message: 'No breaks scheduled between study sessions. It\'s recommended to take 10-15 minute breaks every 45-90 minutes.',
    });
  }

  return recommendations;
};

/**
 * Generate suggested time slots based on availability
 * Useful for prompting next study blocks
 */
export const suggestNextStudySlots = (tasks, availableDates, preferredStartTimes = ['09:00 AM', '02:00 PM', '06:00 PM']) => {
  const suggestions = [];

  availableDates.forEach(date => {
    const dateTasks = tasks.filter(t => t.date === date);
    const occupiedSlots = dateTasks
      .filter(t => t.taskType !== 'Deadline')
      .map(t => ({
        start: timeToMinutes(t.startTime),
        end: timeToMinutes(t.endTime),
      }))
      .sort((a, b) => a.start - b.start);

    preferredStartTimes.forEach(startTime => {
      const slotStart = timeToMinutes(startTime);
      const slotEnd = slotStart + 75; // 75-minute study block + 15-min break

      // Check if this slot is available
      const isAvailable = !occupiedSlots.some(slot =>
        !(slotEnd <= slot.start || slotStart >= slot.end)
      );

      if (isAvailable && slotStart + 75 < 1440) { // Before midnight
        suggestions.push({
          date,
          time: startTime,
          duration: 75,
        });
      }
    });
  });

  return suggestions;
};

/**
 * Calculate optimal spacing between study sessions
 */
export const calculateOptimalSpacing = (totalContent, difficulty) => {
  const sessionDuration = {
    'Easy': 45,
    'Medium': 60,
    'Hard': 75,
  }[difficulty] || 60;

  const breakDuration = 15;
  const sessionWithBreak = sessionDuration + breakDuration;

  return {
    sessionDuration,
    breakDuration,
    sessionWithBreak,
    estimatedCycles: Math.ceil(totalContent / sessionDuration),
  };
};

/**
 * Validate if a study plan meets recommended standards
 */
export const validateStudyPlan = (tasks) => {
  const issues = [];
  const warnings = [];

  // Count task types
  const studyTasks = tasks.filter(t => t.taskType === 'Study');
  const breakTasks = tasks.filter(t => t.taskType === 'Break');
  const deadlines = tasks.filter(t => t.taskType === 'Deadline');

  // Must have deadline
  if (deadlines.length === 0) {
    issues.push('Plan must include at least one deadline task');
  }

  // Should have study sessions
  if (studyTasks.length === 0) {
    issues.push('Plan must include at least one study session');
  }

  // Recommend breaks
  if (studyTasks.length > 0 && breakTasks.length === 0) {
    warnings.push('Plan should include break times between study sessions');
  }

  // Check study-to-break ratio (ideally 3-4 study blocks per break)
  if (studyTasks.length > 0 && breakTasks.length > 0) {
    const ratio = studyTasks.length / breakTasks.length;
    if (ratio < 2 || ratio > 5) {
      warnings.push(`Study-to-break ratio is ${ratio.toFixed(1)}:1. Ideal is 3:1 or 4:1`);
    }
  }

  // Check for reasonable task dates
  const taskDates = [...new Set(tasks.map(t => t.date))];
  if (taskDates.length < 2 && tasks.length > 3) {
    warnings.push('Consider spreading tasks across multiple days for better learning retention');
  }

  return { isValid: issues.length === 0, issues, warnings };
};

/**
 * Generate a natural language summary of the study plan
 */
export const generatePlanSummary = (tasks) => {
  const studyTasks = tasks.filter(t => t.taskType === 'Study');
  const breakTasks = tasks.filter(t => t.taskType === 'Break');
  const deadlines = tasks.filter(t => t.taskType === 'Deadline');
  
  const totalStudyTime = studyTasks.reduce((total, t) => {
    return total + (timeToMinutes(t.endTime) - timeToMinutes(t.startTime));
  }, 0);

  const dates = [...new Set(tasks.map(t => t.date))];
  const daysSpan = dates.length;

  let summary = `This study plan includes:\n`;
  summary += `• ${studyTasks.length} study sessions (${Math.round(totalStudyTime / 60)} hours total)\n`;
  
  if (breakTasks.length > 0) {
    summary += `• ${breakTasks.length} scheduled breaks\n`;
  }
  
  if (deadlines.length > 0) {
    const deadline = deadlines[0];
    summary += `• Final deadline: ${deadline.date} at ${deadline.endTime}\n`;
  }

  summary += `• Spread across ${daysSpan} day${daysSpan > 1 ? 's' : ''}`;

  return summary;
};
