import { ReadingData } from '@/types/readings';

// Enhanced HTML cleaning function
function cleanHtmlText(htmlText: string): string {
  if (!htmlText) return '';
  
  return htmlText
    // Remove HTML tags and their content for specific elements
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<div[^>]*style="text-indent:[^"]*"[^>]*>/gi, '')
    .replace(/<\/div>/gi, '')
    // Remove all HTML tags
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
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // Clean up formatting artifacts
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    // Remove common formatting patterns
    .replace(/^\s*[-•]\s*/gm, '')
    .replace(/^\s*\d+\.\s*/gm, '')
    // Clean up verse numbers and references
    .replace(/\s*\[\d+\]\s*/g, ' ')
    .replace(/\s*\(\d+\)\s*/g, ' ')
    // Final cleanup
    .trim()
    // Ensure proper sentence spacing
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
    // Remove extra spaces around punctuation
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,.;:!?])\s+/g, '$1 ');
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