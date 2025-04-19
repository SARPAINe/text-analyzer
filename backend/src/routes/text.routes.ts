import { textController } from "../controllers";
import { Router } from "express";

const router = Router();

// router.post("/analyze", textController.analyzeText);
router.post("/", textController.createText);
router.get("/", textController.getAllTexts);
router.get("/:id", textController.getTextById);
router.patch("/:id", textController.updateText);
router.delete("/:id", textController.deleteText);
router.get("/word-count/:id", textController.getWordCount);
router.get("/character-count/:id", textController.getCharacterCount);
router.get("/sentence-count/:id", textController.getSentenceCount);
router.get("/paragraph-count/:id", textController.getParagraphCount);
router.get("/longest-word/:id", textController.getLongestWord);

export default router;
