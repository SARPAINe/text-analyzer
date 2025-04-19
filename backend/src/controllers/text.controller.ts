import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils";
import { textService } from "../services";

const extractUserId = (req: Request): number => {
  if (!req.user) throw new ApiError("User not authenticated", 401);
  return (req.user as { id: number }).id;
};

export const createText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { content } = req.body;
  if (!content) throw new ApiError("Content is required", 400);

  const userId = extractUserId(req);
  const text = await textService.createText(content, userId);

  res.status(201).json(new ApiResponse("Text created successfully", text));
};

export const getAllTexts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const texts = await textService.getAllTexts();
  res.json(new ApiResponse("All texts retrieved", texts));
};

export const getTextById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const text = await textService.getTextById(Number(req.params.id));
  if (!text) throw new ApiError("Text not found", 404);

  const userId = extractUserId(req);
  const id = Number(req.params.id);
  //check if the creator is same
  if (text.creatorId === userId) {
    const content = text.content;
    // Perform analysis
    const result = textService.analyzeText(content);
    res.json(
      new ApiResponse("Text retrieved successfully", {
        report: result,
        text: text,
      })
    );
  } else {
    res.json(new ApiResponse("Text retrieved successfully", text));
  }
};

export const updateText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { content } = req.body;
  if (!content) throw new ApiError("Content is required", 400);

  const text = await textService.updateText(Number(req.params.id), content);
  res.json(new ApiResponse("Text updated successfully", text));
};

export const deleteText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const existing = await textService.getTextById(Number(id));
  if (!existing) throw new ApiError("Text not found", 404);

  await textService.deleteText(Number(id));
  res.json(new ApiResponse("Text deleted successfully"));
};

export const getWordCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const text = await textService.getTextById(Number(req.params.id));
  if (!text) throw new ApiError("Text not found", 404);
  const { wordCount } = textService.analyzeText(text?.content);
  res.json(new ApiResponse("Word count retrieved", { wordCount }));
};

export const getCharacterCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const text = await textService.getTextById(Number(req.params.id));
  if (!text) throw new ApiError("Text not found", 404);

  const { characterCount } = textService.analyzeText(text?.content);
  res.json(new ApiResponse("Character count retrieved", { characterCount }));
};

export const getSentenceCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const text = await textService.getTextById(Number(req.params.id));
  if (!text) throw new ApiError("Text not found", 404);

  const { sentenceCount } = textService.analyzeText(text?.content);
  res.json(new ApiResponse("Sentence count retrieved", { sentenceCount }));
};

export const getParagraphCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const text = await textService.getTextById(Number(req.params.id));
  if (!text) throw new ApiError("Text not found", 404);

  const { paragraphCount } = textService.analyzeText(text?.content);
  res.json(new ApiResponse("Paragraph count retrieved", { paragraphCount }));
};

export const getLongestWord = async (
  req: Request,
  res: Response
): Promise<void> => {
  const text = await textService.getTextById(Number(req.params.id));
  if (!text) throw new ApiError("Text not found", 404);

  const { longestWord } = textService.analyzeText(text?.content);
  res.json(new ApiResponse("Longest word retrieved", { longestWord }));
};
