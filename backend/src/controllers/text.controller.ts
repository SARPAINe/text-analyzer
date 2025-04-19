import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils";
import { textService } from "../services";

export const createText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { content } = req.body;
  if (!content) throw new ApiError("Content is required", 400);

  const text = await textService.createText(content);
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
  const { id } = req.params;
  const text = await textService.getTextById(Number(id));
  if (!text) throw new ApiError("Text not found", 404);

  res.json(new ApiResponse("Text retrieved successfully", text));
};

export const updateText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) throw new ApiError("Content is required", 400);

  const text = await textService.updateText(Number(id), content);
  res.json(new ApiResponse("Text updated successfully", text));
};

export const deleteText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const text = await textService.getTextById(Number(id));

  if (!text) throw new ApiError("Text not found", 404);

  await textService.deleteText(Number(id));
  res.json(new ApiResponse("Text deleted successfully"));
};

export const getWordCount = (req: Request, res: Response): void => {
  const { wordCount } = textService.analyzeText(req.body.content);
  res.json(new ApiResponse("Word count retrieved", { wordCount }));
};

export const getCharacterCount = (req: Request, res: Response): void => {
  const { characterCount } = textService.analyzeText(req.body.content);
  res.json(new ApiResponse("Character count retrieved", { characterCount }));
};

export const getSentenceCount = (req: Request, res: Response): void => {
  const { sentenceCount } = textService.analyzeText(req.body.content);
  res.json(new ApiResponse("Sentence count retrieved", { sentenceCount }));
};

export const getParagraphCount = (req: Request, res: Response): void => {
  const { paragraphCount } = textService.analyzeText(req.body.content);
  res.json(new ApiResponse("Paragraph count retrieved", { paragraphCount }));
};

export const getLongestWord = (req: Request, res: Response): void => {
  const { longestWord } = textService.analyzeText(req.body.content);
  res.json(new ApiResponse("Longest word retrieved", { longestWord }));
};
