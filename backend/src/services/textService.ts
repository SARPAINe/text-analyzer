import TextModel from "../models/textModel";

export class TextService {
  private textModel: typeof TextModel;

  constructor() {
    this.textModel = TextModel;
  }

  public async createText(content: string): Promise<void> {
    await this.textModel.create({ content });
  }

  public async getTextById(id: number): Promise<string | null> {
    const textEntry = await this.textModel.findByPk(id);
    return textEntry ? textEntry.content : null;
  }

  public async updateText(id: number, newContent: string): Promise<void> {
    await this.textModel.update({ content: newContent }, { where: { id } });
  }

  public async deleteText(id: number): Promise<void> {
    await this.textModel.destroy({ where: { id } });
  }

  public analyzeText(content: string) {
    const words = content.toLowerCase().trim().split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    const paragraphs = content.split(/\n+/).filter(Boolean);
    const longestWord = words.reduce(
      (longest, word) => (word.length > longest.length ? word : longest),
      ""
    );

    return {
      wordCount: words.length,
      characterCount: content.replace(/\s+/g, "").length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      longestWord,
    };
  }
}
