let GoogleGenerativeAI: any;
let genAI: any;

// Dynamically import Google Generative AI to handle missing dependency gracefully
try {
  const { GoogleGenerativeAI: GAI } = require('@google/generative-ai');
  GoogleGenerativeAI = GAI;
  genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');
} catch (error) {
  console.warn('Google Generative AI not available:', error);
}

function isGeminiAvailable(): boolean {
  return !!(GoogleGenerativeAI && process.env.EXPO_PUBLIC_GEMINI_API_KEY && genAI);
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!isGeminiAvailable()) {
    console.warn('Gemini AI not available or API key not found. Translation disabled.');
    return text;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    
    const prompt = `Translate the following Catholic Mass text to ${targetLanguage}. Maintain the sacred and liturgical tone. Only return the translated text without any additional commentary: "${text}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();
    
    return translatedText?.trim() || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

export async function generateHomily(readings: string, saint: string): Promise<string> {
  if (!isGeminiAvailable()) {
    return "Please configure your Gemini API key to generate homilies. You can get one from https://makersuite.google.com/app/apikey";
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    
    const prompt = `Write a thoughtful Catholic homily based on today's Mass readings and saint. Keep it inspiring, pastoral, and around 400-500 words. Focus on practical applications for daily Christian life.

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

Write in a warm, pastoral tone suitable for a diverse congregation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const homily = response.text();
    
    return homily || "Unable to generate homily at this time. Please try again later.";
  } catch (error) {
    console.error('Homily generation error:', error);
    return "Unable to generate homily at this time. Please check your internet connection and try again.";
  }
}

export async function generateSaintPrayer(saintName: string): Promise<string> {
  if (!isGeminiAvailable()) {
    return `${saintName}, pray for us. Help us to follow your example of faith and devotion to God. May we live lives of holiness and service to others, just as you did. Amen.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    
    const prompt = `Write a short, beautiful Catholic prayer to ${saintName}. The prayer should:
1. Be 2-3 sentences long
2. Ask for the saint's intercession
3. Reference their specific virtues or works if known
4. Be suitable for personal devotion
5. End with "Amen"

Keep it reverent and theologically sound according to Catholic tradition.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const prayer = response.text();
    
    return prayer?.trim() || `${saintName}, pray for us. Help us to follow your example of faith and devotion to God. May we live lives of holiness and service to others, just as you did. Amen.`;
  } catch (error) {
    console.error('Prayer generation error:', error);
    return `${saintName}, pray for us. Help us to follow your example of faith and devotion to God. May we live lives of holiness and service to others, just as you did. Amen.`;
  }
}