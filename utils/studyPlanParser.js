// Utility to parse AI-generated study plan and extract task data
export const parseStudyPlan = (aiResponse) => {
  /*
    Expected AI response format should contain:
    - Task titles (Study blocks, Break times, Deadlines)
    - Dates and times
    - Priority levels
    - Descriptions
    
    Returns an array of task objects with structure:
    {
      title: string,
      description: string,
      date: 'YYYY-MM-DD',
      day: string,
      startTime: 'HH:MM AM/PM' (optional for Deadline),
      endTime: 'HH:MM AM/PM',
      priority: 'Low' | 'Medium' | 'High',
      taskType: 'Study' | 'Break' | 'Deadline'
    }
  */

  const tasks = [];
  const lines = aiResponse.split('\n');

  let currentTask = null;
  let taskCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;

    console.log('Processing line:', trimmed);

    // Try to detect task title (usually numbered or with bold markers **)
    const titleMatch = trimmed.match(/^[\d.]*\s*\*\*([^*]+)\*\*/);
    if (titleMatch) {
      // Save previous task if exists
      if (currentTask && currentTask.title) {
        console.log('Saving previous task:', currentTask);
        tasks.push(currentTask);
      }
      
      const title = titleMatch[1].trim();
      currentTask = {
        title: title,
        description: '',
        taskType: 'Study', // Default
        priority: 'Medium', // Default
      };
      
      // Infer task type from title
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('break')) {
        currentTask.taskType = 'Break';
        currentTask.priority = 'Low';
      } else if (lowerTitle.includes('deadline') || lowerTitle.includes('due') || lowerTitle.includes('exam') || lowerTitle.includes('quiz') || lowerTitle.includes('test') || lowerTitle.includes('project')) {
        // Check if the title itself suggests it's a deadline
        if (lowerTitle.includes('deadline') || lowerTitle.includes('due')) {
          currentTask.taskType = 'Deadline';
          currentTask.priority = 'High';
        }
      }
      
      console.log('New task started:', currentTask.title, 'Type:', currentTask.taskType);
      taskCount++;
    }

    // Extract task type (prioritize explicit "Type: X" declarations)
    if (currentTask) {
      const explicitTypeMatch = trimmed.match(/^Type:\s*(Study|Break|Deadline)$/i);
      if (explicitTypeMatch) {
        const typeValue = explicitTypeMatch[1].charAt(0).toUpperCase() + explicitTypeMatch[1].slice(1).toLowerCase();
        currentTask.taskType = typeValue;
        console.log(`Explicit type found: ${typeValue} for task: ${currentTask.title}`);
      }

      // Extract date (YYYY-MM-DD format)
      const dateMatch = trimmed.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        currentTask.date = dateMatch[1];
        const dateObj = new Date(dateMatch[1]);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        currentTask.day = days[dateObj.getDay()];
        console.log(`Date found: ${currentTask.date} (${currentTask.day}) for task: ${currentTask.title}`);
      }

      // Extract time range (HH:MM AM/PM - HH:MM AM/PM) or single time for deadlines
      const timeMatch = trimmed.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
      if (timeMatch) {
        currentTask.startTime = normalizeTime(timeMatch[1]);
        currentTask.endTime = normalizeTime(timeMatch[2]);
      } else {
        // Check for single time (for Deadline tasks)
        const singleTimeMatch = trimmed.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
        if (singleTimeMatch && !currentTask.endTime) {
          currentTask.endTime = normalizeTime(singleTimeMatch[1]);
          // For deadline tasks, startTime is not needed
          if (currentTask.taskType === 'Deadline') {
            currentTask.startTime = currentTask.endTime;
          }
        }
      }

      // Extract priority (prioritize explicit "Priority: X" declarations)
      const explicitPriorityMatch = trimmed.match(/^Priority:\s*(High|Medium|Low)$/i);
      if (explicitPriorityMatch) {
        currentTask.priority = explicitPriorityMatch[1].charAt(0).toUpperCase() + explicitPriorityMatch[1].slice(1).toLowerCase();
      }

      // Accumulate description
      const hasTimeOnThisLine = trimmed.match(/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/i);
      if (!titleMatch && !dateMatch && !hasTimeOnThisLine) {
        // Extract description from lines like "Coverage: text" or "Description: text"
        const descMatch = trimmed.match(/^(?:Coverage|Description):\s*(.+)$/i);
        const descText = descMatch ? descMatch[1] : trimmed;
        
        // Only add meaningful text (not just "Type: Study", "Priority: High", etc.)
        if (!trimmed.match(/^(?:Type|Priority|Deadline):/i)) {
          if (currentTask.description) {
            currentTask.description += ' ' + descText;
          } else {
            currentTask.description = descText;
          }
        }
      }
    }
  }

  // Add the last task
  if (currentTask) {
    console.log('Saving last task:', currentTask);
    tasks.push(currentTask);
  }

  console.log('All parsed tasks before filtering:', JSON.stringify(tasks, null, 2));
  
  // Get current date for validation
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
  
  const filteredTasks = tasks.filter(task => {
    const hasDate = !!task.date;
    const hasTitle = !!task.title;
    
    // Check if date is not in the past
    let isNotPast = true;
    if (task.date) {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      isNotPast = taskDate >= today;
      
      if (!isNotPast) {
        console.warn(`⚠️ Filtering out past task: "${task.title}" scheduled for ${task.date} (already passed)`);
      }
    }
    
    console.log(`Task "${task.title}": hasDate=${hasDate}, hasTitle=${hasTitle}, isNotPast=${isNotPast}`);
    return hasDate && hasTitle && isNotPast;
  });
  
  console.log('Filtered tasks (with date, title, and not in past):', JSON.stringify(filteredTasks, null, 2));
  
  // Log warning if any tasks were filtered due to past dates
  const pastTasksCount = tasks.filter(t => t.date && t.title).length - filteredTasks.length;
  if (pastTasksCount > 0) {
    console.warn(`⚠️ Removed ${pastTasksCount} task(s) with past dates from the study plan`);
  }
  
  return filteredTasks;
};

