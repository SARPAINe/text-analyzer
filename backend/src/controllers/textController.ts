import { Request, Response } from "express";
import { TextService } from "../services/textService";
import Text from "../models/textModel";
import { ApiError } from "../utils/apiError";

class TextController {
  private textService: TextService;

  constructor() {
    this.textService = new TextService();
  }

  public createText = async (req: Request, res: Response): Promise<void> => {
    const { content } = req.body;
    if (!content) {
      throw new ApiError("Content is required", 400);
    } else {
      const text = await this.textService.createText(content);
      res
        .status(201)
        .json({ message: "Text created successfully", text: text });
    }
  };

  public getWordCount = (req: Request, res: Response): void => {
    const text = req.body.text;
    const { wordCount } = this.textService.analyzeText(text);
    res.json({ wordCount });
  };

  public getCharacterCount = (req: Request, res: Response): void => {
    const text = req.body.text;
    const { characterCount } = this.textService.analyzeText(text);
    res.json({ characterCount });
  };

  public getSentenceCount = (req: Request, res: Response): void => {
    const text = req.body.text;
    const { sentenceCount } = this.textService.analyzeText(text);
    res.json({ sentenceCount });
  };

  public getParagraphCount = (req: Request, res: Response): void => {
    const text = req.body.text;
    const { paragraphCount } = this.textService.analyzeText(text);
    res.json({ paragraphCount });
  };

  public getLongestWord = (req: Request, res: Response): void => {
    const text = req.body.text;
    const { longestWord } = this.textService.analyzeText(text);
    res.json({ longestWord });
  };
}

export default TextController;
