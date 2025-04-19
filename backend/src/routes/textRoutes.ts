import { Router } from "express";
import TextController from "../controllers/textController";

const router = Router();
const textController = new TextController();

// router.post("/analyze", textController.analyzeText);
router.get("/word-count/:id", textController.getWordCount);
router.get("/character-count/:id", textController.getCharacterCount);
router.get("/sentence-count/:id", textController.getSentenceCount);
router.get("/paragraph-count/:id", textController.getParagraphCount);
router.get("/longest-word/:id", textController.getLongestWord);

export default router;
