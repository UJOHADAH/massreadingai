// Note: You'll need to add your Gemini API key to environment variables
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Translation disabled.');
    return text;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Translate the following Catholic Mass text to ${targetLanguage}. Maintain the sacred and liturgical tone: "${text}"`
          }]
        }]
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

export async function generateHomily(readings: string, saint: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return "Please configure your Gemini API key to generate homilies.";
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Write a thoughtful Catholic homily based on today's Mass readings and saint. Keep it inspiring, pastoral, and around 300-400 words.

Readings: ${readings}
Saint of the Day: ${saint}

Please write a homily that connects these readings to daily Christian life.`
          }]
        }]
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate homily at this time.";
  } catch (error) {
    console.error('Homily generation error:', error);
    return "Unable to generate homily at this time.";
  }
}