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

export const getTextById = async (id: number) => {
  return await Text.findByPk(id);
};

export const updateText = async (
  id: number,
  newTitle: string,
  newContent: string,
  creatorId: number
) => {
  const text = await getTextById(id);
  if (!text) throw new ApiError("Text not found", 404);
  if (text.creatorId !== creatorId) throw new ApiError("Unauthorized", 403);

  text.set({ title: newTitle ?? text.title, content: newContent });
  return await text.save();
};

export const deleteText = async (id: number, creatorId: number) => {
  const text = await getTextById(id);
  if (!text) throw new ApiError("Text not found", 404);
  if (text.creatorId !== creatorId) throw new ApiError("Unauthorized", 403);

  await Text.destroy({ where: { id } });
};

export const analyzeText = (content: string) => {
  const cleaned = content.trim();

  const getWords = () =>
    cleaned
      .replace(/[.,!?;:()]/g, "")
      .split(/\s+/)
      .filter(Boolean);

  const getWordCount = () => getWords().length;

  const getCharacterCount = () => cleaned.replace(/\s+/g, "").length;

  const getSentenceCount = () => cleaned.split(/[.]+/).filter(Boolean).length;

  const getParagraphCount = () => cleaned.split(/\n+/).filter(Boolean).length;

  const getLongestWord = () =>
    getWords().reduce(
      (longest, word) => (word.length > longest.length ? word : longest),
      ""
    );

  return {
    getWordCount,
    getCharacterCount,
    getSentenceCount,
    getParagraphCount,
    getLongestWord,
  };
};
