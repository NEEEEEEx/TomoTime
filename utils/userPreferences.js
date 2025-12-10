// User preferences and schedule storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, setUserData } from './userStorage';

// Storage keys (will be prefixed with user ID automatically)
const SEMESTERS_KEY = 'semesters';
const SELECTED_SEMESTER_KEY = 'selected_semester';
const MULTISTEP_VALIDATION_KEY = 'multistep_validation';

// Legacy keys for backward compatibility (also will be user-specific)
const SEMESTER_KEY = 'userSemester';
const CLASSES_KEY = 'userClasses';
const FREETIME_KEY = 'userFreeTime';

// ============= Semester Management ============= //
export const saveSemesters = async (semesters) => {
  try {
    await setUserData(SEMESTERS_KEY, semesters);
  } catch (error) {
    console.error('Failed to save semesters:', error);
  }
};

export const getSemesters = async () => {
  try {
    const saved = await getUserData(SEMESTERS_KEY);
    return saved ? saved : [];
  } catch (error) {
    console.error('Failed to load semesters:', error);
    return [];
  }
};

export const getSelectedSemester = async () => {
  try {
    const semesters = await getSemesters();
    const selectedSemester = semesters.find(sem => sem.selected);
    return selectedSemester || null;
  } catch (error) {
    console.error('Failed to get selected semester:', error);
    return null;
  }
};

export const saveSelectedSemester = async (semesterId) => {
  try {
    const semesters = await getSemesters();
    const updatedSemesters = semesters.map(sem => ({
      ...sem,
      selected: sem.id === semesterId
    }));
    await saveSemesters(updatedSemesters);
    await setUserData(SELECTED_SEMESTER_KEY, String(semesterId));
  } catch (error) {
    console.error('Failed to save selected semester:', error);
  }
};

// ============= Semester-based Data (Classes & Free Time) ============= //
const getSemesterDataKey = (semesterId, type) => {
  return `semester_${semesterId}_${type}`;
};

export const saveClassScheduleForSemester = async (semesterId, classes) => {
  try {
    const key = getSemesterDataKey(semesterId, 'classes');
    await setUserData(key, classes);
  } catch (error) {
    console.error('Failed to save class schedule for semester:', error);
  }
};

export const getClassScheduleForSemester = async (semesterId) => {
  try {
    const key = getSemesterDataKey(semesterId, 'classes');
    const saved = await getUserData(key);
    return saved ? saved : [];
  } catch (error) {
    console.error('Failed to load class schedule for semester:', error);
    return [];
  }
};

export const saveFreeTimeForSemester = async (semesterId, freeTime) => {
  try {
    const key = getSemesterDataKey(semesterId, 'freetime');
    await setUserData(key, freeTime);
  } catch (error) {
    console.error('Failed to save free time for semester:', error);
  }
};

export const getFreeTimeForSemester = async (semesterId) => {
  try {
    const key = getSemesterDataKey(semesterId, 'freetime');
    const saved = await getUserData(key);
    return saved ? saved : [];
  } catch (error) {
    console.error('Failed to load free time for semester:', error);
    return [];
  }
};

// ============= Legacy Support (for current AI integration) ============= //
export const saveSemesterPreferences = async (semester) => {
  try {
    await setUserData(SEMESTER_KEY, semester);
  } catch (error) {
    console.error('Failed to save semester preferences:', error);
  }
};

export const getSemesterPreferences = async () => {
  try {
    // Get selected semester from new system
    const selectedSemester = await getSelectedSemester();
    if (selectedSemester) {
      return selectedSemester;
    }
    
    // If no semester is selected, return null
    return null;
  } catch (error) {
    console.error('Failed to load semester preferences:', error);
    return null;
  }
};

export const saveClassSchedule = async (classes) => {
  try {
    await setUserData(CLASSES_KEY, classes);
    
    // Also save to selected semester
    const selectedSemester = await getSelectedSemester();
    if (selectedSemester) {
      await saveClassScheduleForSemester(selectedSemester.id, classes);
    }
  } catch (error) {
    console.error('Failed to save class schedule:', error);
  }
};

export const getClassSchedule = async () => {
  try {
    // Get from selected semester only
    const selectedSemester = await getSelectedSemester();
    if (selectedSemester) {
      const classes = await getClassScheduleForSemester(selectedSemester.id);
      return classes;
    }
    
    // No selected semester, return empty array
    return [];
  } catch (error) {
    console.error('Failed to load class schedule:', error);
    return [];
  }
};

export const saveFreeTime = async (freeTime) => {
  try {
    await setUserData(FREETIME_KEY, freeTime);
    
    // Also save to selected semester
    const selectedSemester = await getSelectedSemester();
    if (selectedSemester) {
      await saveFreeTimeForSemester(selectedSemester.id, freeTime);
    }
  } catch (error) {
    console.error('Failed to save free time:', error);
  }
};

export const getFreeTime = async () => {
  try {
    // Get from selected semester only
    const selectedSemester = await getSelectedSemester();
    if (selectedSemester) {
      const freeTime = await getFreeTimeForSemester(selectedSemester.id);
      return freeTime;
    }
    
    // No selected semester, return empty array
    return [];
  } catch (error) {
    console.error('Failed to load free time:', error);
    return [];
  }
};

// ============= Combined User Context ============= //
export const getUserScheduleContext = async () => {
  const semester = await getSemesterPreferences();
  const classes = await getClassSchedule();
  const freeTime = await getFreeTime();

  return {
    semester,
    classes,
    freeTime,
  };
};

