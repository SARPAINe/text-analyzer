import { Text } from "../models";
import { ApiError } from "../utils";

export const createText = async (
  title: string,
  content: string,
  creatorId: number
) => {
  return await Text.create({ title, content, creatorId });
};

export const getAllTexts = async () => {
  return await Text.findAll();
};

export const getTextById = async (id: number): Promise<Text | null> => {
  return await Text.findByPk(id);
};

export const updateText = async (
  id: number,
  newTitle: string,
  newContent: string,
  creatorId: number
) => {
  const text = await Text.findByPk(id);
  if (!text) throw new ApiError("Text not found", 404);

  if (text.creatorId !== creatorId) {
    throw new ApiError("You are not authorized to update this text", 403);
  }

  // Use the old title if newTitle is null
  const updatedTitle = newTitle ?? text.title;

  text.set({ title: updatedTitle, content: newContent });
  return await text.save();
};

export const deleteText = async (id: number, creatorId: number) => {
  const text = await Text.findByPk(id);
  if (!text) throw new ApiError("Text not found", 404);

  if (text.creatorId !== creatorId) {
    throw new ApiError("You are not authorized to delete this text", 403);
  }
  await Text.destroy({ where: { id } });
};

export const analyzeText = (content: string) => {
  const cleaned = content.trim();

  const getWordCount = () => {
    const cleanedForWords = cleaned.replace(/[.,!?;:()]/g, "");
    const words = cleanedForWords.length ? cleanedForWords.split(/\s+/) : [];
    return words.length;
  };

  const getCharacterCount = () => {
    return cleaned.replace(/\s+/g, "").length;
  };

  const getSentenceCount = () => {
    const sentences = cleaned.split(/[.]+/).filter(Boolean);
    return sentences.length;
  };

  const getParagraphCount = () => {
    const paragraphs = cleaned.split(/\n+/).filter(Boolean);
    return paragraphs.length;
  };

  const getLongestWord = () => {
    const cleanedForWords = cleaned.replace(/[.,!?;:()]/g, "");
    const words = cleanedForWords.length ? cleanedForWords.split(/\s+/) : [];
    return words.reduce(
      (longest, word) => (word.length > longest.length ? word : longest),
      ""
    );
  };

  return {
    getWordCount,
    getCharacterCount,
    getSentenceCount,
    getParagraphCount,
    getLongestWord,
  };
};
