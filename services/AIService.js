// services/AIService.js
import RNFS from 'react-native-fs';
import { OPENROUTER_API_KEY } from '@env';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const parseScheduleImage = async (imageUri) => {
  try {
    // 1. Convert Image to Base64
    const base64Image = await RNFS.readFile(imageUri, 'base64');

    // 2. Prepare the Payload for a Vision Model (e.g., Qwen-VL or Gemini)
    const payload = {
      model: "qwen/qwen-vl-plus", // Good balance of cost/performance for vision
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image. Extract the class schedule data. Return ONLY a valid JSON array with this structure: [{\"title\": \"Subject Name\", \"day\": \"Monday\", \"start_time\": \"09:00\", \"end_time\": \"10:30\"}]. Use 24-hour format. If a class is on multiple days (e.g., MWF), create separate objects for each day."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ]
    };

    // 3. Send to OpenRouter
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/NEEEEEEx/TomoTime',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error('No response from AI');
    }

    // 4. Extract and Parse JSON
    // The AI might return markdown like ```json ... ```, so we clean it.
    let rawText = data.choices[0].message.content;
    const jsonMatch = rawText.match(/\[.*\]/s); // Regex to find the array
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('AI did not return valid JSON');
    }

  } catch (error) {
    console.error("AI Parsing Error:", error);
    throw error;
  }
};