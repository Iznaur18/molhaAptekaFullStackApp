import * as Clipboard from "expo-clipboard";

export const copyTextToClipboard = async (text: string): Promise<void> => {
  try {
    await Clipboard.setStringAsync(text);
  } catch (error) {
    throw error instanceof Error ? error : new Error("Clipboard write failed");
  }
};