// Normalize time format to "HH:MM AM/PM"
const normalizeTime = (timeStr) => {
  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
  
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3];
    
    // Ensure 2-digit format
    hours = hours.toString().padStart(2, '0');
    
    return `${hours}:${minutes} ${period}`;
  }
  
  return cleaned;
};

// Generate a formatted study plan confirmation message
export const formatStudyPlanConfirmation = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return 'No tasks in the plan';
  }

  let message = 'Here\'s your proposed study plan:\n\n';

  tasks.forEach((task, index) => {
    message += `${index + 1}. ${task.title}\n`;
    
    if (task.description) {
      message += `   Description: ${task.description}\n`;
    }
    
    message += `   Date: ${task.date} (${task.day})\n`;
    
    if (task.taskType === 'Deadline') {
      message += `   Deadline: ${task.endTime}\n`;
    } else {
      message += `   Time: ${task.startTime} - ${task.endTime}\n`;
    }
    
    message += `   Type: ${task.taskType}\n`;
    
    if (task.priority) {
      message += `   Priority: ${task.priority}\n`;
    }
    
    message += '\n';
  });

  message += 'Would you like to approve and add this plan to your calendar?';

  return message;
};

// Check if an AI response contains a study plan
export const isStudyPlanResponse = (response) => {
  const planIndicators = ['study plan', 'schedule', 'timeline', 'time slot', 'break', 'deadline'];
  const lowerResponse = response.toLowerCase();
  
  return planIndicators.some(indicator => lowerResponse.includes(indicator)) &&
         response.match(/\d{4}-\d{2}-\d{2}|AM|PM|am|pm/);
};
