import { Request, Response } from "express";
import { ApiError } from "../utils";
import { textService } from "../services";

export const createText = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError("Content is required", 400);
  }

  const text = await textService.createText(content);
  res.status(201).json({ message: "Text created successfully", text });
};

export const getWordCount = (req: Request, res: Response): void => {
  const text = req.body.text;
  const { wordCount } = textService.analyzeText(text);
  res.json({ wordCount });
};

export const getCharacterCount = (req: Request, res: Response): void => {
  const text = req.body.text;
  const { characterCount } = textService.analyzeText(text);
  res.json({ characterCount });
};

export const getSentenceCount = (req: Request, res: Response): void => {
  const text = req.body.text;
  const { sentenceCount } = textService.analyzeText(text);
  res.json({ sentenceCount });
};

export const getParagraphCount = (req: Request, res: Response): void => {
  const text = req.body.text;
  const { paragraphCount } = textService.analyzeText(text);
  res.json({ paragraphCount });
};

export const getLongestWord = (req: Request, res: Response): void => {
  const text = req.body.text;
  const { longestWord } = textService.analyzeText(text);
  res.json({ longestWord });
};
