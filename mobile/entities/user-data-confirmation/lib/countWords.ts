export const countWords = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;