// ============= Format for AI Context ============= //
export const formatScheduleForAI = async () => {
  const selectedSemester = await getSelectedSemester();
  
  // If no semester is selected, return a message prompting user to select one
  if (!selectedSemester) {
    return `\n\nNOTE: No semester is currently selected. Please ask the user to select a semester in the Multi-Step setup before creating study plans.`;
  }

  const classes = await getClassScheduleForSemester(selectedSemester.id);
  const freeTime = await getFreeTimeForSemester(selectedSemester.id);

  let context = '';

  // Add semester preferences
  context += `\n\nUSER'S STUDY PREFERENCES (Current Semester: ${selectedSemester.title}):\n`;
  const studyTime = String(selectedSemester.study).includes('min') ? selectedSemester.study : `${selectedSemester.study} min`;
  const breakTime = String(selectedSemester.break).includes('min') ? selectedSemester.break : `${selectedSemester.break} min`;
  context += `- Semester: ${selectedSemester.title}\n`;
  context += `- Preferred study block duration: ${studyTime}\n`;
  context += `- Preferred break duration: ${breakTime}\n`;

  // Add class schedule
  if (classes && classes.length > 0) {
    context += `\n\nUSER'S CLASS SCHEDULE (when they are NOT available):\n`;
    
    // Group classes by day
    const classesByDay = {};
    classes.forEach(cls => {
      if (!classesByDay[cls.day]) {
        classesByDay[cls.day] = [];
      }
      classesByDay[cls.day].push(cls);
    });

    // Format by day
    Object.entries(classesByDay).forEach(([day, dayClasses]) => {
      context += `${day}:\n`;
      dayClasses.forEach(cls => {
        context += `  - ${cls.title}: ${cls.startTime} - ${cls.endTime}\n`;
      });
    });
  }

  // Add free time
  if (freeTime && freeTime.length > 0) {
    context += `\n\nUSER'S AVAILABLE FREE TIME (when they CAN study):\n`;
    
    // Group by day and calculate total hours
    const freeByDay = {};
    const dayTotalHours = {};
    
    freeTime.forEach(slot => {
      if (!freeByDay[slot.title]) {
        freeByDay[slot.title] = [];
        dayTotalHours[slot.title] = 0;
      }
      freeByDay[slot.title].push(slot);
      
      // Calculate duration for this slot
      const duration = calculateSlotDuration(slot.startTime, slot.endTime);
      dayTotalHours[slot.title] += duration;
    });

    // Sort days by proximity to current date
    const sortedDays = sortDaysByProximity(Object.keys(freeByDay));

    sortedDays.forEach((day) => {
      const slots = freeByDay[day];
      const totalHours = dayTotalHours[day];
      context += `${day} (${totalHours.toFixed(1)} hours available):\n`;
      slots.forEach(slot => {
        context += `  - ${slot.startTime} - ${slot.endTime}\n`;
      });
    });
  }

  // Add instructions
  if (classes.length > 0 || freeTime.length > 0) {
    context += `\n\nIMPORTANT: When creating study plans, ONLY schedule study sessions during the user's available free time listed above. AVOID scheduling during class times. Use the user's preferred study and break durations when possible.`;
  } else {
    context += `\n\nNOTE: The user has not added any class schedule or free time slots yet. Please remind them to add this information in the Multi-Step setup for better study plan recommendations.`;
  }

  return context;
};

// ============= Helper Functions for AI Context ============= //

// Calculate duration in hours between two time strings
const calculateSlotDuration = (startTime, endTime) => {
  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours + minutes / 60;
  };
  
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  return end > start ? end - start : (24 - start) + end;
};

// Sort days by proximity to current date
const sortDaysByProximity = (days) => {
  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Create array of days with their distance from today
  const daysWithDistance = days.map(day => {
    const dayIndex = dayOrder.indexOf(day);
    let distance = (dayIndex - currentDayIndex + 7) % 7;
    
    // If distance is 0, it means today - keep it as 0 for highest priority
    // Otherwise, calculate days until this day occurs
    if (distance === 0) {
      distance = 0; // Today
    } else {
      distance = distance; // Days in the future
    }
    
    return { day, distance, dayIndex };
  });
  
  // Sort by distance (closest days first), then by day order
  daysWithDistance.sort((a, b) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    return a.dayIndex - b.dayIndex;
  });
  
  return daysWithDistance.map(item => item.day);
};

// ============= MultiStep Validation ============= //
export const saveMultiStepValidation = async (validationData) => {
  try {
    await setUserData(MULTISTEP_VALIDATION_KEY, validationData);
  } catch (error) {
    console.error('Failed to save MultiStep validation:', error);
  }
};

export const getMultiStepValidation = async () => {
  try {
    const saved = await getUserData(MULTISTEP_VALIDATION_KEY);
    return saved ? saved : {
      step0Complete: false,
      step1Complete: false,
      step2Complete: false
    };
  } catch (error) {
    console.error('Failed to load MultiStep validation:', error);
    return {
      step0Complete: false,
      step1Complete: false,
      step2Complete: false
    };
  }
};

export const updateStepValidation = async (stepIndex, isComplete) => {
  try {
    const validation = await getMultiStepValidation();
    validation[`step${stepIndex}Complete`] = isComplete;
    await saveMultiStepValidation(validation);
    return validation;
  } catch (error) {
    console.error('Failed to update step validation:', error);
    return null;
  }
};

export const isMultiStepComplete = async () => {
  try {
    const validation = await getMultiStepValidation();
    return validation.step0Complete && validation.step1Complete && validation.step2Complete;
  } catch (error) {
    console.error('Failed to check MultiStep completion:', error);
    return false;
  }
};

export const resetMultiStepValidation = async () => {
  try {
    await setUserData(MULTISTEP_VALIDATION_KEY, {
      step0Complete: false,
      step1Complete: false,
      step2Complete: false
    });
  } catch (error) {
    console.error('Failed to reset MultiStep validation:', error);
  }
};
