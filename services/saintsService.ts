import { Saint } from '@/types/readings';

// Sample saints data - in a real app, this would come from an API
const saintsData: { [key: string]: Saint } = {
  '01-01': {
    name: 'Mary, Mother of God',
    feast: 'Solemnity',
    description: 'The Blessed Virgin Mary, Mother of God',
    biography: 'Mary, the Mother of Jesus, is venerated as the Mother of God. This solemnity celebrates her divine motherhood and her role in salvation history.'
  },
  '01-02': {
    name: 'Saints Basil the Great and Gregory Nazianzen',
    feast: 'Memorial',
    description: 'Bishops and Doctors of the Church',
    biography: 'Two great Cappadocian Fathers who defended the faith against Arianism and contributed significantly to Christian theology.'
  },
  // Add more saints as needed
};

export async function fetchSaintOfTheDay(): Promise<Saint> {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateKey = `${month}-${day}`;

  // Return saint for today or a default
  return saintsData[dateKey] || {
    name: 'Saint of the Day',
    feast: 'Optional Memorial',
    description: 'A holy person who lived a life of virtue',
    biography: 'Today we remember the saints who have gone before us, showing us the path to holiness through their example of faith, hope, and love.'
  };
}