import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils";
import { textService } from "../services";
import cache from "../utils/cache";

const extractUserId = (req: Request): number => {
  if (!req.user) throw new ApiError("User not authenticated", 401);
  return (req.user as { id: number }).id;
};

export const createText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { content, title } = req.body;
  if (!content) throw new ApiError("Content is required", 400);

  const userId = extractUserId(req);
  const text = await textService.createText(title, content, userId);

  cache.del("texts:all"); // Invalidate cache
  res.status(201).json(new ApiResponse("Text created successfully", text));
};

export const getAllTexts = async (
  _req: Request,
  res: Response
): Promise<any> => {
  const cacheKey = "texts:all";
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(new ApiResponse("All texts retrieved (cached)", cached));
  }

  const texts = await textService.getAllTexts();
  cache.set(cacheKey, texts, 60);
  res.json(new ApiResponse("All texts retrieved", texts));
};

export const getTextById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const textId = Number(req.params.id);
  const userId = extractUserId(req);
  const text = await textService.getTextById(textId);

  if (!text) throw new ApiError("Text not found", 404);

  const isOwner = text.creatorId === userId;
  const cacheKey = isOwner ? `text:${textId}:owner` : `text:${textId}:viewer`;

  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(
      new ApiResponse("Text retrieved successfully (cached)", cached)
    );
  }

  if (isOwner) {
    const {
      getCharacterCount,
      getLongestWord,
      getParagraphCount,
      getSentenceCount,
      getWordCount,
    } = textService.analyzeText(text.content);
    const responseData = {
      report: {
        wordCount: getWordCount(),
        characterCount: getCharacterCount(),
        sentenceCount: getSentenceCount(),
        paragraphCount: getParagraphCount(),
        longestWord: getLongestWord(),
      },
      text,
    };
    cache.set(cacheKey, responseData);
    res.json(new ApiResponse("Text retrieved successfully", responseData));
  } else {
    cache.set(cacheKey, text);
    res.json(new ApiResponse("Text retrieved successfully", text));
  }
};

export const updateText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const textId = Number(req.params.id);
  const { content, title } = req.body;
  if (!content) throw new ApiError("Content is required", 400);

  const updatedText = await textService.updateText(
    textId,
    title,
    content,
    extractUserId(req)
  );

  invalidateTextCaches(textId); // Invalidate related cache
  res.json(new ApiResponse("Text updated successfully", updatedText));
};

export const deleteText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const textId = Number(req.params.id);

  const existing = await textService.getTextById(textId);
  if (!existing) throw new ApiError("Text not found", 404);

  await textService.deleteText(textId, extractUserId(req));
  invalidateTextCaches(textId); // Invalidate related cache
  res.json(new ApiResponse("Text deleted successfully"));
};

export const getWordCount = async (
  req: Request,
  res: Response
): Promise<any> => {
  const textId = Number(req.params.id);
  const cacheKey = `text:${textId}:wordCount`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.json(new ApiResponse("Word count retrieved (cached)", cached));
  }

  const text = await textService.getTextById(textId);
  if (!text) throw new ApiError("Text not found", 404);

  const wordCount = textService.analyzeText(text.content).getWordCount();
  const data = { wordCount };

  cache.set(cacheKey, data);
  res.json(new ApiResponse("Word count retrieved", data));
};

export const getCharacterCount = async (
  req: Request,
  res: Response
): Promise<any> => {
  const textId = Number(req.params.id);
  const cacheKey = `text:${textId}:characterCount`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.json(
      new ApiResponse("Character count retrieved (cached)", cached)
    );
  }

  const text = await textService.getTextById(textId);
  if (!text) throw new ApiError("Text not found", 404);

  const characterCount = textService
    .analyzeText(text.content)
    .getCharacterCount();
  const data = { characterCount };

  cache.set(cacheKey, data);
  res.json(new ApiResponse("Character count retrieved", data));
};

export const getSentenceCount = async (
  req: Request,
  res: Response
): Promise<any> => {
  const textId = Number(req.params.id);
  const cacheKey = `text:${textId}:sentenceCount`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.json(
      new ApiResponse("Sentence count retrieved (cached)", cached)
    );
  }

  const text = await textService.getTextById(textId);
  if (!text) throw new ApiError("Text not found", 404);

  const sentenceCount = textService
    .analyzeText(text.content)
    .getSentenceCount();
  const data = { sentenceCount };

  cache.set(cacheKey, data);
  res.json(new ApiResponse("Sentence count retrieved", data));
};

export const getParagraphCount = async (
  req: Request,
  res: Response
): Promise<any> => {
  const textId = Number(req.params.id);
  const cacheKey = `text:${textId}:paragraphCount`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.json(
      new ApiResponse("Paragraph count retrieved (cached)", cached)
    );
  }

  const text = await textService.getTextById(textId);
  if (!text) throw new ApiError("Text not found", 404);

  const paragraphCount = textService
    .analyzeText(text.content)
    .getParagraphCount();
  const data = { paragraphCount };

  cache.set(cacheKey, data);
  res.json(new ApiResponse("Paragraph count retrieved", data));
};

export const getLongestWord = async (
  req: Request,
  res: Response
): Promise<any> => {
  const textId = Number(req.params.id);
  const cacheKey = `text:${textId}:longestWord`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.json(new ApiResponse("Longest word retrieved (cached)", cached));
  }

  const text = await textService.getTextById(textId);
  if (!text) throw new ApiError("Text not found", 404);

  const longestWord = textService.analyzeText(text.content).getLongestWord();
  const data = { longestWord };

  cache.set(cacheKey, data);
  res.json(new ApiResponse("Longest word retrieved", data));
};

// 🔁 Cache invalidation utility
const invalidateTextCaches = (textId: number): void => {
  const keys = [
    "texts:all",
    `text:${textId}:owner`,
    `text:${textId}:viewer`,
    `text:${textId}:wordCount`,
    `text:${textId}:characterCount`,
    `text:${textId}:sentenceCount`,
    `text:${textId}:paragraphCount`,
    `text:${textId}:longestWord`,
  ];
  keys.forEach(cache.del);
};
