import { ReadingData } from '@/types/readings';

// Helper function to clean HTML content
function cleanHtmlText(htmlText: string): string {
  if (!htmlText) return '';
  
  return htmlText
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&#x2018;/g, "'")
    .replace(/&#x2019;/g, "'")
    .replace(/&#x201c;/g, '"')
    .replace(/&#x201d;/g, '"')
    .replace(/&#x2010;/g, '–')
    .replace(/&#x2013;/g, '–')
    .replace(/&#x2014;/g, '—')
    .replace(/&#xa9;/g, '©')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchReadings(): Promise<ReadingData> {
  return new Promise<ReadingData>((resolve, reject) => {
    const script = document.createElement('script');
    const uniqueCallbackName = 'universalisCallback';

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;
    const url = `https://universalis.com/United.States/${formattedDate}/jsonpmass.js`;

    script.src = `${url}?callback=${uniqueCallbackName}`;

    // Define the callback function with the type `ReadingData`
    (window as any)[uniqueCallbackName] = (data: ReadingData) => {
      // Clean up the HTML content in all readings
      const cleanedData: ReadingData = {
        ...data,
        Mass_R1: {
          source: data.Mass_R1.source,
          text: cleanHtmlText(data.Mass_R1.text)
        },
        Mass_Ps: {
          source: data.Mass_Ps.source,
          text: cleanHtmlText(data.Mass_Ps.text)
        },
        Mass_GA: {
          source: data.Mass_GA.source,
          text: cleanHtmlText(data.Mass_GA.text)
        },
        Mass_G: {
          source: data.Mass_G.source,
          text: cleanHtmlText(data.Mass_G.text)
        },
        copyright: {
          text: cleanHtmlText(data.copyright.text)
        }
      };

      // Handle optional second reading
      if (data.Mass_R2) {
        cleanedData.Mass_R2 = {
          source: data.Mass_R2.source,
          text: cleanHtmlText(data.Mass_R2.text)
        };
      }

      resolve(cleanedData);
      // Clean up: remove the script and callback
      delete (window as any)[uniqueCallbackName];
      document.body.removeChild(script);
    };

    // Handle JSONP script loading errors
    script.onerror = () => {
      reject(new Error(`JSONP request to ${url} failed`));
      delete (window as any)[uniqueCallbackName];
      document.body.removeChild(script);
    };

    document.body.appendChild(script);
  });
}