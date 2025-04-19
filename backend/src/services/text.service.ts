import { Text } from "../models";
import { ApiError } from "../utils";

export const createText = async (content: string, creatorId: number) => {
  return await Text.create({ content, creatorId });
};

export const getAllTexts = async () => {
  return await Text.findAll();
};

export const getTextById = async (id: number): Promise<Text | null> => {
  return await Text.findByPk(id);
};

export const updateText = async (id: number, newContent: string) => {
  const text = await Text.findByPk(id);
  if (!text) throw new ApiError("Text not found", 404);

  text.set({ content: newContent });
  return await text.save();
};

export const deleteText = async (id: number) => {
  await Text.destroy({ where: { id } });
};

export const analyzeText = (content: string) => {
  const cleaned = content.trim();
  const words = cleaned.length ? cleaned.split(/\s+/) : [];
  const sentences = cleaned.split(/[.]+/).filter(Boolean);
  const paragraphs = cleaned.split(/\n+/).filter(Boolean);
  const longestWord = words.reduce(
    (longest, word) => (word.length > longest.length ? word : longest),
    ""
  );

  return {
    wordCount: words.length,
    characterCount: cleaned.replace(/\s+/g, "").length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    longestWord,
  };
};
