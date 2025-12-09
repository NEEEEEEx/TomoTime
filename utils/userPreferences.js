// User preferences and schedule storage
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEMESTER_KEY = 'userSemester';
const CLASSES_KEY = 'userClasses';
const FREETIME_KEY = 'userFreeTime';

// ============= Semester Preferences ============= //
export const saveSemesterPreferences = async (semester) => {
  try {
    await AsyncStorage.setItem(SEMESTER_KEY, JSON.stringify(semester));
  } catch (error) {
    console.error('Failed to save semester preferences:', error);
  }
};

export const getSemesterPreferences = async () => {
  try {
    const saved = await AsyncStorage.getItem(SEMESTER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load semester preferences:', error);
    return null;
  }
};

// ============= Class Schedule ============= //
export const saveClassSchedule = async (classes) => {
  try {
    await AsyncStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
  } catch (error) {
    console.error('Failed to save class schedule:', error);
  }
};

export const getClassSchedule = async () => {
  try {
    const saved = await AsyncStorage.getItem(CLASSES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load class schedule:', error);
    return [];
  }
};

// ============= Free Time ============= //
export const saveFreeTime = async (freeTime) => {
  try {
    await AsyncStorage.setItem(FREETIME_KEY, JSON.stringify(freeTime));
  } catch (error) {
    console.error('Failed to save free time:', error);
  }
};

export const getFreeTime = async () => {
  try {
    const saved = await AsyncStorage.getItem(FREETIME_KEY);
    return saved ? JSON.parse(saved) : [];
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
  const { semester, classes, freeTime } = await getUserScheduleContext();

  let context = '';

  // Add semester preferences
  if (semester) {
    context += `\n\nUSER'S STUDY PREFERENCES:\n`;
    context += `- Semester: ${semester.title}\n`;
    context += `- Preferred study block duration: ${semester.study}\n`;
    context += `- Preferred break duration: ${semester.break}\n`;
  }

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
    
    // Group by day
    const freeByDay = {};
    freeTime.forEach(slot => {
      if (!freeByDay[slot.title]) {
        freeByDay[slot.title] = [];
      }
      freeByDay[slot.title].push(slot);
    });

    Object.entries(freeByDay).forEach(([day, slots]) => {
      context += `${day}:\n`;
      slots.forEach(slot => {
        context += `  - ${slot.startTime} - ${slot.endTime}\n`;
      });
    });
  }

  // Add instructions
  if (classes.length > 0 || freeTime.length > 0) {
    context += `\n\nIMPORTANT: When creating study plans, ONLY schedule study sessions during the user's available free time listed above. AVOID scheduling during class times. Use the user's preferred study and break durations when possible.`;
  }

  return context;
};
