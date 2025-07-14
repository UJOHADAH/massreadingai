import { Saint } from '@/types/readings';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export async function fetchSaintOfTheDay(): Promise<Saint> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found. Using default saint data.');
    return getDefaultSaint();
  }

  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' });
  const day = today.getDate();

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate information about the Catholic saint celebrated on ${month} ${day}. If there are multiple saints, choose the most prominent one. Please provide the response in this exact JSON format:

{
  "name": "Saint Name",
  "feast": "Type of feast (Memorial, Optional Memorial, Feast, Solemnity)",
  "description": "Brief description of who they were",
  "biography": "Detailed biography (2-3 paragraphs) about their life, works, and significance in Catholic tradition"
}

Make sure the biography is informative and inspiring, suitable for Catholic devotion.`
          }]
        }]
      })
    });

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (responseText) {
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const saintData = JSON.parse(jsonMatch[0]);
          return {
            name: saintData.name || 'Saint of the Day',
            feast: saintData.feast || 'Memorial',
            description: saintData.description || 'A holy person who lived a life of virtue',
            biography: saintData.biography || 'This saint lived a life dedicated to God and serves as an example for all Christians.'
          };
        }
      } catch (parseError) {
        console.error('Error parsing saint data:', parseError);
      }
    }
    
    return getDefaultSaint();
  } catch (error) {
    console.error('Error fetching saint data:', error);
    return getDefaultSaint();
  }
}

function getDefaultSaint(): Saint {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  // Some common saints for fallback
  const commonSaints: { [key: string]: Saint } = {
    '01-01': {
      name: 'Mary, Mother of God',
      feast: 'Solemnity',
      description: 'The Blessed Virgin Mary, Mother of God',
      biography: 'Mary, the Mother of Jesus, is venerated as the Mother of God. This solemnity celebrates her divine motherhood and her role in salvation history. She is the perfect model of faith and discipleship, having said "yes" to God\'s plan for salvation. Through her intercession, countless faithful have found comfort and guidance on their spiritual journey.'
    },
    '01-02': {
      name: 'Saints Basil the Great and Gregory Nazianzen',
      feast: 'Memorial',
      description: 'Bishops and Doctors of the Church',
      biography: 'Two great Cappadocian Fathers who defended the faith against Arianism and contributed significantly to Christian theology. Saint Basil the Great was known for his monastic rule and care for the poor, while Saint Gregory Nazianzen was renowned for his eloquent theological orations. Together, they helped shape the understanding of the Trinity and the divinity of Christ in the early Church.'
    },
    '12-25': {
      name: 'The Nativity of the Lord',
      feast: 'Solemnity',
      description: 'The Birth of Jesus Christ',
      biography: 'Today we celebrate the birth of our Lord and Savior Jesus Christ. This is the central mystery of our faith - that God became man to save us from sin and death. The Incarnation represents God\'s infinite love for humanity, as He chose to enter our world as a vulnerable child born in Bethlehem. This feast reminds us that God is Emmanuel, "God with us," forever changing the course of human history.'
    }
  };

  const dateKey = `${month}-${day}`;
  return commonSaints[dateKey] || {
    name: 'Saint of the Day',
    feast: 'Optional Memorial',
    description: 'A holy person who lived a life of virtue',
    biography: 'Today we remember the saints who have gone before us, showing us the path to holiness through their example of faith, hope, and love. Every saint was once a sinner who chose to follow Christ with their whole heart. They remind us that holiness is not reserved for a few, but is the universal call of all Christians. Through their intercession and example, may we too strive for sanctity in our daily lives.'
  };
}