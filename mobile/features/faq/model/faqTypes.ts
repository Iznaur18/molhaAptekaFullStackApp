export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqSection = {
  id: string;
  title: string;
  items: FaqItem[];
};
