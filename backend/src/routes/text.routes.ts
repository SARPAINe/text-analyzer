import Joi from "joi";
import { textController } from "../controllers";
import { Router } from "express";
import { validate } from "../middlewares";

const router = Router();

// Joi schema for text validation
const textSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().label("Title"),
  content: Joi.string().min(10).required().label("Content"),
});
const textUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(255).label("Title"),
  content: Joi.string().min(10).required().label("Content"),
});
const idSchema = Joi.object({
  id: Joi.number().integer().required().label("ID"),
});

router.post("/", validate(textSchema, "body"), textController.createText);
router.get("/", textController.getAllTexts);
router.get("/:id", validate(idSchema, "params"), textController.getTextById);
router.patch(
  "/:id",
  validate(textUpdateSchema, "body"),
  validate(idSchema, "params"),
  textController.updateText
);
router.delete("/:id", validate(idSchema, "params"), textController.deleteText);
router.get(
  "/word-count/:id",
  validate(idSchema, "params"),
  textController.getWordCount
);
router.get(
  "/character-count/:id",
  validate(idSchema, "params"),
  textController.getCharacterCount
);
router.get(
  "/sentence-count/:id",
  validate(idSchema, "params"),
  textController.getSentenceCount
);
router.get(
  "/paragraph-count/:id",
  validate(idSchema, "params"),
  textController.getParagraphCount
);
router.get(
  "/longest-word/:id",
  validate(idSchema, "params"),
  textController.getLongestWord
);

export default router;
