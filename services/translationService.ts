// Gemini API key from environment variables
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
            text: `Translate the following Catholic Mass text to ${targetLanguage}. Maintain the sacred and liturgical tone. Only return the translated text without any additional commentary: "${text}"`
          }]
        }]
      })
    });

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return translatedText?.trim() || text;
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
            text: `Write a thoughtful Catholic homily based on today's Mass readings and saint. Keep it inspiring, pastoral, and around 400-500 words. Focus on practical applications for daily Christian life.

Today's Mass Readings:
${readings}

Saint of the Day:
${saint}

Please write a homily that:
1. Connects the readings to the saint's example
2. Provides practical guidance for living as a Catholic
3. Is encouraging and spiritually nourishing
4. Maintains proper Catholic theology and doctrine
5. Speaks to contemporary challenges while being rooted in tradition

Write in a warm, pastoral tone suitable for a diverse congregation.`
          }]
        }]
      })
    });

    const data = await response.json();
    const homily = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return homily || "Unable to generate homily at this time. Please try again later.";
  } catch (error) {
    console.error('Homily generation error:', error);
    return "Unable to generate homily at this time. Please check your internet connection and try again.";
  }
}

export async function generateSaintPrayer(saintName: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return `${saintName}, pray for us. Help us to follow your example of faith and devotion to God. May we live lives of holiness and service to others, just as you did. Amen.`;
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
            text: `Write a short, beautiful Catholic prayer to ${saintName}. The prayer should:
1. Be 2-3 sentences long
2. Ask for the saint's intercession
3. Reference their specific virtues or works if known
4. Be suitable for personal devotion
5. End with "Amen"

Keep it reverent and theologically sound according to Catholic tradition.`
          }]
        }]
      })
    });

    const data = await response.json();
    const prayer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return prayer?.trim() || `${saintName}, pray for us. Help us to follow your example of faith and devotion to God. May we live lives of holiness and service to others, just as you did. Amen.`;
  } catch (error) {
    console.error('Prayer generation error:', error);
    return `${saintName}, pray for us. Help us to follow your example of faith and devotion to God. May we live lives of holiness and service to others, just as you did. Amen.`;
  }
}