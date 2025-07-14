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

// Language mapping for better translation context
const languageMap: { [key: string]: string } = {
  'en': 'English',
  'es': 'Spanish (formal liturgical Spanish)',
  'fr': 'French (formal liturgical French)',
  'it': 'Italian (formal liturgical Italian)',
  'pt': 'Portuguese (formal liturgical Portuguese)',
  'de': 'German (formal liturgical German)',
  'pl': 'Polish (formal liturgical Polish)',
  'la': 'Latin (traditional liturgical Latin)',
  'zh': 'Chinese (Simplified)',
  'ko': 'Korean',
  'ja': 'Japanese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'ru': 'Russian',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'fi': 'Finnish',
  'hu': 'Hungarian',
  'cs': 'Czech',
  'sk': 'Slovak',
  'hr': 'Croatian',
  'sl': 'Slovenian',
  'bg': 'Bulgarian',
  'ro': 'Romanian',
  'el': 'Greek',
  'he': 'Hebrew',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'lt': 'Lithuanian',
  'lv': 'Latvian',
  'et': 'Estonian',
  'mt': 'Maltese',
  'ga': 'Irish',
  'cy': 'Welsh',
  'eu': 'Basque',
  'ca': 'Catalan',
  'gl': 'Galician',
};

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!isGeminiAvailable()) {
    console.warn('Gemini AI not available or API key not found. Translation disabled.');
    return text;
  }

  if (targetLanguage === 'en') {
    return text;
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent translations
        topP: 0.8,
        topK: 40,
      }
    });
    
    const targetLangName = languageMap[targetLanguage] || targetLanguage;
    
    const prompt = `You are a professional Catholic liturgical translator. Translate the following Catholic Mass reading text to ${targetLangName}. 

IMPORTANT GUIDELINES:
1. Maintain the sacred, reverent, and liturgical tone appropriate for Catholic Mass
2. Use formal, traditional religious language where appropriate
3. Preserve biblical references and proper nouns
4. Keep the spiritual meaning and theological accuracy intact
5. Use appropriate liturgical terminology for the target language
6. Ensure the translation flows naturally while maintaining reverence
7. For Latin translations, use traditional ecclesiastical Latin forms

Text to translate:
"${text}"

Provide ONLY the translated text without any additional commentary, explanations, or formatting.`;
    
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
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      }
    });
    
    const prompt = `Write a thoughtful, inspiring Catholic homily based on today's Mass readings and saint. This should be suitable for a diverse Catholic congregation and demonstrate deep theological understanding.

Today's Mass Readings:
${readings}

Saint of the Day:
${saint}

HOMILY REQUIREMENTS:
1. Length: 500-700 words (appropriate for a 5-7 minute homily)
2. Structure: Opening, 2-3 main points connecting readings to daily life, conclusion with call to action
3. Tone: Warm, pastoral, accessible yet profound
4. Content: 
   - Connect the readings thematically
   - Draw inspiration from the saint's example
   - Provide practical applications for modern Catholic living
   - Address contemporary challenges through the lens of faith
   - Include relevant scriptural insights
   - Maintain orthodox Catholic theology
5. Style: Use inclusive language, avoid overly academic terminology, speak to hearts and minds
6. Conclusion: End with a clear, actionable spiritual challenge or invitation

Write as if you are an experienced parish priest speaking to your congregation with love, wisdom, and pastoral care.`;

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
    return `${saintName}, pray for us. Help us to follow your example of faith and devotion to God. May we live lives of holiness and service to others, just as you did. Through Christ our Lord. Amen.`;
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.6,
        topP: 0.8,
        topK: 30,
      }
    });
    
    const prompt = `Compose a beautiful, reverent Catholic prayer to ${saintName}. This prayer should be suitable for personal devotion and liturgical use.

PRAYER REQUIREMENTS:
1. Length: 3-4 sentences (approximately 50-80 words)
2. Structure: Invocation, petition based on saint's virtues/works, concluding doxology
3. Tone: Reverent, traditional Catholic prayer language
4. Content:
   - Address the saint directly
   - Reference their specific virtues, works, or patronage if known
   - Ask for their intercession
   - Include practical spiritual guidance
   - End with traditional Catholic conclusion
5. Style: Use traditional prayer language ("we beseech thee," "grant that we may," etc.) where appropriate
6. Theology: Maintain proper Catholic understanding of saints' intercession

Create a prayer that could be used in both private devotion and public worship.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const prayer = response.text();
    
    return prayer?.trim() || `${saintName}, pray for us. Help us to follow your example of faith and devotion to God. May we live lives of holiness and service to others, just as you did. Through Christ our Lord. Amen.`;
  } catch (error) {
    console.error('Prayer generation error:', error);
    return `${saintName}, pray for us. Help us to follow your example of faith and devotion to God. May we live lives of holiness and service to others, just as you did. Through Christ our Lord. Amen.`;
  }
}