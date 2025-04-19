import { Text } from "../models";

export const createText = async (content: string) => {
  return await Text.create({ content });
};

export const getTextById = async (id: number): Promise<string | null> => {
  const textEntry = await Text.findByPk(id);
  return textEntry ? textEntry.content : null;
};

export const updateText = async (
  id: number,
  newContent: string
): Promise<void> => {
  await Text.update({ content: newContent }, { where: { id } });
};

export const deleteText = async (id: number): Promise<void> => {
  await Text.destroy({ where: { id } });
};

export const analyzeText = (content: string) => {
  const words = content.toLowerCase().trim().split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  const paragraphs = content.split(/\n+/).filter(Boolean);
  const longestWord = words.reduce(
    (longest, word) => (word.length > longest.length ? word : longest),
    ""
  );

  return {
    wordCount: words.length,
    characterCount: content.replace(/\s+/g, "").length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    longestWord,
  };
};
