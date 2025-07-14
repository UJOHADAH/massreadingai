export interface ReadingData {
  date: string;
  day: string;
  Mass_R1: { source: string; text: string };
  Mass_Ps: { source: string; text: string };
  Mass_R2?: { source: string; text: string };
  Mass_GA: { source: string; text: string };
  Mass_G: { source: string; text: string };
  copyright: { text: string };
}

export interface Saint {
  name: string;
  feast: string;
  description: string;
  biography: string;
}

export interface Homily {
  title: string;
  content: string;
  author: string;
  date: string;
}