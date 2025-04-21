import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils";
import { textService } from "../services";
import cache from "../utils/cache";
import { convertCamelCaseToReadableFormat } from "../utils/helper";

const CACHE_TTL_SECONDS = 60;

const extractUserId = (req: Request): number => {
  if (!req.user) throw new ApiError("User not authenticated", 401);
  return (req.user as { id: number }).id;
};

const handleCachedResponse = (
  res: Response,
  key: string,
  successMessage: string
) => {
  const cached = cache.get(key);
  if (cached) {
    return res.json(new ApiResponse(`${successMessage} (cached)`, cached));
  }
};

export const createText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { content, title } = req.body;
  const userId = extractUserId(req);
  const text = await textService.createText(title, content, userId);

  cache.del("texts:all");
  res.status(201).json(new ApiResponse("Text created successfully", text));
};

export const getAllTexts = async (
  _req: Request,
  res: Response
): Promise<any> => {
  const cacheKey = "texts:all";
  const cached = cache.get(cacheKey);
  if (cached)
    return res.json(new ApiResponse("All texts retrieved (cached)", cached));

  const texts = await textService.getAllTexts();
  cache.set(cacheKey, texts, CACHE_TTL_SECONDS);
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
  if (cached)
    return res.json(
      new ApiResponse("Text retrieved successfully (cached)", cached)
    );

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

  const updatedText = await textService.updateText(
    textId,
    title,
    content,
    extractUserId(req)
  );

  invalidateTextCaches(textId);
  res.json(new ApiResponse("Text updated successfully", updatedText));
};

export const deleteText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const textId = Number(req.params.id);

  await textService.deleteText(textId, extractUserId(req));
  invalidateTextCaches(textId);
  res.json(new ApiResponse("Text deleted successfully"));
};

const makeStatHandler = (
  type:
    | "wordCount"
    | "characterCount"
    | "sentenceCount"
    | "paragraphCount"
    | "longestWord",
  methodName: keyof ReturnType<typeof textService.analyzeText>
) => {
  return async (req: Request, res: Response) => {
    const textId = Number(req.params.id);
    const cacheKey = `text:${textId}:${type}`;

    const cached = cache.get(cacheKey);
    if (cached)
      return res.json(
        new ApiResponse(
          `${convertCamelCaseToReadableFormat(type)} retrieved (cached)`,
          cached
        )
      );

    const text = await textService.getTextById(textId);
    if (!text) throw new ApiError("Text not found", 404);

    const result = textService.analyzeText(text.content)[methodName]();
    const data = { [type]: result };

    cache.set(cacheKey, data);
    res.json(
      new ApiResponse(
        `${convertCamelCaseToReadableFormat(type)} retrieved`,
        data
      )
    );
  };
};

export const getWordCount = makeStatHandler("wordCount", "getWordCount");
export const getCharacterCount = makeStatHandler(
  "characterCount",
  "getCharacterCount"
);
export const getSentenceCount = makeStatHandler(
  "sentenceCount",
  "getSentenceCount"
);
export const getParagraphCount = makeStatHandler(
  "paragraphCount",
  "getParagraphCount"
);
export const getLongestWord = makeStatHandler("longestWord", "getLongestWord");

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
  keys.forEach((key) => cache.del(key));
};
