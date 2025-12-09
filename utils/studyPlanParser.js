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
      if (currentTask) {
        console.log('Saving previous task:', currentTask);
        tasks.push(currentTask);
      }
      
      currentTask = {
        title: titleMatch[1].trim(),
        description: '',
        taskType: 'Study', // Default
        priority: 'Medium', // Default
      };
      console.log('New task started:', currentTask.title);
      taskCount++;
    }

    // Extract task type (prioritize explicit "Type: X" declarations)
    if (currentTask) {
      const explicitTypeMatch = trimmed.match(/^Type:\s*(Study|Break|Deadline)$/i);
      if (explicitTypeMatch) {
        currentTask.taskType = explicitTypeMatch[1].charAt(0).toUpperCase() + explicitTypeMatch[1].slice(1).toLowerCase();
      } else if (!currentTask.date) { // Only infer type from title if not explicitly set
        if (trimmed.toLowerCase().includes('break')) {
          currentTask.taskType = 'Break';
        } else if (trimmed.toLowerCase().includes('deadline') || trimmed.toLowerCase().includes('due')) {
          currentTask.taskType = 'Deadline';
        } else if (trimmed.toLowerCase().includes('study')) {
          currentTask.taskType = 'Study';
        }
      }

      // Extract date (YYYY-MM-DD format)
      const dateMatch = trimmed.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        currentTask.date = dateMatch[1];
        const dateObj = new Date(dateMatch[1]);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        currentTask.day = days[dateObj.getDay()];
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
  
  const filteredTasks = tasks.filter(task => {
    const hasDate = !!task.date;
    const hasTitle = !!task.title;
    console.log(`Task "${task.title}": hasDate=${hasDate}, hasTitle=${hasTitle}`);
    return hasDate && hasTitle;
  });
  
  console.log('Filtered tasks (with date and title):', JSON.stringify(filteredTasks, null, 2));
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
