import { ApiError } from "../utils";
import { Text } from "../models";

export const createText = async (content: string) => {
  return await Text.create({ content });
};

export const getAllTexts = async () => {
  return await Text.findAll();
};

export const getTextById = async (id: number): Promise<Text | null> => {
  const text = await Text.findByPk(id);
  return text;
};

export const updateText = async (
  id: number,
  newContent: string
): Promise<Text> => {
  let text = await Text.findByPk(id);
  if (!text) throw new ApiError("Text not found", 404);
  text?.set({ content: newContent });
  await text.save();
  return text;
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
