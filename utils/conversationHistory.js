import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatScheduleForAI } from './userPreferences';
 

const STORAGE_KEY = 'conversationHistory';
 let conversation = [];

 const persist = async () => {
   await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
 };

 export const loadConversation = async () => {
   const saved = await AsyncStorage.getItem(STORAGE_KEY);
   if (saved) {
     conversation = JSON.parse(saved);
     return conversation;
   }
   await resetConversation(); // ensures system message seeded
   return conversation;
 };

 export const getConversation = () => conversation;

export const initConversation = async () => {
   const scheduleContext = await formatScheduleForAI();
   
   addSystemMessage(`
      You are Tomo, an AI Class Schedule Optimizer assistant. Your role is to help students create personalized study schedules based on their classes, deadlines, and free time.
      
      CRITICAL FORMATTING RULES:
      1. Dates MUST be in YYYY-MM-DD format (e.g., 2025-12-15)
      2. Times MUST be in HH:MM AM/PM format (e.g., 02:00 PM, 09:30 AM)
      3. Task titles MUST be wrapped in **double asterisks** like **Task Title Here**
      4. Each task must include: Title, Date, Time (or Deadline time), Type, Priority
      5. For Deadline tasks, only provide the deadline time (not a time range)
      6. For Study and Break tasks, provide time range (start - end)

      When a user wants to create a study plan, ask them for:
      1. The subject/course name and exam/deadline date
      2. Difficulty level (Easy/Medium/Hard)
      3. Description or coverage areas
      
      DO NOT ask about:
      - Their class schedule (already provided below)
      - Their available free time (already provided below)
      - Their study/break preferences (already provided below)

      Once you have enough information, create a STRUCTURED study plan following this EXACT format:
      
      **Study Session 1 - Introduction**
      Coverage: Course fundamentals and basics
      2025-12-15 | Monday
      02:00 PM - 03:30 PM
      Priority: Medium
      Type: Study
      
      **Break Time**
      Coverage: Short recharge between study blocks
      2025-12-15 | Monday
      03:30 PM - 03:45 PM
      Type: Break
      
      **Quiz Deadline**
      Coverage: Final deadline for submission
      2025-12-15 | Monday
      11:59 PM
      Priority: High
      Type: Deadline

      BALANCE RECOMMENDATIONS:
      - If daily study load exceeds 8 hours, suggest spreading across more days
      - If study blocks are too long (>2 hours), suggest breaking them up with breaks
      - If no breaks are scheduled between sessions, recommend adding them
      - If all study is on one day, suggest distributing across 2-3 days for better retention

      After creating a study plan, present it clearly and ask: "Would you like me to add this schedule to your calendar?"
      
      Always be encouraging and supportive. Help students manage their time effectively.
      ${scheduleContext}
   `)
}
 
 export const addUserMessage = async (messageText) => {
      try {
         conversation.push({
            role: 'user',
            content: messageText
         });
         await persist();
      } catch (error) {
         // Remove the failed message
         conversation = conversation.filter(
            (msg) => !(msg.role === 'user' && msg.content === messageText)
         );
         // Alert for error
         alert('Failed to send message. Please try again.');
      }
 }
 export const addAssistantMessage = async (messageText) => {
      try {
         conversation.push({
            role: 'assistant',
            content: messageText
         });
         await persist();
      } catch (error) {
         // Remove the failed message
         conversation = conversation.filter(
            (msg) => !(msg.role === 'assistant' && msg.content === messageText)
         );
         alert('Failed to send assistant message.');
      }
 }
export const addSystemMessage = (messageText) => {
    conversation.push({
        role: 'system',
        content: messageText
    })
 }

export const removeLastMessage = async () => {
   if (conversation.length > 0) {
      conversation.pop();
      await persist();
   }
};

export const resetConversation = async () => {
   conversation = [];
   await initConversation();
   await persist();
}
