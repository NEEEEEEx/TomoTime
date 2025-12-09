import AsyncStorage from '@react-native-async-storage/async-storage';
 

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

export const initConversation = () => {
   addSystemMessage(`
      You are Tomo, an AI Class Schedule Optimizer assistant. Your role is to help students create personalized study schedules based on their classes, deadlines, and free time.
      When a user wants to create a study plan, ask them for:
      1. The subject/course name and exam/deadline date
      2. Difficulty level (Easy/Medium/Hard)
      3. Description or coverage areas
      4. Any other tasks or classes they mention

      Once you have enough information, create a structured study plan with specific study blocks, break times, and deadlines.

      When generating a study plan, format it clearly with:
      - Task name/title
      - Date and time slots (if available)
      - Priority level (High/Medium/Low)
      - Description of what to study

      Always be encouraging and supportive. After creating a study plan, ask if they want to approve and add it to their calendar.
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

export const resetConversation = async () => {
   conversation = [];
   initConversation();
   await persist();
}
