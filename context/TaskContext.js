import React, { createContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, setUserData } from '../utils/userStorage';

export const TaskContext = createContext();

const TASKS_STORAGE_KEY = 'scheduleTasks';

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const taskIdCounter = React.useRef(0);

  // Initialize tasks from storage
  const loadTasks = useCallback(async () => {
    try {
      const saved = await getUserData(TASKS_STORAGE_KEY);
      if (saved) {
        setTasks(saved);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, []);

  // Persist tasks to storage
  const persistTasks = useCallback(async (updatedTasks) => {
    try {
      await setUserData(TASKS_STORAGE_KEY, updatedTasks);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to persist tasks:', error);
    }
  }, []);

  // Add a new task
  const addTask = useCallback((task) => {
    // Generate unique ID using timestamp + counter
    taskIdCounter.current += 1;
    const uniqueId = `${Date.now()}-${taskIdCounter.current}`;
    
    const newTask = {
      taskId: uniqueId,
      ...task,
    };
    
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTask];
      // Persist asynchronously without blocking
      setUserData(TASKS_STORAGE_KEY, updatedTasks).catch(error => {
        console.error('Failed to persist tasks:', error);
      });
      return updatedTasks;
    });
    
    return newTask;
  }, []);

  // Update an existing task
  const updateTask = useCallback((taskId, updates) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task =>
        task.taskId === taskId ? { ...task, ...updates } : task
      );
      // Persist asynchronously
      setUserData(TASKS_STORAGE_KEY, updatedTasks).catch(error => {
        console.error('Failed to persist tasks:', error);
      });
      return updatedTasks;
    });
  }, []);

  // Delete a task
  const deleteTask = useCallback((taskId) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task.taskId !== taskId);
      // Persist asynchronously
      setUserData(TASKS_STORAGE_KEY, updatedTasks).catch(error => {
        console.error('Failed to persist tasks:', error);
      });
      return updatedTasks;
    });
  }, []);

  // Get tasks for a specific date
  const getTasksForDate = useCallback((dateString) => {
    return tasks.filter(task => task.date === dateString);
  }, [tasks]);

  // Get all tasks
  const getAllTasks = useCallback(() => {
    return tasks;
  }, [tasks]);

  // Check for time conflicts
  const checkTimeConflict = useCallback((date, startTime, endTime, excludeTaskId = null) => {
    const tasksOnDate = tasks.filter(task => 
      task.date === date && (!excludeTaskId || task.taskId !== excludeTaskId)
    );

    const timeToMinutes = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    return tasksOnDate.filter(task => {
      if (task.taskType === 'Deadline') return false; // Deadlines don't conflict with time
      
      const existingStart = timeToMinutes(task.startTime);
      const existingEnd = timeToMinutes(task.endTime);

      // Check for overlap
      return !(newEnd <= existingStart || newStart >= existingEnd);
    });
  }, [tasks]);

  const value = {
    tasks,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    getTasksForDate,
    getAllTasks,
    checkTimeConflict,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
