import { OPENROUTER_API_KEY } from '@env';
import { addAssistantMessage, getConversation } from './conversationHistory';

export const makeChatRequest = async () => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: getConversation(),
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // if (response.choices){
    //     const responseText = response?.choices[0]?.message?.content ?? '';
    //     responseText = responseText.replace(/(\r\n|\n|\r)/gm, ''); // remove new lines if any
    //     console.log(responseText);
    //     return;
    // }
    const data = await response.json();

    const text = data?.choices?.[0]?.message?.content ?? '';

    addAssistantMessage(text);
    console.log(getConversation());
    return text;
  } catch (error) {
    console.error('makeChatRequest failed:', error);
    throw error;
  }
}