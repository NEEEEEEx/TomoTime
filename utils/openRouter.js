// openRouter.js
import { OPENROUTER_API_KEY } from '@env';
import { addAssistantMessage, getConversation } from './conversationHistory';

export const makeChatRequest = async () => {
  // 1. Check if Key is loaded
  if (!OPENROUTER_API_KEY) {
    console.error('❌ FATAL: OPENROUTER_API_KEY is undefined. Check your .env file and babel.config.js');
    throw new Error('Missing API Key Configuration');
  }

  try {
    const messages = getConversation();
    console.log('📤 Sending Request with', messages.length, 'messages');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          // Optional: OpenRouter often requests these for ranking
          // 'HTTP-Referer': 'https://your-site-url.com', 
          // 'X-Title': 'Tomo App',
      },
      body: JSON.stringify({
        model: 'openrouter/auto', // You might want to try 'openai/gpt-3.5-turbo' or 'mistralai/mistral-7b-instruct' if auto fails
        messages: messages,
      }),
    });

    // 2. BETTER ERROR HANDLING
    if (!response.ok) {
      const errorBody = await response.text(); // Read the failure reason
      console.error(`❌ API Error (${response.status}):`, errorBody);
      throw new Error(`API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? '';

    if (!text) {
      console.warn('⚠️ Received empty response content from AI');
    }

    await addAssistantMessage(text);
    return text;

  } catch (error) {
    console.error('❌ makeChatRequest failed:', error);
    throw error;
  }
}