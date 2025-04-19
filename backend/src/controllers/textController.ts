import { Request, Response } from "express";
import { TextService } from "../services/textService";

class TextController {
  private textService: TextService;

  constructor() {
    this.textService = new TextService();
  }

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
